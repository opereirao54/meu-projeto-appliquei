S = "/tmp/claude-0/-home-claude/2558adb6-7612-5127-8218-5436c5f6b1d5/scratchpad"
exec(open(f"{S}/debate.py").read().split("for n, fn in")[0])
from PIL import Image, ImageEnhance, ImageFilter
import os
OUT = "/home/claude/post2/carrossel_quem_julga"
os.makedirs(OUT, exist_ok=True)
NAVY = (20, 40, 95)

def photo(path, box, fade_from=560):
    src = Image.open(path).convert("RGB")
    ph = src.crop(box).resize((1080, 864), Image.LANCZOS)
    ph = ph.filter(ImageFilter.UnsharpMask(2, 60, 2)); ph = ImageEnhance.Contrast(ph).enhance(1.12)
    m = Image.new("L", ph.size, 255); md = ImageDraw.Draw(m)
    for y in range(fade_from, 864): md.line((0, y, 1080, y), fill=int(255 * (864 - y) / (864 - fade_from)))
    return ph, m

def news(d, y0, label, lines, subs, src, color=RED, size=48):
    h = 98 + len(lines) * (size + 12) + 20 + len(subs) * 40 + 60
    cx0, cx1 = 70, 1010
    d.rounded_rectangle((cx0 + 10, y0 + 12, cx1 + 10, y0 + h + 12), 22, fill=(0, 0, 0))
    d.rounded_rectangle((cx0, y0, cx1, y0 + h), 22, fill=(246, 244, 238))
    d.rounded_rectangle((cx0, y0, cx1, y0 + 70), 22, fill=color); d.rectangle((cx0, y0 + 40, cx1, y0 + 70), fill=color)
    d.text((cx0 + 36, y0 + 35), label, font=F(B, 34), fill=WHITE, anchor="lm")
    y = y0 + 98
    for ln in lines:
        d.text((cx0 + 36, y), ln, font=F(B, size), fill=(20, 20, 20)); y += size + 12
    y += 14
    for s in subs:
        d.text((cx0 + 36, y), s, font=F(R, 29), fill=(70, 70, 70)); y += 40
    d.text((cx0 + 36, y + 6), "Fonte: " + src, font=F(R, 27), fill=(120, 120, 120))
    return y0 + h

def new():
    random.seed(7); im = bg.copy(); return im, ImageDraw.Draw(im)

def tag(d, n):
    d.text((W - 70, 70), f"{n}/3", font=F(B, 40), fill=(220, 220, 220), anchor="ra")

# 1 — capa com Flávio
im, d = new()
ph, m = photo("/tmp/claude-0/-home-claude/2558adb6-7612-5127-8218-5436c5f6b1d5/scratchpad/ff_10.jpg", (240, 30, 940, 590)); im.paste(ph, (0, 0), m); d = ImageDraw.Draw(im); tag(d, 1)
y = big(d, "QUEM JULGA", 760, 140)
y = bar(d, "O FLÁVIO?", y + 10, 140, YEL, BLK)
y = news(d, y + 50, "CASO VORCARO · FLÁVIO", ["Flávio é investigado por pedir", "dinheiro a Vorcaro para o filme", "“Dark Horse”"],
         ["Ele diz que foi patrocínio privado, sem dinheiro público."], "Tribuna de Jundiaí; Jovem Pan")
small(d, "Arrasta pro lado →", y + 60, 46, (210, 210, 210))
small(d, "Imagem: TV Band", H - 70, 26, (130, 130, 130))
im.save(f"{OUT}/1.png")

# 2 — Moraes
im, d = new(); tag(d, 2)
d.text((70, 70), "CASO VORCARO · MORAES", font=F(B, 40), fill=YEL)
y = big(d, "O MESMO", 200, 140)
y = bar(d, "VORCARO.", y + 10, 140, RED, WHITE)
y = news(d, y + 50, "RELATÓRIO DA PF · 01/09/2026", ["Vorcaro a Moraes: “tenho gratidão", "da minha vida a você”"],
         ["Na mesma troca, fala em “dívida de vida” com a família."], "O Hoje", color=NAVY)
y = news(d, y + 40, "CONTRATO COM O MASTER", ["Escritório da esposa de Moraes", "tinha contrato de R$ 131 milhões", "com o Banco Master"],
         ["Segundo o Fisco, recebeu cerca de R$ 80 milhões."], "Poder360", color=NAVY)
im.save(f"{OUT}/2.png")

# 3 — pergunta
im, d = new(); tag(d, 3)
y = big(d, "FLÁVIO:", 280, 110)
y = bar(d, "PASSAPORTE CANCELADO.", y + 10, 66, RED, WHITE)
y = big(d, "QUEM DECIDIU:", y + 70, 110)
y = bar(d, "MORAES.", y + 10, 120, YEL, BLK)
y = big(d, "DOIS PESOS,", y + 90, 110)
y = big(d, "DUAS MEDIDAS?", y, 110, YEL)
small(d, "Comenta o que você acha 👇".replace(" 👇", ""), y + 50, 52, WHITE, B)
foot = ["A PF não encontrou mensagens sobre pagamentos a Moraes",
        "e não apontou crime. Moraes nega irregularidades e chama",
        "o relatório de “imprestável”. Fontes: DCM; Itatiaia."]
yy = H - 230
for ln in foot:
    d.text((W // 2, yy), ln, font=F(R, 30), fill=(160, 160, 160), anchor="ma"); yy += 40
im.save(f"{OUT}/3.png")

sheet = Image.new("RGB", (360 * 3, 640))
for i in range(3):
    sheet.paste(Image.open(f"{OUT}/{i+1}.png").resize((360, 640)), (i * 360, 0))
sheet.save("/tmp/claude-0/-home-claude/2558adb6-7612-5127-8218-5436c5f6b1d5/scratchpad/qj_sheet.png")
print("ok")
