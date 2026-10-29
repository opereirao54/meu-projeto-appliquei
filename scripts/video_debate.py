from PIL import Image, ImageDraw, ImageFont, ImageFilter
import random, os, subprocess

S = "/tmp/claude-0/-home-claude/2558adb6-7612-5127-8218-5436c5f6b1d5/scratchpad/deb"
os.makedirs(S, exist_ok=True)
SRC = "/mnt/user-data/uploads/ScreenRecording_10-28-2026_06-41-18_1.mov"
OUT = "/home/claude/post2/video_debate_lula.mp4"
W, H = 1080, 1920
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
    return y + int(size * 1.12)

def small(d, text, y, size, color=(210, 210, 210), font=R):
    d.text((W // 2, y), text, font=F(font, size), fill=color, anchor="ma"); return y + int(size * 1.4)

def card(name, fn):
    random.seed(7); im = bg.copy(); d = ImageDraw.Draw(im); fn(d); im.save(f"{S}/{name}.png")

def c1(d):
    y = big(d, "O PRESIDENTE", 600, 120)
    y = big(d, "AVISOU,", y, 120)
    y = bar(d, "AO VIVO,", y + 10, 120, YEL, BLK)
    small(d, "o que ia acontecer com o adversário", y + 40, 48, WHITE)
    small(d, "depois da eleição.", y + 115, 52, WHITE)
def c2(d):
    y = small(d, "DEBATE DA BAND", 640, 64, YEL, B)
    y = big(d, "18 DE OUTUBRO", y + 10, 110)
    y = bar(d, "UMA SEMANA ANTES", y + 20, 80, RED, WHITE)
    y = small(d, "do segundo turno.", y + 10, 56, WHITE)
    small(d, "Olha a resposta do Lula pro Flávio ↓", y + 80, 50, (200, 200, 200))
def c3(d):
    y = big(d, "E NO DIA", 600, 140)
    y = big(d, "SEGUINTE?", y, 140)
    y = bar(d, "19/10: INQUÉRITO ABERTO", y + 30, 64, YEL, BLK)
    small(d, "Relator: Alexandre de Moraes", y + 30, 56, WHITE, B)
def c4(d):
    y = big(d, "NENHUMA", 620, 140)
    y = bar(d, "DENÚNCIA.", y + 10, 130, RED, WHITE)
    y = big(d, "NENHUMA", y + 40, 140)
    bar(d, "CONDENAÇÃO.", y + 10, 120, RED, WHITE)
def c5(d):
    y = small(d, "Ele disse que os inquéritos", 560, 56, WHITE)
    y = bar(d, "“IAM ANDAR”", y + 10, 120, YEL, BLK)
    y = big(d, "DESDE QUANDO", y + 50, 88)
    y = big(d, "QUEM DECIDE ISSO", y, 88)
    big(d, "É O PRESIDENTE?", y, 88, YEL)
def c6(d):
    y = bar(d, "59,8 MILHÕES", 600, 108, YEL, BLK)
    y = big(d, "NÃO VÃO", y + 30, 140)
    y = big(d, "ESQUECER.", y, 140)
    small(d, "Compartilha. Eles precisam ver isso.", y + 60, 46, WHITE, B)
    small(d, "Fontes: Aos Fatos; Revista Oeste; Gazeta do Povo; TRE-SP", H - 170, 30, (140, 140, 140))

def frame(d):
    small(d, "DEBATE DA BAND · 18/10/2026", 520, 54, YEL, B)
    big(d, "ELE AVISOU", 1330, 110)
    bar(d, "NO DEBATE", 1460, 100, RED, WHITE)
    small(d, "Imagens: TV Band", H - 170, 30, (140, 140, 140))

for n, fn in [("c1", c1), ("c2", c2), ("c3", c3), ("c4", c4), ("c5", c5), ("c6", c6), ("frame", frame)]:
    card(n, fn)

def card_clip(name, dur):
    out = f"{S}/{name}.mp4"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-framerate", "30", "-t", str(dur), "-i", f"{S}/{name}.png",
        "-f", "lavfi", "-t", str(dur), "-i", "anullsrc=r=44100:cl=stereo",
        "-vf", f"zoompan=z='1.10-0.10*min(on/6\\,1)+0.0002*on':d={int(dur*30)}:s={W}x{H}:fps=30,fade=t=in:st=0:d=0.12:color=white",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", out], check=True)
    return out

clips = [card_clip("c1", 4.0), card_clip("c2", 5.0)]
# debate clip: crop, scale to width, overlay on frame bg
dc = f"{S}/debate.mp4"
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-framerate", "30", "-i", f"{S}/frame.png", "-ss", "0", "-t", "36.8", "-i", SRC,
    "-filter_complex", "[1:v]crop=1170:658:0:940,scale=1080:-2,fps=30[v];[0:v][v]overlay=0:(H-h)/2:shortest=1,fps=30,format=yuv420p[o];[1:a]afade=t=out:st=36.5:d=0.3[a]",
    "-map", "[o]", "-map", "[a]", "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-c:a", "aac", "-ar", "44100", "-ac", "2", dc], check=True)
clips.append(dc)
clips += [card_clip("c3", 4.0), card_clip("c4", 3.5), card_clip("c5", 5.5), card_clip("c6", 4.5)]

lst = f"{S}/list.txt"
open(lst, "w").write("".join(f"file '{c}'\n" for c in clips))
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst,
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "aac", OUT], check=True)
print("done")
