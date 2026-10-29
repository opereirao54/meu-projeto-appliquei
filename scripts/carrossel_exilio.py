S = "/tmp/claude-0/-home-claude/2558adb6-7612-5127-8218-5436c5f6b1d5/scratchpad"
exec(open(f"{S}/debate.py").read().split("for n, fn in")[0])
from PIL import Image, ImageEnhance, ImageFilter
import os
OUT = "/home/claude/post2/carrossel_exilio"
os.makedirs(OUT, exist_ok=True)
NAVY = (20, 40, 95)
TOTAL = 7

def photo(path, box, fade_from=560):
    src = Image.open(path).convert("RGB")
    ph = src.crop(box).resize((1080, 864), Image.LANCZOS)
    ph = ph.filter(ImageFilter.UnsharpMask(2, 60, 2)); ph = ImageEnhance.Contrast(ph).enhance(1.12)
    m = Image.new("L", ph.size, 255); md = ImageDraw.Draw(m)
    for y in range(fade_from, 864): md.line((0, y, 1080, y), fill=int(255 * (864 - y) / (864 - fade_from)))
    return ph, m

def news(d, y0, label, lines, sub, src, color=RED, size=50):
    h = 98 + len(lines) * (size + 12) + 110
    cx0, cx1 = 70, 1010
    d.rounded_rectangle((cx0 + 10, y0 + 12, cx1 + 10, y0 + h + 12), 22, fill=(0, 0, 0))
    d.rounded_rectangle((cx0, y0, cx1, y0 + h), 22, fill=(246, 244, 238))
    d.rounded_rectangle((cx0, y0, cx1, y0 + 70), 22, fill=color); d.rectangle((cx0, y0 + 40, cx1, y0 + 70), fill=color)
    d.text((cx0 + 36, y0 + 35), label, font=F(B, 34), fill=WHITE, anchor="lm")
    y = y0 + 98
    for ln in lines:
        d.text((cx0 + 36, y), ln, font=F(B, size), fill=(20, 20, 20)); y += size + 12
    d.text((cx0 + 36, y + 14), sub, font=F(R, 29), fill=(70, 70, 70))
    d.text((cx0 + 36, y + 58), "Fonte: " + src, font=F(R, 28), fill=(120, 120, 120))
    return y0 + h

def head(d, n, title):
    d.text((W - 70, 70), f"{n}/{TOTAL}", font=F(B, 40), fill=(170, 170, 170), anchor="ra")
    d.text((70, 70), "POR QUE É EXÍLIO", font=F(B, 40), fill=YEL)

def new():
    random.seed(7); im = bg.copy(); return im, ImageDraw.Draw(im)

G1 = "/mnt/user-data/attachments/2558adb6-7612-5127-8218-5436c5f6b1d5/a5edb835-image.png"

# 1 — capa
im, d = new()
ph, m = photo(G1, (190, 1290, 1010, 1946), 600); im.paste(ph, (0, 0), m); d = ImageDraw.Draw(im)
d.text((W - 70, 70), f"1/{TOTAL}", font=F(B, 40), fill=(230, 230, 230), anchor="ra")
y = 900
y = big(d, "NÃO É FUGA.", y, 140)
y = bar(d, "É EXÍLIO.", y + 10, 140, YEL, BLK)
y = small(d, "6 motivos, com fonte, pra você entender", y + 50, 50, WHITE, B)
small(d, "Arrasta pro lado →", y + 40, 46, (200, 200, 200))
small(d, "Imagem: reprodução g1", H - 80, 26, (130, 130, 130))
im.save(f"{OUT}/1.png")

# 2 — 7 minutos
im, d = new(); head(d, 2, "")
d.text((W // 2, 260), "7", font=F(B, 420), fill=YEL, anchor="ma", stroke_width=8, stroke_fill=BLK)
y = bar(d, "MINUTOS.", 760, 120, RED, WHITE)
y = news(d, y + 50, "28/10/2026", ["PF pediu o passaporte de Flávio", "7 minutos após a confirmação", "matemática do resultado"],
         "Pedido protocolado na própria noite da eleição.", "O Povo")
small(d, "Mal acabou a eleição, já tinha pedido pronto.", y + 70, 46, WHITE, B)
im.save(f"{OUT}/2.png")

# 3 — sem PGR
im, d = new(); head(d, 3, "")
y = big(d, "DECIDIU", 330, 150)
y = bar(d, "SEM OUVIR A PGR.", y + 10, 100, YEL, BLK)
y = news(d, y + 70, "28/10/2026", ["Moraes decidiu sem consultar a", "Procuradoria-Geral da República,", "o que não é o usual"],
         "O próprio Ministério Público não foi ouvido antes.", "O Povo")
small(d, "Pressa assim é justiça ou recado?", y + 70, 50, WHITE, B)
im.save(f"{OUT}/3.png")

# 4 — sem denúncia
im, d = new(); head(d, 4, "")
y = big(d, "NENHUMA", 330, 150)
y = bar(d, "DENÚNCIA.", y + 10, 130, RED, WHITE)
y = big(d, "NENHUMA", y + 30, 150)
y = bar(d, "CONDENAÇÃO.", y + 10, 104, RED, WHITE)
y = news(d, y + 60, "OUTUBRO/2026", ["Não há denúncia nem condenação", "contra Flávio. A PF não achou", "contrapartida dele no caso"],
         "Mesmo assim: passaporte cancelado e pedido de prisão.", "Gazeta do Povo; TIME", size=46)
im.save(f"{OUT}/4.png")

# 5 — Interpol
im, d = new(); head(d, 5, "")
y = big(d, "DOIS DIAS", 330, 150)
y = big(d, "DEPOIS:", y, 150)
y = bar(d, "INTERPOL.", y + 10, 140, YEL, BLK)
y = news(d, y + 60, "27/10/2026", ["Deputados do PT pedem prisão", "preventiva de Flávio e o nome", "dele na lista vermelha da Interpol"],
         "Pedido enviado a Alexandre de Moraes.", "Gazeta do Povo", size=48)
small(d, "59,8 milhões de votos não bastam?", y + 70, 50, WHITE, B)
im.save(f"{OUT}/5.png")

# 6 — até o governo
im, d = new(); head(d, 6, "")
y = big(d, "ATÉ O", 330, 150)
y = big(d, "GOVERNO", y, 150)
y = bar(d, "ACHOU EXAGERO.", y + 10, 92, RED, WHITE)
y = news(d, y + 60, "27/10/2026", ["Nos bastidores, o governo avalia", "que a ordem de Moraes foi", "precipitada"],
         "E teme transformar Flávio em símbolo de resistência.", "ND Mais", size=48)
im.save(f"{OUT}/6.png")

# 7 — recebido + CTA
im, d = new(); head(d, 7, "")
y = news(d, 200, "28/10/2026", ["EUA vão conceder vistos a", "Flávio e à família"],
         "Trump: “Eu aprovaria. Acho que são boas pessoas.”", "Metrópoles; Bloomberg via Exame", color=NAVY)
y = big(d, "PERSEGUIDO AQUI.", y + 90, 88)
y = bar(d, "RECEBIDO LÁ.", y + 10, 110, YEL, BLK)
y = big(d, "NÃO É FUGA.", y + 70, 130)
y = bar(d, "É EXÍLIO.", y + 10, 130, RED, WHITE)
small(d, "Concorda? Comenta e compartilha 👇".replace(" 👇", ""), y + 60, 52, WHITE, B)
im.save(f"{OUT}/7.png")

sheet = Image.new("RGB", (270 * 4, 480 * 2))
for i in range(TOTAL):
    sheet.paste(Image.open(f"{OUT}/{i+1}.png").resize((270, 480)), ((i % 4) * 270, (i // 4) * 480))
sheet.save(f"{S}/ex_sheet.png")
print("ok")
