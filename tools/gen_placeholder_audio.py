#!/usr/bin/env python3
"""Generate placeholder 6-layer music as WAV loops.

This is intentionally simple synthesized music, not final audio. It exists so
the AudioSource pipeline, layer unlocking, 1s silence and climax can be tested
before real OGG assets arrive.

Run:
    python tools/gen_placeholder_audio.py
Output:
    assets/resources/audio/music/*.wav
"""

from __future__ import annotations

import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "resources" / "audio" / "music"
SR = 22050
DURATION = 12.0
BPM = 80
BEAT = 60.0 / BPM
BAR = BEAT * 4
N = int(SR * DURATION)
T = np.arange(N) / SR


def env(n: int, attack: float, release: float) -> np.ndarray:
    a = max(1, int(attack * SR))
    r = max(1, int(release * SR))
    if a + r > n:
        a = max(1, n // 3)
        r = max(1, n - a)
    e = np.ones(n)
    e[:a] = np.linspace(0.0, 1.0, a, endpoint=False)
    e[-r:] = np.linspace(1.0, 0.0, r)
    return e


def add(buf: np.ndarray, start: float, dur: float, freq: float, amp: float,
        kind: str = "sine", attack: float = 0.01, release: float = 0.25) -> None:
    i = int(start * SR)
    n = int(dur * SR)
    if i >= len(buf) or n <= 0:
        return
    n = min(n, len(buf) - i)
    t = np.arange(n) / SR
    if kind == "triangle":
        wave = 2.0 * np.abs(2.0 * ((t * freq) % 1.0) - 1.0) - 1.0
    elif kind == "soft":
        wave = np.sin(2 * np.pi * freq * t) + 0.22 * np.sin(2 * np.pi * freq * 2 * t)
        wave /= 1.22
    else:
        wave = np.sin(2 * np.pi * freq * t)
    buf[i:i + n] += wave * env(n, attack, release) * amp


def add_kick(buf: np.ndarray, start: float, amp: float = 0.4) -> None:
    i = int(start * SR)
    n = int(0.22 * SR)
    if i >= len(buf):
        return
    n = min(n, len(buf) - i)
    t = np.arange(n) / SR
    f = 45.0 + 55.0 * np.exp(-t * 18.0)
    phase = 2 * np.pi * np.cumsum(f) / SR
    buf[i:i + n] += np.sin(phase) * env(n, 0.002, 0.12) * amp


def add_hat(buf: np.ndarray, start: float, amp: float = 0.08) -> None:
    i = int(start * SR)
    n = int(0.045 * SR)
    if i >= len(buf):
        return
    n = min(n, len(buf) - i)
    rng = np.random.default_rng(int(start * 1000) + 7)
    noise = rng.standard_normal(n)
    # cheap high-pass: difference emphasizes the top end
    noise = np.diff(noise, prepend=0.0)
    buf[i:i + n] += noise * env(n, 0.001, 0.035) * amp


def normalize(x: np.ndarray, peak: float = 0.8) -> np.ndarray:
    m = float(np.max(np.abs(x)))
    if m < 1e-9:
        return x
    return x * (peak / m)


def wav(path: Path, data: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    pcm = np.clip(data, -1.0, 1.0)
    pcm = (pcm * 32767.0).astype("<i2")
    with wave.open(str(path), "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes(pcm.tobytes())
    print(path.name, len(pcm) * 2, "bytes")


# D minor: Dm - Bb - F - C
CHORDS = [
    [146.83, 174.61, 220.00],  # D3 F3 A3
    [116.54, 146.83, 174.61],  # Bb2 D3 F3
    [174.61, 220.00, 261.63],  # F3 A3 C4
    [130.81, 164.81, 196.00],  # C3 E3 G3
]
ROOTS = [73.42, 58.27, 87.31, 65.41]  # D2 Bb1 F2 C2
MELODY = [
    [293.66, 349.23, 392.00, 440.00],
    [233.08, 293.66, 349.23, 440.00],
    [349.23, 440.00, 523.25, 440.00],
    [329.63, 392.00, 523.25, 392.00],
]


def build_tracks() -> dict[str, np.ndarray]:
    ambient = np.zeros(N)
    bass = np.zeros(N)
    rhythm = np.zeros(N)
    melody = np.zeros(N)
    harmony = np.zeros(N)
    counter = np.zeros(N)

    for bar in range(4):
        start = bar * BAR
        for j, f in enumerate(CHORDS[bar]):
            add(ambient, start + j * 0.035, BAR * 0.96, f, 0.075, "soft", 0.35, 0.7)
            add(harmony, start + j * 0.05, BAR * 0.8, f * 2.0, 0.035, "sine", 0.12, 0.5)

        add(bass, start, BAR * 0.75, ROOTS[bar], 0.16, "triangle", 0.01, 0.22)
        add(bass, start + BEAT * 2, BAR * 0.45, ROOTS[bar] * 1.5, 0.10, "triangle", 0.01, 0.2)

        for beat in (0, 2):
            add_kick(rhythm, start + beat * BEAT, 0.32)
        for eighth in range(8):
            add_hat(rhythm, start + eighth * BEAT / 2, 0.055 if eighth % 2 else 0.075)

        for j, f in enumerate(MELODY[bar]):
            add(melody, start + j * BEAT, BEAT * 0.72, f, 0.085, "triangle", 0.015, 0.24)

        if bar in (1, 3):
            add(counter, start + BEAT * 2, BAR * 0.35, MELODY[bar][-1] * 2, 0.055, "sine", 0.06, 0.5)

    return {
        "ambient": normalize(ambient, 0.7),
        "bass": normalize(bass, 0.75),
        "rhythm": normalize(rhythm, 0.7),
        "melody": normalize(melody, 0.68),
        "harmony": normalize(harmony, 0.62),
        "counter": normalize(counter, 0.55),
    }


def make_climax() -> np.ndarray:
    n = int(3.2 * SR)
    out = np.zeros(n)
    # D minor add9-ish: D3 F3 A3 D4 F4 A4
    chord = [146.83, 174.61, 220.00, 293.66, 349.23, 440.00]
    t = np.arange(n) / SR
    for i, f in enumerate(chord):
        e = env(n, 0.02, 1.6)
        wave = np.sin(2 * np.pi * f * t) + 0.18 * np.sin(2 * np.pi * f * 2 * t)
        out += wave * e * (0.13 if i < 3 else 0.08)
    # low bell
    e = env(n, 0.01, 1.2)
    out += np.sin(2 * np.pi * 73.42 * t) * e * 0.16
    return normalize(out, 0.9)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, data in build_tracks().items():
        wav(OUT / f"music_{name}.wav", data)
    wav(OUT / "music_climax.wav", make_climax())


if __name__ == "__main__":
    main()
