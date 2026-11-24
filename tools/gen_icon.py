"""Generate launcher icons with only Pillow (no network, no external assets)."""
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

S = 512
ROOT = Path(__file__).resolve().parents[1]


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def make_icon(round_mask=False):
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # deep space background
    d.rounded_rectangle([0, 0, S - 1, S - 1], radius=118 if not round_mask else S // 2,
                        fill=(9, 14, 27, 255))
    if round_mask:
        d.ellipse([0, 0, S - 1, S - 1], fill=(9, 14, 27, 255))

    # subtle glow blobs
    glow = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([-90, -110, 250, 230], fill=(34, 230, 255, 120))
    gd.ellipse([270, 250, 620, 600], fill=(155, 92, 255, 130))
    glow = glow.filter(ImageFilter.GaussianBlur(58))
    img = Image.alpha_composite(img, glow)
    if round_mask:
        mask = Image.new('L', (S, S), 0)
        ImageDraw.Draw(mask).ellipse([0, 0, S - 1, S - 1], fill=255)
        img.putalpha(mask)
    d = ImageDraw.Draw(img)

    # border
    if round_mask:
        d.ellipse([10, 10, S - 11, S - 11], outline=(80, 200, 255, 130), width=7)
    else:
        d.rounded_rectangle([10, 10, S - 11, S - 11], radius=110,
                            outline=(80, 200, 255, 130), width=7)

    # parametric lemniscate
    pts = []
    for i in range(401):
        t = 2 * math.pi * i / 400
        x = 256 + 148 * math.sin(t)
        y = 256 + 95 * math.sin(2 * t)
        pts.append((x, y))

    def stroke_layer(width, alpha):
        layer = Image.new('RGBA', (S, S), (0, 0, 0, 0))
        ld = ImageDraw.Draw(layer)
        c1, c2 = (34, 230, 255), (170, 95, 255)
        for i in range(len(pts) - 1):
            t = i / (len(pts) - 1)
            col = lerp(c1, c2, (math.sin(t * math.pi) + 1) / 2)
            ld.line([pts[i], pts[i + 1]], fill=col + (alpha,), width=width)
        return layer

    halo = stroke_layer(52, 150).filter(ImageFilter.GaussianBlur(24))
    img = Image.alpha_composite(img, halo)
    if round_mask:
        img.putalpha(mask)
    img = Image.alpha_composite(img, stroke_layer(30, 255))

    out = ROOT / 'res'
    target = out / ('mipmap-xxhdpi' if not round_mask else 'mipmap-xxxhdpi')
    target.mkdir(parents=True, exist_ok=True)
    img.resize((192, 192), Image.LANCZOS).save(target / ('ic_launcher.png' if not round_mask else 'ic_launcher_round.png'))
    print('wrote', target)


if __name__ == '__main__':
    make_icon(False)
    make_icon(True)
