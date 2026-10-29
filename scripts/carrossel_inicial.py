from PIL import Image, ImageDraw, ImageFont, ImageFilter
import random, os

W, H = 1080, 1920
OUT = "/home/claude/post2"
os.makedirs(OUT, exist_ok=True)
B = "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed-Bold.ttf"
R = "/usr/share/fonts/truetype/dejavu/DejaVuSansCondensed.ttf"
YEL = (245, 196, 0); RED = (178, 18, 24); WHITE = (250, 250, 250); BLK = (12, 12, 12)

def F(p, s): return ImageFont.truetype(p, s)

def base(n):
    random.seed(n)
    im = Image.new("RGB", (W, H), BLK)
    d = ImageDraw.Draw(im)
    # subtle green/yellow glow (flag colors) top
    glow = Image.new("RGB", (W, H), BLK)
    gd = ImageDraw.Draw(glow)
    gd.ellipse((-300, -400, 700, 500), fill=(0, 70, 35))
    gd.ellipse((500, -300, 1400, 450), fill=(90, 70, 0))
    glow = glow.filter(ImageFilter.GaussianBlur(220))
    im = Image.blend(im, glow, 0.6)
    d = ImageDraw.Draw(im)
    # grain
    for _ in range(25000):
        x, y = random.randrange(W), random.randrange(H)
        v = random.randrange(20, 45)
        d.point((x, y), fill=(v, v, v))
    # page counter
    d.text((W - 70, 70), f"{n}/6", font=F(B, 40), fill=(170, 170, 170), anchor="ra")
    return im, d

def brush(d, box, color):
    x0, y0, x1, y1 = box
    d.rectangle(box, fill=color)
    # rough edges
    for y in range(y0, y1, 6):
        d.polygon([(x0, y), (x0 - random.randint(8, 26), y + 3), (x0, y + 6)], fill=color)
        d.polygon([(x1, y), (x1 + random.randint(8, 26), y + 3), (x1, y + 6)], fill=color)

def wrap(d, text, font, maxw):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font=font) <= maxw: cur = t
        else: lines.append(cur); cur = w
    lines.append(cur); return lines

def para(d, text, y, size, color=WHITE, font=R, maxw=900, gap=1.3):
    f = F(font, size)
    for line in wrap(d, text, f, maxw):
        d.text((W // 2, y), line, font=f, fill=color, anchor="ma"); y += int(size * gap)
    return y

def bar_text(d, text, y, size, bg, fg, pad=22):
    f = F(B, size)
    tw = d.textlength(text, font=f)
    x0 = (W - tw) / 2 - pad * 2
    brush(d, (int(x0), y, int(x0 + tw + pad * 4), y + int(size * 1.25)), bg)
    d.text((W // 2, y + int(size * 0.62)), text, font=f, fill=fg, anchor="mm")
    return y + int(size * 1.25) + 18

def big(d, text, y, size, color=WHITE):
    f = F(B, size)
    d.text((W // 2, y), text, font=f, fill=color, anchor="ma", stroke_width=3, stroke_fill=BLK)
    return y + int(size * 1.08)

def source(d, txt):
    d.text((W // 2, H - 110), "Fonte: " + txt, font=F(R, 30), fill=(150, 150, 150), anchor="ma")

def card(d, y0, y1):
    d.rounded_rectangle((70, y0, W - 70, y1), radius=28, fill=(28, 28, 28), outline=(60, 60, 60), width=2)

# 1 — capa
im, d = base(1)
y = 470
y = big(d, "INQUÉRITO", y, 150)
y = big(d, "ABERTO A", y, 150)
y = bar_text(d, "DIAS DA ELEIÇÃO.", y + 20, 100, YEL, BLK)
y += 60
y = bar_text(d, "COINCIDÊNCIA?", y, 112, RED, WHITE)
para(d, "Arrasta pro lado e tira suas conclusões →", H - 300, 44, (210, 210, 210))
im.save(f"{OUT}/1.png")

# 2 — data
im, d = base(2)
y = big(d, "A DATA", 330, 150)
y = bar_text(d, "19 DE OUTUBRO", y + 10, 110, YEL, BLK)
card(d, y + 70, y + 600)
para(d, "O STF abriu um inquérito para investigar suspeitas de lavagem de dinheiro envolvendo Flávio Bolsonaro e o advogado Willer Tomaz.", y + 130, 56, maxw=820)
y2 = y + 760
y2 = bar_text(d, "EM PLENA RETA FINAL", y2, 76, RED, WHITE)
source(d, "Revista Oeste, 19/10/2026")
im.save(f"{OUT}/2.png")

# 3 — timing
im, d = base(3)
y = big(d, "O QUE DIZ", 330, 140)
y = bar_text(d, "A DEFESA", y + 10, 130, YEL, BLK)
card(d, y + 70, y + 560)
para(d, "A defesa de Willer Tomaz acusou Moraes de buscar provas contra o advogado em pleno período eleitoral.", y + 140, 60, maxw=820)
y2 = y + 720
para(d, "Investigar é normal.", y2, 64, WHITE, B)
para(d, "Mas por que justo agora?", y2 + 90, 64, YEL, B)
source(d, "SBT News")
im.save(f"{OUT}/3.png")

# 4 — negam
im, d = base(4)
y = big(d, "AMIZADE", 330, 150)
y = bar_text(d, "NÃO É CRIME", y + 10, 130, RED, WHITE)
card(d, y + 70, y + 760)
yy = para(d, "Flávio e Tomaz reconhecem que são amigos, mas negam ter negócios em conjunto.", y + 130, 54, maxw=820)
para(d, "A defesa de Tomaz chamou as medidas de desproporcionais e afirma que Flávio nunca movimentou as contas dele.", yy + 50, 54, maxw=820)
source(d, "Revista Oeste; Times Brasil")
im.save(f"{OUT}/4.png")

# 5 — jatinho
im, d = base(5)
y = big(d, "E O", 300, 150)
y = bar_text(d, "JATINHO?", y + 10, 150, YEL, BLK)
card(d, y + 60, y + 470)
para(d, "O jato em que Flávio viajou é o mesmo usado em outra viagem pelo próprio Alexandre de Moraes.", y + 120, 56, maxw=820)
y2 = y + 560
d.text((W // 2, y2), "Flávio respondeu no X:", font=F(R, 46), fill=(200, 200, 200), anchor="ma")
y2 = para(d, "“Imagina se fosse agora, eu teria viajado no avião de Alexandre de Moraes”", y2 + 90, 62, WHITE, B, maxw=860)
source(d, "Diario de Pernambuco; A Gazeta")
im.save(f"{OUT}/5.png")

# 6 — CTA
im, d = base(6)
y = big(d, "SE É", 420, 150)
y = bar_text(d, "DEMOCRACIA,", y + 10, 118, YEL, BLK)
y = big(d, "A RÉGUA TEM", y + 40, 100)
y = big(d, "QUE SER A MESMA", y, 100)
y = bar_text(d, "PARA TODOS.", y + 30, 118, RED, WHITE)
para(d, "Comenta: você acha que é coincidência?", y + 110, 54, WHITE, B)
para(d, "Segue a página pra próxima parte", y + 280, 44, (190, 190, 190))
im.save(f"{OUT}/6.png")
print("ok")
