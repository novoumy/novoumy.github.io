"""Generates public/posters/peak.png - a 600x900 portrait poster for PEAK (original artwork)."""
import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 600, 900
S = 2  # supersample
img = Image.new("RGB", (W * S, H * S))
px = img.load()

# sky gradient: deep purple -> magenta -> warm orange at the horizon
stops = [(0.0, (38, 22, 92)), (0.45, (142, 54, 150)), (0.72, (246, 112, 120)), (1.0, (255, 190, 110))]
def lerp(a, b, t): return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))
def sky(t):
    for (t0, c0), (t1, c1) in zip(stops, stops[1:]):
        if t <= t1:
            return lerp(c0, c1, (t - t0) / (t1 - t0))
    return stops[-1][1]
d = ImageDraw.Draw(img)
for y in range(H * S):
    d.line([(0, y), (W * S, y)], fill=sky(y / (H * S)))

# stars
random.seed(7)
for _ in range(90):
    x, y = random.randint(0, W * S), random.randint(0, int(H * S * 0.4))
    r = random.choice([1, 1, 2, 3])
    d.ellipse([x, y, x + r, y + r], fill=(255, 255, 255))

# sun glow
glow = Image.new("RGB", img.size, (0, 0, 0))
gd = ImageDraw.Draw(glow)
cx, cy = int(W * S * 0.5), int(H * S * 0.60)
for r, a in [(420, 40), (300, 70), (200, 110), (120, 170)]:
    gd.ellipse([cx - r * S // 2 * 2 // 2, cy - r * S // 2, cx + r * S // 2 * 2 // 2, cy + r * S // 2], fill=(a, int(a * .55), int(a * .3)))
glow = glow.filter(ImageFilter.GaussianBlur(60 * S))
from PIL import ImageChops
img = ImageChops.add(img, glow)
d = ImageDraw.Draw(img)

def ridge(base, amp, rough, color, seed, snow=False):
    random.seed(seed)
    pts = [(0, H * S)]
    x = 0
    y = base
    while x <= W * S + 40:
        y = base + random.uniform(-amp, amp)
        pts.append((x, y))
        x += random.randint(int(rough * .6), int(rough * 1.4))
    pts.append((W * S, H * S))
    d.polygon(pts, fill=color)

# far ranges
ridge(int(H * S * .60), 60 * S, 70 * S, (120, 60, 140), 1)
ridge(int(H * S * .67), 70 * S, 80 * S, (88, 44, 120), 2)

# the PEAK: big central mountain with snow cap
peak = (W * S // 2, int(H * S * .41))
left, right = (-40 * S, int(H * S * .86)), (W * S + 40 * S, int(H * S * .86))
d.polygon([left, (int(W * S * .30), int(H * S * .59)), (int(W * S * .40), int(H * S * .52)), peak,
           (int(W * S * .60), int(H * S * .54)), (int(W * S * .72), int(H * S * .62)), right], fill=(62, 34, 104))
# lit side
d.polygon([peak, (int(W * S * .60), int(H * S * .54)), (int(W * S * .72), int(H * S * .62)), right,
           (int(W * S * .55), int(H * S * .86)), (int(W * S * .53), int(H * S * .66))], fill=(86, 48, 128))
# snow cap
snow = [peak, (int(W * S * .58), int(H * S * .495)), (int(W * S * .555), int(H * S * .51)), (int(W * S * .535), int(H * S * .495)),
        (int(W * S * .50), int(H * S * .525)), (int(W * S * .465), int(H * S * .50)), (int(W * S * .44), int(H * S * .52)),
        (int(W * S * .42), int(H * S * .495))]
d.polygon(snow, fill=(255, 244, 250))
d.polygon([peak, (int(W * S * .58), int(H * S * .495)), (int(W * S * .555), int(H * S * .51)), (int(W * S * .535), int(H * S * .495)), (int(W * S * .52), int(H * S * .47))], fill=(255, 210, 220))

# foreground slopes
ridge(int(H * S * .80), 40 * S, 90 * S, (34, 20, 70), 3)
ridge(int(H * S * .88), 30 * S, 110 * S, (20, 12, 46), 4)

# tiny climber + flag at the summit
sx, sy = peak
d.line([(sx, sy), (sx, sy - 34 * S)], fill=(255, 255, 255), width=2 * S)
d.polygon([(sx, sy - 34 * S), (sx + 22 * S, sy - 27 * S), (sx, sy - 20 * S)], fill=(255, 90, 100))

# climber silhouettes on the ridge
def climber(x, y, s=1.0):
    d.ellipse([x - 5 * S * s, y - 22 * S * s, x + 5 * S * s, y - 12 * S * s], fill=(255, 235, 200))
    d.rectangle([x - 5 * S * s, y - 12 * S * s, x + 5 * S * s, y + 4 * S * s], fill=(255, 120, 90))
    d.rectangle([x - 5 * S * s, y + 4 * S * s, x - 1 * S * s, y + 14 * S * s], fill=(40, 28, 70))
    d.rectangle([x + 1 * S * s, y + 4 * S * s, x + 5 * S * s, y + 14 * S * s], fill=(40, 28, 70))
climber(int(W * S * .30), int(H * S * .775), 1.4)
climber(int(W * S * .22), int(H * S * .79), 1.2)

img = img.resize((W, H), Image.LANCZOS)
d = ImageDraw.Draw(img)

# title
font = ImageFont.truetype("/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf", 190)
text = "PEAK"
bbox = d.textbbox((0, 0), text, font=font)
tw = bbox[2] - bbox[0]
tx, ty = (W - tw) // 2 - bbox[0], 70
# chunky shadow
for off in range(14, 0, -1):
    d.text((tx + off, ty + off), text, font=font, fill=(60, 20, 90))
d.text((tx, ty), text, font=font, fill=(255, 255, 255), stroke_width=4, stroke_fill=(255, 255, 255))
sub = ImageFont.truetype("/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf", 22)
tag = "A CO-OP CLIMBING GAME"
tb = d.textbbox((0, 0), tag, font=sub)
d.text(((W - (tb[2] - tb[0])) // 2, 300), tag, font=sub, fill=(255, 226, 190))

# bottom caption
cap = ImageFont.truetype("/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf", 20)
t2 = "REACH THE PEAK"
b2 = d.textbbox((0, 0), t2, font=cap)
d.text(((W - (b2[2] - b2[0])) // 2, H - 56), t2, font=cap, fill=(255, 226, 190))

img.save("public/posters/peak.png", optimize=True)
print("ok")
