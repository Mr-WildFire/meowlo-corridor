#!/usr/bin/env python3
"""Generate short placeholder SFX as WAV files.

These are intentionally simple synthesized cues for testing the native
AudioSource path before real SFX are available.

Run:
    python tools/gen_placeholder_sfx.py
Output:
    assets/resources/audio/sfx/*.wav
"""

from __future__ import annotations

import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "resources" / "audio" / "sfx"
SR = 22050


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


def tone(buf: np.ndarray, start: float, dur: float, freq: float, amp: float,
         attack: float = 0.005, release: float = 0.08, harmonic: float = 0.0) -> None:
    i = int(start * SR)
    n = int(dur * SR)
    if i >= len(buf) or n <= 0:
        return
    n = min(n, len(buf) - i)
    t = np.arange(n) / SR
    wave = np.sin(2 * np.pi * freq * t)
    if harmonic:
        wave += harmonic * np.sin(2 * np.pi * freq * 2 * t)
    buf[i:i + n] += wave * env(n, attack, release) * amp


def normalize(x: np.ndarray, peak: float = 0.75) -> np.ndarray:
    m = float(np.max(np.abs(x)))
    return x if m < 1e-9 else x * (peak / m)


def wav(name: str, data: np.ndarray) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    pcm = np.clip(normalize(data), -1.0, 1.0)
    pcm = (pcm * 32767.0).astype("<i2")
    path = OUT / name
    with wave.open(str(path), "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes(pcm.tobytes())
    print(path.name, len(pcm) * 2, "bytes")


def click() -> np.ndarray:
    n = int(0.07 * SR)
    out = np.zeros(n)
    tone(out, 0.0, 0.07, 1250, 0.6, 0.001, 0.06, 0.2)
    return out


def pickup() -> np.ndarray:
    n = int(0.42 * SR)
    out = np.zeros(n)
    for i, f in enumerate((659.25, 880.0, 1318.5)):
        tone(out, i * 0.09, 0.28, f, 0.45, 0.003, 0.20, 0.25)
    return out


def win() -> np.ndarray:
    n = int(1.8 * SR)
    out = np.zeros(n)
    for i, f in enumerate((293.66, 369.99, 440.0, 587.33, 739.99, 880.0)):
        tone(out, i * 0.11, 1.2, f, 0.24, 0.01, 0.9, 0.15)
    tone(out, 0.0, 1.6, 146.83, 0.22, 0.01, 1.2)
    return out


def timeout() -> np.ndarray:
    n = int(1.25 * SR)
    out = np.zeros(n)
    for i, f in enumerate((392.0, 311.13, 233.08, 155.56)):
        tone(out, i * 0.16, 0.6, f, 0.4, 0.004, 0.5, 0.2)
    return out


def step() -> np.ndarray:
    n = int(0.07 * SR)
    out = np.zeros(n)
    tone(out, 0.0, 0.07, 130, 0.25, 0.001, 0.06)
    return out


def main() -> None:
    wav("sfx_click.wav", click())
    wav("sfx_pickup.wav", pickup())
    wav("sfx_win.wav", win())
    wav("sfx_timeout.wav", timeout())
    wav("sfx_step.wav", step())
    print(f"placeholder SFX written to {OUT}")


if __name__ == "__main__":
    main()
