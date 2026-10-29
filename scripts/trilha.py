import numpy as np, subprocess, wave

SR = 44100
S = "/tmp/claude-0/-home-claude/2558adb6-7612-5127-8218-5436c5f6b1d5/scratchpad"
VID = "/home/claude/post2/video_debate_lula.mp4"
DUR = 64.13
N = int(DUR * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(3)

def env_ad(n, a, d):
    e = np.ones(n); ai = int(a * SR); e[:ai] = np.linspace(0, 1, ai)
    e[ai:] = np.exp(-np.arange(n - ai) / (d * SR)); return e

def lowpass(x, alpha):
    y = np.zeros_like(x); acc = 0.0
    for i in range(len(x)):
        acc += alpha * (x[i] - acc); y[i] = acc
    return y

def impact(dur=2.2, f0=48):
    n = int(dur * SR); tt = np.arange(n) / SR
    f = f0 + 70 * np.exp(-tt * 18)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(n, 0.004, 0.55)
    nz = lowpass(rng.standard_normal(n), 0.08) * env_ad(n, 0.002, 0.12) * 1.5
    return np.tanh((boom + nz) * 1.6) * 0.9

def kick(f0=50):
    n = int(0.35 * SR); tt = np.arange(n) / SR
    f = f0 + 90 * np.exp(-tt * 40)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(n, 0.002, 0.09)

def riser(dur):
    n = int(dur * SR); tt = np.arange(n) / SR
    nz = rng.standard_normal(n); out = np.zeros(n); acc = 0.0
    alphas = np.linspace(0.01, 0.35, n)
    for i in range(n):
        acc += alphas[i] * (nz[i] - acc); out[i] = acc
    tone = np.sin(2 * np.pi * np.cumsum(np.linspace(110, 440, n)) / SR) * 0.25
    return (out * 1.2 + tone) * (tt / dur) ** 2

def drone(t0, t1, root=55.0):
    n = int((t1 - t0) * SR); tt = np.arange(n) / SR
    x = (np.sin(2 * np.pi * root * tt) * 0.5 + np.sin(2 * np.pi * root * 1.004 * tt) * 0.4
         + np.sin(2 * np.pi * root * 1.5 * tt) * 0.18 + np.sin(2 * np.pi * root * 2.0 * tt + 0.3) * 0.12
         + np.sin(2 * np.pi * root * 1.189 * tt) * 0.12)  # minor third, dark
    x *= 0.75 + 0.25 * np.sin(2 * np.pi * 0.25 * tt)
    fade = int(0.25 * SR); x[:fade] *= np.linspace(0, 1, fade); x[-fade:] *= np.linspace(1, 0, fade)
    return x * 0.35

mix = np.zeros(N)
def put(sig, at, gain=1.0):
    i = int(at * SR); j = min(N, i + len(sig)); mix[i:j] += sig[:j - i] * gain

intro = [(0.8, 4.8), (4.8, 9.8)]
outro = [(46.6, 50.6), (50.6, 54.1), (54.1, 59.6), (59.6, DUR)]

# drones under the card sections (not under the debate)
put(drone(0.0, 9.8, 55.0), 0.0)
put(drone(46.6, DUR, 49.0), 46.6)

# impacts on every card change
for s, _ in intro + outro:
    put(impact(), s, 0.9)
put(impact(3.0, 40), 59.6, 1.1)   # final, heavier

# heartbeat pulse (double kick) on cards
def heartbeat(t0, t1, bpm):
    p = 60 / bpm; x = t0 + 0.5
    while x < t1 - 0.3:
        put(kick(), x, 0.55); put(kick(), x + 0.22, 0.35); x += p
heartbeat(0.8, 9.8, 78)
heartbeat(46.6, 59.6, 92)   # a bit faster on the payoff

# riser into the debate clip and into the final card
put(riser(1.5), 8.3, 0.5)
put(riser(1.4), 58.2, 0.45)

# soft whoosh on cover
put(riser(0.7)[::-1], 0.1, 0.35)

mix = np.tanh(mix * 0.9) * 0.5
st = np.stack([mix, mix], 1)
with wave.open(f"{S}/bed.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype(np.int16).tobytes())

subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", VID, "-i", f"{S}/bed.wav",
    "-filter_complex", "[0:a][1:a]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[a]",
    "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", f"{S}/withsound.mp4"], check=True)
print("ok")
