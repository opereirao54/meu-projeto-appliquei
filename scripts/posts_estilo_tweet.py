P = "/tmp/claude-0/-home-claude/2558adb6-7612-5127-8218-5436c5f6b1d5/scratchpad"
exec(open(f"{P}/debate.py").read().split("for n, fn in")[0])
from PIL import Image, ImageDraw, ImageEnhance

LOGO = "/mnt/user-data/attachments/2558adb6-7612-5127-8218-5436c5f6b1d5/2c9215bc-image.jpg"

def logo_circle(size):
    lg = Image.open(LOGO).convert("RGB")
    w, h = lg.size
    # crop to the round badge (slight inset to drop white corners)
    m = int(min(w, h) * 0.085)
    lg = lg.crop((m, m, w - m, h - m)).resize((size, size), Image.LANCZOS)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size - 1, size - 1), fill=255)
    return lg, mask

def header(im, d, cx0, cy0):
    r = 64
    lg, mk = logo_circle(2 * r)
    ax, ay = cx0 + 46, cy0 + 46
    im.paste(lg, (ax, ay), mk)
    d.text((ax + 2 * r + 26, ay + 20), "FlavioBolsonaroUSA", font=F(B, 44), fill=(15, 15, 15))
    d.text((ax + 2 * r + 26, ay + 76), "Página de apoiadores", font=F(R, 34), fill=(110, 110, 110))
    return ay + 2 * r + 46

def agora(d, x, y):
    d.ellipse((x, y + 10, x + 36, y + 46), fill=(220, 30, 30))
    d.text((x + 50, y), "AGORA:", font=F(B, 58), fill=(220, 30, 30))
    return y + 82

# ---------- Miami ----------
W, H = 1080, 1920
im = Image.new("RGB", (W, H), (0, 0, 0)); d = ImageDraw.Draw(im)
cx0, cy0, cx1, cy1 = 40, 150, 1040, 1060
d.rounded_rectangle((cx0, cy0, cx1, cy1), 36, fill=(255, 255, 255))
y = header(im, d, cx0, cy0)
y = agora(d, cx0 + 50, y)
for ln in ["Moraes cancelou o passaporte.", "Flávio está em Miami, em", "segurança, com visto dos EUA."]:
    d.text((cx0 + 50, y), ln, font=F(B, 56), fill=(15, 15, 15)); y += 72
y += 24
for ln in ["Trump: “Achei que ele e sua", "família foram tratados de", "forma muito injusta.”"]:
    d.text((cx0 + 50, y), ln, font=F(R, 52), fill=(15, 15, 15)); y += 66
d.text((cx0 + 50, y + 26), "Fontes: CNN Brasil; Metrópoles · 28/10/2026", font=F(R, 30), fill=(120, 120, 120))
src = Image.open("/mnt/user-data/attachments/2558adb6-7612-5127-8218-5436c5f6b1d5/01e6d342-image.png").convert("RGB")
sx = src.size[0] / 924
ph = src.crop(tuple(int(v * sx) for v in (12, 240, 912, 1100)))
ph = ImageEnhance.Contrast(ph).enhance(1.06)
pw = 1000; ph = ph.resize((pw, int(pw * ph.size[1] / ph.size[0])), Image.LANCZOS)
ph = ph.crop((0, 0, pw, min(ph.size[1], H - cy1 - 140)))
mask = Image.new("L", ph.size, 0); ImageDraw.Draw(mask).rounded_rectangle((0, 0, ph.size[0], ph.size[1]), 30, fill=255)
im.paste(ph, (40, cy1 + 40), mask)
d.text((W // 2, H - 60), "Foto: reprodução redes sociais", font=F(R, 26), fill=(130, 130, 130), anchor="ma")
im.save("/home/claude/post2/tweet_agora_miami.png")

# ---------- Anistia ----------
random.seed(7)
im = bg.copy(); d = ImageDraw.Draw(im)
cx0, cy0, cx1, cy1 = 40, 180, 1040, 1050
d.rounded_rectangle((cx0, cy0, cx1, cy1), 36, fill=(255, 255, 255))
y = header(im, d, cx0, cy0)
y = agora(d, cx0 + 50, y)
for ln in ["Alcolumbre avalia negociar", "anistia ou indulto para", "Bolsonaro em troca de votos", "da direita no Senado."]:
    d.text((cx0 + 50, y), ln, font=F(B, 56), fill=(15, 15, 15)); y += 70
y += 20
for ln in ["E o Planalto já acendeu", "o alerta."]:
    d.text((cx0 + 50, y), ln, font=F(R, 52), fill=(15, 15, 15)); y += 64
d.text((cx0 + 50, y + 24), "Fontes: GloboNews; Folha; Metrópoles · 28–29/10", font=F(R, 30), fill=(120, 120, 120))
y = 1130
y = big(d, "EM 2027:", y, 100)
y = bar(d, "29 SENADORES DO PL", y + 10, 80, YEL, BLK)
y = small(d, "A maior bancada do Senado.", y + 20, 52, WHITE, B)
bar(d, "VOCÊ APOIA A ANISTIA?", y + 60, 72, RED, WHITE)
small(d, "Ainda não há acordo fechado, segundo aliados de Alcolumbre.", H - 110, 30, (150, 150, 150))
im.save("/home/claude/post2/tweet_anistia.png")

prev = Image.new("RGB", (1080, 960))
prev.paste(Image.open("/home/claude/post2/tweet_agora_miami.png").resize((540, 960)), (0, 0))
prev.paste(Image.open("/home/claude/post2/tweet_anistia.png").resize((540, 960)), (540, 0))
prev.save(f"{P}/tw_both.png")
print("ok")
