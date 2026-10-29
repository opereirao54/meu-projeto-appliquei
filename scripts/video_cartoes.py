from PIL import Image, ImageDraw, ImageFont, ImageFilter
import random, os, subprocess, shutil

W, H, FPS = 1080, 1920, 30
D = "/tmp/claude-0/-home-claude/2558adb6-7612-5127-8218-5436c5f6b1d5/scratchpad/frames"
shutil.rmtree(D, ignore_errors=True); os.makedirs(D)
B = "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf"
R = "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed.ttf"
YEL = (245, 196, 0); RED = (178, 18, 24); WHITE = (250, 250, 250); BLK = (12, 12, 12)
F = lambda p, s: ImageFont.truetype(p, s)

random.seed(1)
bg = Image.new("RGB", (W, H), BLK)
g = Image.new("RGB", (W, H), BLK); gd = ImageDraw.Draw(g)
gd.ellipse((-300, -400, 700, 500), fill=(0, 70, 35)); gd.ellipse((500, -300, 1400, 450), fill=(90, 70, 0))
gd.ellipse((-200, 1500, 600, 2300), fill=(0, 50, 25))
bg = Image.blend(bg, g.filter(ImageFilter.GaussianBlur(220)), 0.6)
bd = ImageDraw.Draw(bg)
for _ in range(25000):
    v = random.randrange(20, 45); bd.point((random.randrange(W), random.randrange(H)), fill=(v, v, v))

def bar(d, text, y, size, bgc, fg):
    f = F(B, size); tw = d.textlength(text, font=f); pad = 40
    x0, x1, y1 = int((W - tw) / 2 - pad), int((W + tw) / 2 + pad), y + int(size * 1.25)
    d.rectangle((x0, y, x1, y1), fill=bgc)
    for yy in range(y, y1, 6):
        d.polygon([(x0, yy), (x0 - random.randint(8, 24), yy + 3), (x0, yy + 6)], fill=bgc)
        d.polygon([(x1, yy), (x1 + random.randint(8, 24), yy + 3), (x1, yy + 6)], fill=bgc)
    d.text((W // 2, y + int(size * .62)), text, font=f, fill=fg, anchor="mm")
    return y1 + 24

def big(d, text, y, size, color=WHITE):
    d.text((W // 2, y), text, font=F(B, size), fill=color, anchor="ma", stroke_width=3, stroke_fill=BLK)
    return y + int(size * 1.1)

def small(d, text, y, size, color=(200, 200, 200), font=R):
    d.text((W // 2, y), text, font=F(font, size), fill=color, anchor="ma"); return y + int(size * 1.35)

def scene(fn):
    random.seed(7)
    im = bg.copy(); d = ImageDraw.Draw(im); fn(d); return im

def s1(d):
    y = big(d, "PRIMEIRO", 640, 160)
    bar(d, "FOI O PAI.", y + 10, 150, YEL, BLK)
def s2(d):
    y = big(d, "AGORA", 640, 160)
    bar(d, "É O FILHO.", y + 10, 150, RED, WHITE)
def s3(d):
    y = big(d, "MESMO", 600, 160)
    y = bar(d, "MINISTRO.", y + 10, 150, YEL, BLK)
    small(d, "Moraes é o relator do novo inquérito contra Flávio", y + 60, 44)
def s4(d):
    y = big(d, "A POUCOS DIAS", 620, 110)
    bar(d, "DA ELEIÇÃO.", y + 10, 124, RED, WHITE)
def s5(d):
    y = small(d, "Flávio chamou o caso de", 560, 56, WHITE)
    y = bar(d, "FAKE NEWS", y + 20, 140, YEL, BLK)
    y = small(d, "e disse ser perseguido pelo", y + 50, 56, WHITE)
    y = big(d, "“aparelhamento do Estado", y + 10, 66)
    big(d, "montado por Lula”", y, 66, YEL)
def s6(d):
    y = big(d, "SE TIVESSEM", 560, 130)
    y = big(d, "CERTEZA NAS", y, 130)
    y = bar(d, "URNAS,", y + 10, 140, YEL, BLK)
    bar(d, "PRECISAVAM DISSO?", y + 30, 86, RED, WHITE)
def s7(d):
    y = big(d, "NÃO VÃO", 620, 170)
    y = bar(d, "CALAR A GENTE.", y + 10, 104, YEL, BLK)
    y = small(d, "Compartilha antes que derrubem.", y + 80, 54, WHITE, B)
    small(d, "Fontes: Revista Oeste; Estadão; Mais Goiás", H - 160, 30, (140, 140, 140))

scenes = [(s1, 2.2), (s2, 2.2), (s3, 3.2), (s4, 2.8), (s5, 5.5), (s6, 4.0), (s7, 4.2)]
n = 0
for fn, dur in scenes:
    base = scene(fn); frames = int(dur * FPS)
    for i in range(frames):
        t = i / frames
        z = 1.12 - 0.12 * min(1, i / 6) + 0.03 * t  # punch-in then slow zoom
        w, h = int(W * z), int(H * z)
        fr = base.resize((w, h), Image.BILINEAR).crop(((w - W) // 2, (h - H) // 2, (w - W) // 2 + W, (h - H) // 2 + H))
        if i < 2: fr = Image.blend(fr, Image.new("RGB", (W, H), WHITE), 0.35)  # flash cut
        fr.save(f"{D}/{n:05d}.jpg", quality=90); n += 1
    base.save(f"/home/claude/post2/video_cena{scenes.index((fn, dur)) + 1}.png")

subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(FPS), "-i", f"{D}/%05d.jpg",
                "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-shortest",
                "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p",
                "-c:a", "aac", "/home/claude/post2/video_flavio.mp4"], check=True)
print(n / FPS, "s")
