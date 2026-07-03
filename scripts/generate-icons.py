#!/usr/bin/env python3
"""
Regenerates every app icon in public/icons/, public/favicon.png, and
public/apple-touch-icon.png from brand/logo-source.jpg.

Why this exists: the icon set in this repo was produced from a single
JPEG by thresholding it to a black/white mask, recoloring the mark to
the app's gold token, and compositing it onto transparent ("any" purpose)
or solid dark ("maskable" purpose) canvases at each required size. That
process needs to be repeatable — if the source logo is ever replaced, or
a new icon size is needed, run this script again rather than
hand-editing PNGs. See CHANGELOG.md for the reasoning behind the
specific percentages used below.

Usage:
    pip install pillow numpy --break-system-packages
    python3 scripts/generate-icons.py
"""

from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "brand" / "logo-source.jpg"
PUBLIC = ROOT / "public"

GOLD = (201, 162, 75, 255)  # --gold in src/index.css
DARK = (11, 11, 15, 255)  # --bg in src/index.css
THRESHOLD = 128  # luminance below this = logo pixel


def load_trimmed_mask(path: Path) -> np.ndarray:
    gray = np.array(Image.open(path).convert("L"))
    mask = gray < THRESHOLD
    ys, xs = np.where(mask)
    top, bottom, left, right = ys.min(), ys.max(), xs.min(), xs.max()
    return mask[top : bottom + 1, left : right + 1]


def logo_rgba(mask: np.ndarray) -> Image.Image:
    out = np.zeros((*mask.shape, 4), dtype=np.uint8)
    out[mask] = GOLD
    return Image.fromarray(out, "RGBA")


def place_on_canvas(
    logo_img: Image.Image,
    canvas_size: int,
    content_fraction: float,
    bg_rgba: tuple[int, int, int, int] | None,
) -> Image.Image:
    canvas = Image.new(
        "RGBA", (canvas_size, canvas_size), bg_rgba if bg_rgba else (0, 0, 0, 0)
    )
    target_long_side = int(canvas_size * content_fraction)
    scale = target_long_side / max(logo_img.size)
    new_size = tuple(max(1, round(d * scale)) for d in logo_img.size)
    resized = logo_img.resize(new_size, Image.LANCZOS)
    offset = ((canvas_size - new_size[0]) // 2, (canvas_size - new_size[1]) // 2)
    canvas.alpha_composite(resized, offset)
    return canvas


def main() -> None:
    mask = load_trimmed_mask(SOURCE)
    logo = logo_rgba(mask)

    icons_dir = PUBLIC / "icons"
    icons_dir.mkdir(parents=True, exist_ok=True)

    # "any" purpose: transparent background, generous fill — not subject
    # to OS masking, so it can use most of the canvas.
    for size in (512, 192):
        place_on_canvas(logo, size, content_fraction=0.86, bg_rgba=None).save(
            icons_dir / f"icon-any-{size}.png"
        )

    # "maskable" purpose: solid background, content kept inside the ~80%
    # safe-zone circle so Android's circular/rounded-square crop never
    # clips the mark. 0.58 leaves a comfortable margin below that 0.80
    # ceiling.
    for size in (512, 192):
        place_on_canvas(logo, size, content_fraction=0.58, bg_rgba=DARK).save(
            icons_dir / f"icon-maskable-{size}.png"
        )

    # Apple touch icon (iOS renders transparency as black historically —
    # always give it a solid background) and favicon.
    place_on_canvas(logo, 180, content_fraction=0.62, bg_rgba=DARK).save(
        PUBLIC / "apple-touch-icon.png"
    )
    place_on_canvas(logo, 48, content_fraction=0.62, bg_rgba=DARK).save(
        PUBLIC / "favicon.png"
    )

    print(f"Regenerated icons from {SOURCE.relative_to(ROOT)} into {PUBLIC.relative_to(ROOT)}/")


if __name__ == "__main__":
    main()
