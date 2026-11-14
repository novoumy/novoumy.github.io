"""Generates public/og-image.png (1200x630) for Discord / Open Graph link previews.

Run from the project root:  python3 scripts/generate-og.py
Needs Pillow (pip install pillow). No fonts required: the pixel lettering is
drawn from the small bitmap font defined below.
"""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
W, H = 1200, 630

WINE = (0x5C, 0x2B, 0x35)
CREAM = (0xEF, 0xEF, 0xEF)
ROSE = (0xCD, 0x9E, 0xBA)
LAVENDER = (0x84, 0x7F, 0xA4)
GRID = tuple(round(l * 0.88 + c * 0.12) for l, c in zip(LAVENDER, CREAM))

BIO = ("I like spending way too much time on my pc.. soo I made this website "
       "to share my favorite media, games, songs and quotes. ^.^")
NAME = "novoumy"

# ---------------------------------------------------------------- bitmap font
# 9 rows tall: ascenders rows 0-1, x-height rows 2-6, descenders rows 7-8.
def g(*rows):
    return list(rows)

FONT = {
    "a": g(".....", ".....", ".###.", "....#", ".####", "#...#", ".####", ".....", "....."),
    "b": g("#....", "#....", "####.", "#...#", "#...#", "#...#", "####.", ".....", "....."),
    "c": g(".....", ".....", ".####", "#....", "#....", "#....", ".####", ".....", "....."),
    "d": g("....#", "....#", ".####", "#...#", "#...#", "#...#", ".####", ".....", "....."),
    "e": g(".....", ".....", ".###.", "#...#", "#####", "#....", ".####", ".....", "....."),
    "f": g("..##.", ".#...", "####.", ".#...", ".#...", ".#...", ".#...", ".....", "....."),
    "g": g(".....", ".....", ".####", "#...#", "#...#", "#...#", ".####", "....#", ".###."),
    "h": g("#....", "#....", "####.", "#...#", "#...#", "#...#", "#...#", ".....", "....."),
    "i": g(".#.", "...", "##.", ".#.", ".#.", ".#.", "###", "...", "..."),
    "j": g("...#.", ".....", "..##.", "...#.", "...#.", "...#.", "...#.", "#..#.", ".##.."),
    "k": g("#....", "#....", "#..#.", "#.#..", "##...", "#.#..", "#..#.", ".....", "....."),
    "l": g("##.", ".#.", ".#.", ".#.", ".#.", ".#.", "###", "...", "..."),
    "m": g(".....", ".....", "##.#.", "#.#.#", "#.#.#", "#.#.#", "#.#.#", ".....", "....."),
    "n": g(".....", ".....", "####.", "#...#", "#...#", "#...#", "#...#", ".....", "....."),
    "o": g(".....", ".....", ".###.", "#...#", "#...#", "#...#", ".###.", ".....", "....."),
    "p": g(".....", ".....", "####.", "#...#", "#...#", "#...#", "####.", "#....", "#...."),
    "q": g(".....", ".....", ".####", "#...#", "#...#", "#...#", ".####", "....#", "....#"),
    "r": g(".....", ".....", "#.###", "##...", "#....", "#....", "#....", ".....", "....."),
    "s": g(".....", ".....", ".####", "#....", ".###.", "....#", "####.", ".....", "....."),
    "t": g(".#...", ".#...", "####.", ".#...", ".#...", ".#..#", "..##.", ".....", "....."),
    "u": g(".....", ".....", "#...#", "#...#", "#...#", "#...#", ".####", ".....", "....."),
    "v": g(".....", ".....", "#...#", "#...#", "#...#", ".#.#.", "..#..", ".....", "....."),
    "w": g(".....", ".....", "#...#", "#.#.#", "#.#.#", "#.#.#", ".#.#.", ".....", "....."),
    "x": g(".....", ".....", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", ".....", "....."),
    "y": g(".....", ".....", "#...#", "#...#", "#...#", "#...#", ".####", "....#", ".###."),
    "z": g(".....", ".....", "#####", "...#.", "..#..", ".#...", "#####", ".....", "....."),
    "I": g(".###.", "..#..", "..#..", "..#..", "..#..", "..#..", ".###.", ".....", "....."),
    ".": g("..", "..", "..", "..", "..", "##", "##", "..", ".."),
    ",": g("..", "..", "..", "..", "..", "##", "##", ".#", "#."),
    "^": g("..#..", ".#.#.", "#...#", ".....", ".....", ".....", ".....", ".....", "....."),
    " ": g("...", "...", "...", "...", "...", "...", "...", "...", "..."),
}
ROWS = 9

# The bold heading thickens every pixel by one column, which would fill the gaps
# of a narrow "m", so it gets a wider version.
BOLD_OVERRIDE = {
    "m": g(".......", ".......", "#######", "#..#..#", "#..#..#", "#..#..#", "#..#..#", ".......", "......."),
}


def glyph(ch, bold=False):
    return BOLD_OVERRIDE.get(ch, FONT[ch]) if bold else FONT[ch]


def glyph_width(ch, bold=False):
    return len(glyph(ch, bold)[0])


def text_width(text, scale, bold=False):
    gap = 2 if bold else 1
    units = sum(glyph_width(c, bold) + gap for c in text) - gap + (1 if bold else 0)
    return units * scale


def draw_text(d, x, y, text, scale, color, bold=False):
    cx = x
    for ch in text:
        for ry, row in enumerate(glyph(ch, bold)):
            for rx, cell in enumerate(row):
                if cell == "#":
                    for dx in ((0, 1) if bold else (0,)):
                        px = cx + (rx + dx) * scale
                        d.rectangle([px, y + ry * scale, px + scale - 1, y + (ry + 1) * scale - 1], fill=color)
        cx += (glyph_width(ch, bold) + (2 if bold else 1)) * scale


def wrap(text, scale, max_width):
    lines, line = [], ""
    for word in text.split(" "):
        trial = f"{line} {word}".strip()
        if text_width(trial, scale) <= max_width:
            line = trial
        else:
            lines.append(line)
            line = word
    lines.append(line)
    return lines


# ------------------------------------------------------------------- drawing
def notched(d, x0, y0, x1, y1, b, color):
    """Rectangle with the site's stepped corners (no corner pixels)."""
    d.rectangle([x0 - b, y0, x1 + b - 1, y1 - 1], fill=color)
    d.rectangle([x0, y0 - b, x1 - 1, y1 + b - 1], fill=color)


def pixel_frame(d, x0, y0, x1, y1, b=8):
    notched(d, x0 + 2 * b, y0 + 2 * b, x1 + 2 * b, y1 + 2 * b, b, WINE)  # drop shadow
    notched(d, x0, y0, x1, y1, b, WINE)                                  # outline
    d.rectangle([x0, y0, x1 - 1, y1 - 1], fill=ROSE)                     # rose inner line
    d.rectangle([x0 + b, y0 + b, x1 - b - 1, y1 - b - 1], fill=CREAM)    # window


def main():
    img = Image.new("RGB", (W, H), LAVENDER)
    d = ImageDraw.Draw(img)

    # background grid, like the site
    for x in range(0, W, 32):
        d.line([(x, 0), (x, H)], fill=GRID, width=1)
    for y in range(0, H, 32):
        d.line([(0, y), (W, y)], fill=GRID, width=1)

    # main window (kept well inside the edges so Discord never crops it)
    cx0, cy0, cx1, cy1 = 80, 72, 1100, 540
    pixel_frame(d, cx0, cy0, cx1, cy1)

    # avatar
    size = 256
    ax0 = cx0 + 64
    ay0 = (cy0 + cy1) // 2 - size // 2 - 8
    pixel_frame(d, ax0, ay0, ax0 + size, ay0 + size)
    icon = Image.open(ROOT / "public" / "icon.png").convert("RGBA")
    inner = size - 16
    icon = icon.resize((inner, inner), Image.NEAREST)
    img.paste(icon, (ax0 + 8, ay0 + 8), icon)

    # heading + bio, vertically centred as one block
    tx = ax0 + size + 16 + 56
    max_w = cx1 - 48 - tx
    name_scale, bio_scale = 11, 4
    name_h = 7 * name_scale          # x-height + a little descender room
    lines = wrap(BIO, bio_scale, max_w)
    line_h = 12 * bio_scale
    gap = 40
    block_h = name_h + 22 + gap + len(lines) * line_h
    ty = (cy0 + cy1) // 2 - block_h // 2 - 6

    draw_text(d, tx, ty - 2 * name_scale, NAME, name_scale, WINE, bold=True)
    by = ty + name_h + gap
    for i, line in enumerate(lines):
        draw_text(d, tx, by + i * line_h, line, bio_scale, WINE)

    out = ROOT / "public" / "og-image.png"
    img.save(out, optimize=True)
    print(f"wrote {out} ({img.size[0]}x{img.size[1]}), bio lines: {len(lines)}")


if __name__ == "__main__":
    main()
