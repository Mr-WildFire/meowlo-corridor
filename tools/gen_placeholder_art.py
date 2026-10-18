#!/usr/bin/env python3
"""Generate placeholder art for the Meowlo Corridor gameplay skeleton.

These are deliberately simple flat-vector placeholders, not final art.
Run from the project root:
    python tools/gen_placeholder_art.py
Output:
    assets/resources/art/...
"""

from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "resources" / "art"

INK = (42, 28, 24, 255)
CREAM = (243, 231, 211, 255)
ORANGE = (232, 150, 74, 255)
ORANGE_LIGHT = (246, 191, 121, 255)
ORANGE_DARK = (166, 92, 44, 255)
GREEN = (118, 178, 126, 255)
PINK = (221, 143, 132, 255)
CYAN = (143, 211, 214, 255)
ROSE = (201, 106, 122, 255)
AMBER = (242, 179, 92, 255)
MINT = (159, 224, 192, 255)
PURPLE = (120, 92, 150, 255)
GRAY = (110, 118, 132, 255)


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def save(img: Image.Image, rel: str) -> None:
    path = OUT / rel
    ensure_dir(path.parent)
    img.save(path, "PNG", optimize=True)


def glow(draw: ImageDraw.ImageDraw, cx: int, cy: int, r: int, color: tuple[int, int, int], layers: int = 6) -> None:
    for i in range(layers, 0, -1):
        rr = int(r * i / layers)
        alpha = int(10 + 34 * (1 - i / layers))
        draw.ellipse((cx - rr, cy - rr, cx + rr, cy + rr), fill=(*color, alpha))


def rounded(draw: ImageDraw.ImageDraw, box, radius: int, fill, outline=None, width: int = 0) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def draw_cat(direction: str, frame: int) -> Image.Image:
    s = 512
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")

    bob = (0, 4, 0, 3)[frame]
    leg_shift = (-10, 8, 10, -8)[frame]
    tail_shift = (10, -6, -10, 6)[frame]

    # Shadow
    d.ellipse((120, 430, 392, 476), fill=(0, 0, 0, 70))

    if direction == "up":
        # Tail behind, body, back of head.
        d.line(
            [(330, 340), (410, 300 + tail_shift), (430, 220 + tail_shift)],
            fill=ORANGE_DARK,
            width=34,
            joint="curve",
        )
        d.ellipse((150, 250 + bob, 362, 430 + bob), fill=ORANGE, outline=INK, width=8)
        d.ellipse((150, 80 + bob, 362, 300 + bob), fill=ORANGE, outline=INK, width=8)
        d.polygon([(160, 130 + bob), (150, 30 + bob), (230, 92 + bob)], fill=ORANGE, outline=INK, width=7)
        d.polygon([(352, 130 + bob), (362, 30 + bob), (282, 92 + bob)], fill=ORANGE, outline=INK, width=7)
        # Back stripes
        for i in range(3):
            y = 150 + i * 42 + bob
            d.arc((205, y - 18, 307, y + 20), 200, 340, fill=ORANGE_DARK, width=9)
        # Collar / tag
        d.rounded_rectangle((192, 292 + bob, 320, 320 + bob), radius=12, fill=(178, 67, 76, 255), outline=INK, width=4)
        d.ellipse((238, 314 + bob, 274, 350 + bob), fill=AMBER, outline=INK, width=4)
        # Legs
        for x in (190, 286):
            d.rounded_rectangle((x, 400 + bob, x + 42, 470 + bob + leg_shift), radius=18, fill=ORANGE_LIGHT, outline=INK, width=6)
        return img.resize((128, 128), Image.Resampling.LANCZOS)

    if direction == "right":
        # Right-facing profile.
        d.line(
            [(150, 340), (70, 300 - tail_shift), (48, 210 - tail_shift)],
            fill=ORANGE_DARK,
            width=32,
            joint="curve",
        )
        d.ellipse((120, 250 + bob, 340, 430 + bob), fill=ORANGE, outline=INK, width=8)
        d.ellipse((170, 80 + bob, 382, 300 + bob), fill=ORANGE, outline=INK, width=8)
        d.polygon([(190, 132 + bob), (196, 28 + bob), (268, 92 + bob)], fill=ORANGE, outline=INK, width=7)
        d.polygon([(350, 132 + bob), (390, 54 + bob), (392, 150 + bob)], fill=ORANGE, outline=INK, width=7)
        d.ellipse((318, 176 + bob, 354, 210 + bob), fill=GREEN, outline=INK, width=4)
        d.ellipse((330, 184 + bob, 344, 202 + bob), fill=INK)
        d.ellipse((348, 214 + bob, 392, 250 + bob), fill=CREAM, outline=INK, width=4)
        d.polygon([(383, 224 + bob), (400, 232 + bob), (383, 240 + bob)], fill=PINK, outline=INK, width=2)
        d.line([(374, 246 + bob), (366, 258 + bob)], fill=INK, width=4)
        d.line([(340, 142 + bob), (340, 190 + bob)], fill=ORANGE_DARK, width=8)
        # Legs
        for i, (x, dy) in enumerate(((158, -leg_shift), (260, leg_shift))):
            d.rounded_rectangle((x, 396 + bob, x + 46, 470 + bob + dy), radius=18, fill=ORANGE_LIGHT, outline=INK, width=6)
        return img.resize((128, 128), Image.Resampling.LANCZOS)

    # Front view (down)
    d.line(
        [(340, 340), (430, 300 + tail_shift), (452, 214 + tail_shift)],
        fill=ORANGE_DARK,
        width=34,
        joint="curve",
    )
    d.ellipse((150, 250 + bob, 362, 430 + bob), fill=ORANGE, outline=INK, width=8)
    d.ellipse((150, 80 + bob, 362, 300 + bob), fill=ORANGE, outline=INK, width=8)
    d.polygon([(160, 132 + bob), (148, 28 + bob), (232, 92 + bob)], fill=ORANGE, outline=INK, width=7)
    d.polygon([(352, 132 + bob), (364, 28 + bob), (280, 92 + bob)], fill=ORANGE, outline=INK, width=7)
    d.polygon([(172, 124 + bob), (166, 58 + bob), (214, 96 + bob)], fill=PINK)
    d.polygon([(340, 124 + bob), (346, 58 + bob), (298, 96 + bob)], fill=PINK)

    # Eyes
    for x in (212, 300):
        d.ellipse((x - 22, 186 + bob, x + 22, 230 + bob), fill=GREEN, outline=INK, width=4)
        d.ellipse((x - 7, 196 + bob, x + 7, 222 + bob), fill=INK)
        d.ellipse((x - 2, 196 + bob, x + 4, 204 + bob), fill=CREAM)
    # Muzzle
    d.ellipse((216, 228 + bob, 296, 274 + bob), fill=CREAM, outline=INK, width=3)
    d.polygon([(250, 238 + bob), (262, 238 + bob), (256, 248 + bob)], fill=PINK, outline=INK, width=2)
    d.line([(256, 248 + bob), (256, 258 + bob)], fill=INK, width=3)
    d.arc((234, 248 + bob, 256, 268 + bob), 0, 90, fill=INK, width=3)
    d.arc((256, 248 + bob, 278, 268 + bob), 90, 180, fill=INK, width=3)
    # Whiskers
    for dy in (-4, 4):
        d.line([(214, 252 + bob + dy), (150, 240 + bob + dy)], fill=INK, width=2)
        d.line([(298, 252 + bob + dy), (362, 240 + bob + dy)], fill=INK, width=2)
    # Forehead stripes
    d.line([(238, 112 + bob), (256, 148 + bob)], fill=ORANGE_DARK, width=8)
    d.line([(274, 112 + bob), (256, 148 + bob)], fill=ORANGE_DARK, width=8)
    # Collar / tag
    d.rounded_rectangle((190, 292 + bob, 322, 320 + bob), radius=12, fill=(178, 67, 76, 255), outline=INK, width=4)
    d.ellipse((238, 314 + bob, 274, 350 + bob), fill=AMBER, outline=INK, width=4)
    # Front legs
    for x in (176, 294):
        d.rounded_rectangle((x, 396 + bob, x + 42, 474 + bob + leg_shift), radius=18, fill=ORANGE_LIGHT, outline=INK, width=6)
    return img.resize((128, 128), Image.Resampling.LANCZOS)


def make_floor() -> None:
    w, h = 832, 1088
    img = Image.new("RGBA", (w, h), (26, 19, 34, 255))
    d = ImageDraw.Draw(img, "RGBA")
    rng = random.Random(7)
    plank_h = 64
    for row, y in enumerate(range(0, h, plank_h)):
        base = (31 + (row % 2) * 4, 23 + (row % 2) * 3, 40 + (row % 2) * 4, 255)
        d.rectangle((0, y, w, y + plank_h), fill=base)
        d.line((0, y, w, y), fill=(54, 38, 58, 180), width=2)
        # Plank joints
        offset = 0 if row % 2 == 0 else 190
        for x in range(offset, w, 380):
            d.line((x, y, x, y + plank_h), fill=(48, 34, 52, 160), width=2)
        # Grain
        for _ in range(7):
            gx = rng.randrange(0, w)
            gy = y + rng.randrange(8, plank_h - 8)
            length = rng.randrange(30, 130)
            d.line((gx, gy, min(w, gx + length), gy + rng.choice((-1, 0, 1))), fill=(68, 48, 67, 55), width=1)
    # Vignette-ish edge
    d.rectangle((0, 0, w - 1, h - 1), outline=(62, 44, 66, 255), width=4)
    save(img, "board/floor.png")


def make_wall() -> None:
    w, h = 64, 16
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    for y in range(h):
        t = y / max(1, h - 1)
        color = (
            int(216 * (1 - t) + 92 * t),
            int(178 * (1 - t) + 62 * t),
            int(122 * (1 - t) + 44 * t),
            255,
        )
        d.line((0, y, w, y), fill=color)
    d.line((0, 1, w, 1), fill=(255, 232, 188, 180), width=2)
    d.line((0, h - 2, w, h - 2), fill=(54, 35, 28, 220), width=2)
    d.rounded_rectangle((0, 0, w - 1, h - 1), radius=5, outline=(48, 31, 26, 220), width=2)
    save(img, "board/wall.png")


def make_fragment() -> None:
    size = 96
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    glow(d, 48, 48, 44, (143, 211, 214))
    points = [(50, 10), (78, 26), (84, 58), (58, 86), (24, 74), (14, 40), (30, 20)]
    d.polygon(points, fill=(214, 250, 248, 255), outline=(84, 180, 188, 255), width=3)
    d.line((50, 10, 54, 48, 58, 86), fill=(143, 211, 214, 220), width=2)
    d.line((14, 40, 54, 48, 84, 58), fill=(143, 211, 214, 180), width=2)
    d.ellipse((42, 40, 58, 56), fill=(255, 255, 255, 220))
    save(img, "props/fragment.png")


def make_butterfly() -> None:
    size = 96
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    glow(d, 48, 48, 40, CYAN[:3])
    d.ellipse((12, 18, 48, 48), fill=(175, 238, 240, 235), outline=INK, width=2)
    d.ellipse((48, 18, 84, 48), fill=(175, 238, 240, 235), outline=INK, width=2)
    d.ellipse((18, 44, 46, 76), fill=(143, 211, 214, 220), outline=INK, width=2)
    d.ellipse((50, 44, 78, 76), fill=(143, 211, 214, 220), outline=INK, width=2)
    d.ellipse((42, 34, 54, 66), fill=(42, 32, 36, 255))
    d.line((46, 36, 34, 18), fill=INK, width=2)
    d.line((50, 36, 62, 18), fill=INK, width=2)
    save(img, "props/butterfly.png")


def make_firefly() -> None:
    size = 96
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    glow(d, 48, 48, 44, (255, 226, 120))
    d.ellipse((30, 38, 66, 70), fill=(50, 38, 36, 255))
    d.ellipse((20, 40, 42, 58), fill=(220, 248, 220, 180), outline=INK, width=2)
    d.ellipse((54, 40, 76, 58), fill=(220, 248, 220, 180), outline=INK, width=2)
    d.ellipse((40, 42, 56, 64), fill=(255, 232, 120, 255))
    d.ellipse((43, 46, 53, 58), fill=(255, 255, 210, 255))
    save(img, "props/firefly.png")


def make_wine() -> None:
    size = 96
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    glow(d, 48, 48, 38, ROSE[:3])
    d.rounded_rectangle((38, 28, 58, 42), radius=3, fill=(110, 73, 55, 255), outline=INK, width=2)
    d.rounded_rectangle((30, 42, 66, 84), radius=12, fill=(184, 82, 102, 255), outline=INK, width=3)
    d.rectangle((38, 58, 58, 74), fill=CREAM, outline=INK, width=1)
    d.line((44, 62, 52, 70), fill=ROSE, width=3)
    d.line((52, 62, 44, 70), fill=ROSE, width=3)
    save(img, "props/wine.png")


def make_cat_strip() -> None:
    size = 96
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    glow(d, 48, 48, 34, AMBER[:3])
    d.rounded_rectangle((20, 30, 76, 74), radius=10, fill=(236, 164, 70, 255), outline=INK, width=3)
    d.rectangle((20, 42, 76, 50), fill=(255, 231, 178, 255))
    d.ellipse((38, 52, 58, 64), fill=(170, 106, 44, 255))
    d.line((20, 30, 12, 20), fill=INK, width=3)
    d.line((76, 30, 84, 20), fill=INK, width=3)
    save(img, "props/cat_strip.png")


def make_sewer() -> None:
    size = 96
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    d.rounded_rectangle((18, 24, 78, 78), radius=8, fill=(62, 66, 74, 255), outline=INK, width=3)
    d.ellipse((24, 30, 72, 72), fill=(28, 30, 36, 255), outline=(120, 126, 136, 255), width=2)
    for x in range(30, 70, 10):
        d.line((x, 34, x, 68), fill=(100, 106, 116, 255), width=3)
    for y in range(38, 68, 10):
        d.line((28, y, 68, y), fill=(100, 106, 116, 255), width=2)
    d.line((24, 30, 72, 72), fill=(160, 168, 176, 130), width=2)
    save(img, "props/sewer.png")


def make_fish() -> None:
    size = 96
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    glow(d, 48, 48, 34, (255, 214, 120))
    d.ellipse((18, 38, 68, 66), fill=(250, 194, 92, 255), outline=INK, width=3)
    d.polygon([(66, 52), (86, 38), (82, 66)], fill=(250, 194, 92, 255), outline=INK, width=3)
    d.ellipse((30, 44, 40, 54), fill=INK)
    d.ellipse((33, 46, 38, 51), fill=CREAM)
    d.arc((24, 46, 50, 62), 20, 160, fill=(180, 110, 40, 255), width=2)
    save(img, "props/fish.png")


def make_yarn() -> None:
    size = 96
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    glow(d, 48, 48, 36, ROSE[:3])
    d.ellipse((20, 20, 76, 76), fill=(188, 92, 108, 255), outline=INK, width=3)
    for offset in range(-18, 19, 9):
        d.arc((26 + offset, 26, 70 + offset, 70), 200, 340, fill=(238, 160, 170, 255), width=3)
    d.line((76, 48, 86, 62), fill=ROSE, width=3)
    save(img, "props/yarn.png")


def make_feather() -> None:
    size = 96
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    glow(d, 48, 48, 32, PURPLE[:3])
    points = [(50, 12), (68, 34), (64, 62), (48, 82), (30, 58), (28, 32)]
    d.polygon(points, fill=(78, 58, 96, 255), outline=(30, 22, 38, 255), width=3)
    d.line((49, 18, 48, 80), fill=(180, 160, 205, 255), width=2)
    for y in range(26, 72, 8):
        d.line((48, y, 62, y + 8), fill=(140, 116, 170, 180), width=1)
    save(img, "props/feather.png")


def make_exit() -> None:
    size = 256
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    glow(d, 128, 128, 120, CYAN[:3], layers=10)
    d.rounded_rectangle((54, 44, 202, 224), radius=74, fill=(10, 30, 34, 230), outline=(143, 211, 214, 255), width=6)
    d.rounded_rectangle((72, 62, 184, 224), radius=56, fill=(18, 58, 62, 210), outline=(184, 243, 238, 255), width=3)
    # Sound wave rings
    for r in (34, 54, 74):
        d.arc((128 - r, 128 - r, 128 + r, 128 + r), 200, 340, fill=(143, 211, 214, 150), width=3)
    # Door handle / music note
    d.ellipse((108, 126, 148, 166), fill=(143, 211, 214, 220))
    d.rectangle((142, 96, 150, 150), fill=(143, 211, 214, 220))
    d.polygon([(150, 96), (180, 108), (176, 124), (150, 114)], fill=(143, 211, 214, 220))
    save(img, "props/exit.png")



def make_menu_bg() -> None:
    w, h = 1080, 1920
    img = Image.new("RGBA", (w, h), (7, 5, 13, 255))
    d = ImageDraw.Draw(img, "RGBA")
    for y in range(h):
        t = y / (h - 1)
        c = (int(7 + 13 * t), int(5 + 9 * t), int(13 + 16 * t), 255)
        d.line((0, y, w, y), fill=c)
    vanish = (540, 700)
    for i in range(-7, 8):
        x = vanish[0] + i * 150
        d.line((vanish[0] + i * 16, vanish[1], x, h), fill=(31, 23, 43, 255), width=2)
    for y in (700, 850, 1030, 1250, 1510, 1810):
        d.line((100, y, 980, y), fill=(28, 21, 39, 255), width=2)
    for y in (1160, 1198, 1236, 1274, 1312):
        d.line((90, y, 990, y), fill=(40, 30, 50, 255), width=2)
    rng = random.Random(21)
    for _ in range(14):
        x = rng.randrange(130, 950)
        y = rng.randrange(1040, 1460)
        r = rng.randrange(8, 15)
        d.ellipse((x - r, y - r * 0.7, x + r, y + r * 0.7), fill=(86, 70, 100, 255))
        d.line((x + r, y - r, x + r, y - 36), fill=(72, 58, 86, 255), width=3)
        d.line((x + r, y - 36, x + r + 20, y - 28), fill=(72, 58, 86, 255), width=3)
    # Keep the menu background quiet; the title and cards carry the focus.
    # Cat silhouette at the bottom.
    cat = Image.open(OUT / "cat" / "cat_down_0.png").convert("RGBA")
    cat.thumbnail((300, 300), Image.Resampling.LANCZOS)
    dark = Image.new("RGBA", cat.size, (4, 3, 8, 0))
    dark.putalpha(cat.getchannel("A").point(lambda a: int(a * 0.45)))
    img.alpha_composite(dark, ((w - cat.width) // 2, h - cat.height + 40))
    save(img, "ui/menu_bg.png")


def make_cd() -> None:
    size = 512
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    glow(d, 256, 256, 236, CYAN[:3], layers=12)
    d.ellipse((38, 38, 474, 474), fill=(18, 22, 30, 255), outline=(196, 230, 236, 255), width=6)
    for r in range(70, 225, 9):
        d.arc((256 - r, 256 - r, 256 + r, 256 + r), 0, 360, fill=(100, 125, 145, 70), width=2)
    for i, col in enumerate(((255, 120, 150), (255, 196, 110), (140, 230, 190), (130, 190, 255), (205, 150, 255))):
        r = 214 - i * 12
        d.arc((256 - r, 256 - r, 256 + r, 256 + r), 200 + i * 8, 340 - i * 8, fill=(*col, 190), width=7)
    d.ellipse((196, 196, 316, 316), fill=(8, 12, 18, 255), outline=(225, 240, 242, 255), width=5)
    d.ellipse((232, 232, 280, 280), fill=(5, 7, 10, 255), outline=(120, 190, 200, 255), width=3)
    # Center highlight.
    d.arc((70, 70, 442, 442), 205, 290, fill=(255, 255, 255, 150), width=5)
    save(img, "props/cd.png")


def make_owner() -> None:
    size = 512
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img, "RGBA")
    glow(d, 256, 300, 220, (242, 179, 92), layers=9)
    # Warm doorway behind the owner.
    d.rounded_rectangle((126, 28, 386, 500), radius=120, fill=(94, 58, 48, 120), outline=(242, 179, 92, 80), width=4)
    # Silhouette: head, shoulders, arms reaching in.
    d.ellipse((206, 82, 306, 198), fill=(18, 14, 20, 255))
    d.polygon([(168, 190), (344, 190), (392, 512), (120, 512)], fill=(18, 14, 20, 255))
    d.line([(178, 250), (70, 340), (38, 300)], fill=(18, 14, 20, 255), width=54, joint="curve")
    d.line([(334, 250), (442, 340), (474, 300)], fill=(18, 14, 20, 255), width=54, joint="curve")
    # Rim light.
    d.arc((198, 74, 314, 206), 190, 330, fill=(255, 210, 150, 200), width=4)
    d.line([(168, 194), (120, 500)], fill=(255, 190, 130, 120), width=3)
    d.line([(344, 194), (392, 500)], fill=(255, 190, 130, 120), width=3)
    save(img, "props/owner.png")

def main() -> None:
    ensure_dir(OUT)
    for direction in ("down", "up", "left", "right"):
        for frame in range(4):
            img = draw_cat(direction, frame)
            if direction == "left":
                img = img.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            save(img, f"cat/cat_{direction}_{frame}.png")
    make_floor()
    make_wall()
    make_fragment()
    make_butterfly()
    make_firefly()
    make_wine()
    make_cat_strip()
    make_sewer()
    make_fish()
    make_yarn()
    make_feather()
    make_exit()
    make_menu_bg()
    make_cd()
    make_owner()
    print(f"placeholder art written to {OUT}")


if __name__ == "__main__":
    main()
