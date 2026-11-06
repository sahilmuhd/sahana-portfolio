#!/usr/bin/env python3
"""
Pre-extract 64 head-rotation WebP frames (+ center.webp) from public/character.mp4.

  pip install opencv-python numpy mediapipe==0.10.14
  python scripts/extract_frames.py

Frame i (0..63) shows the head pointing at screen angle  -90deg + i * 5.625deg,
i.e. i=0 is UP and the index increases clockwise: UP, UP-RIGHT, RIGHT, ... UP-LEFT.
That is exactly atan2(dy, dx) in screen coordinates, so the runtime only needs
idx = round((angle + 90deg) / 5.625deg) mod 64.

What the script does
  1. Probes the video (frame count / fps) and measures the exact background colour.
  2. Maps the 8 compass directions to video frame numbers (COMPASS below, found by
     head-pose analysis + visual review) and interpolates 64 targets along that loop.
  3. For each target, picks the cleanest nearby frame. The source clip was screen-recorded
     and has a baked-in mouse cursor / ring / trail; cursor icons are detected and inpainted.
  4. Stabilises the torso (phase correlation) so the body stays motionless.
  5. Flattens the background to the exact flat colour, crops, writes WebP + meta.json.
"""
import cv2, json
import numpy as np
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VIDEO = ROOT / "public" / "character.mp4"
OUT = ROOT / "public" / "frames"
N = 64
STEP = 360.0 / N
QUALITY = 92

# compass direction -> (video frame, screen angle in degrees; up=-90, clockwise positive)
COMPASS = [
    ("UP",         18,  -90), ("UP_RIGHT",  33,  -45), ("RIGHT",     70,    0),
    ("DOWN_RIGHT", 106,  45), ("DOWN",     120,   90), ("DOWN_LEFT", 135,  135),
    ("LEFT",       148, 180), ("UP_LEFT",  168,  225), ("UP_LEFT2",  175,  247.5),
]
NEUTRAL_FRAME = 0   # cursor sits on smooth forehead skin here (the end frames have it on the nose)
# ranges where the cursor trail runs over hair / eyes / cheek (not cleanly removable) -> avoided
TRAIL_BAD = list(range(22, 35)) + list(range(172, 240))


def load():
    cap = cv2.VideoCapture(str(VIDEO))
    n, fps = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)), cap.get(cv2.CAP_PROP_FPS)
    print(f"video: {n} frames @ {fps:.1f}fps, {int(cap.get(3))}x{int(cap.get(4))}")
    frames = []
    while True:
        ok, f = cap.read()
        if not ok:
            break
        frames.append(f)
    return np.array(frames)


def eye_masks_and_anchor(frames, idxs):
    import mediapipe as mp
    fm = mp.solutions.face_mesh
    C = mp.solutions.face_mesh_connections
    mesh = fm.FaceMesh(static_image_mode=True, max_num_faces=1, refine_landmarks=True, min_detection_confidence=0.3)
    H, W = frames.shape[1:3]
    out, anchors = {}, {}
    for i in idxs:
        r = mesh.process(cv2.cvtColor(frames[i], cv2.COLOR_BGR2RGB))
        m = np.zeros((H, W), np.uint8)
        if r.multi_face_landmarks:
            L = r.multi_face_landmarks[0].landmark
            for side in (C.FACEMESH_LEFT_EYE, C.FACEMESH_RIGHT_EYE):
                ids = sorted({a for a, b in side} | {b for a, b in side})
                hull = cv2.convexHull(np.array([[L[k].x * W, L[k].y * H] for k in ids], np.float32))
                cv2.fillConvexPoly(m, hull.astype(np.int32), 255)
            anchors[i] = ((L[168].x + L[2].x) / 2 * W, (L[168].y + L[2].y) / 2 * H)
        out[i] = cv2.dilate(m, np.ones((9, 9), np.uint8))
    return out, anchors


def cursor_mask(f, eyes, bg):
    """arrow / hand / ring: near-white + black-outline neutral pixels, excluding the eyes (catchlights)."""
    hsv = cv2.cvtColor(f, cv2.COLOR_BGR2HSV)
    S, V = hsv[..., 1].astype(int), hsv[..., 2].astype(int)
    white = (V >= 205) & (S <= 45) & (eyes == 0) & ~(np.abs(f.astype(int) - bg).sum(2) < 60)
    m = white.astype(np.uint8)
    mx, mn = f.max(2).astype(int), f.min(2).astype(int)
    dark = ((mx <= 50) & (mx - mn <= 20) & (eyes == 0)).astype(np.uint8)
    m |= dark & cv2.dilate(m, np.ones((9, 9), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    keep = np.zeros_like(m)
    for k in range(1, n):
        if st[k, 4] >= 40:          # ignore specks on the shawl's bead trim
            keep[lab == k] = 1
    # generous growth: swallows the anti-aliased grey fringe of the arrow / ring / hand
    return cv2.dilate(keep, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))


def trail_mask(f, eyes, bg, box=(30, 235, 400, 900)):
    """Faint translucent trail streak across sunlit forehead skin: a thin, bright, desaturated ridge."""
    y0, y1, x0, x1 = box
    lab = cv2.cvtColor(f, cv2.COLOR_BGR2LAB).astype(np.float32)
    L, ch = lab[..., 0], np.hypot(lab[..., 1] - 128, lab[..., 2] - 128)
    g = lambda a, s: cv2.GaussianBlur(a, (0, 0), s)
    dL, dC = g(L, 1.8) - g(L, 9), g(ch, 1.8) - g(ch, 9)
    hs = cv2.cvtColor(f, cv2.COLOR_BGR2HSV)
    skin = (hs[..., 0] < 25) & (hs[..., 1] > 55) & (hs[..., 2] > 140)
    solid = cv2.morphologyEx((np.abs(f.astype(int) - bg).sum(2) > 70).astype(np.uint8), cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))
    inner = cv2.distanceTransform(solid, cv2.DIST_L2, 3) > 22          # keep out of the hairline / silhouette
    ok = np.zeros(L.shape, bool); ok[y0:y1, x0:x1] = True
    ok &= inner & (eyes == 0) & skin
    seeds = ((dL > 2.0) & (dC < -1.5) & ok).astype(np.uint8)
    weak = (((dL > 0.9) & (dC < -0.5)) & ok).astype(np.uint8)
    cur = seeds.copy()
    for _ in range(20):
        cur = cv2.dilate(cur, np.ones((3, 3), np.uint8)) & (weak | seeds)
    n, lab_, st, _ = cv2.connectedComponentsWithStats(cur)
    out = np.zeros_like(cur)
    for k in range(1, n):
        if st[k, 4] >= 60 and max(st[k, 2], st[k, 3]) >= 26:
            out[lab_ == k] = 1
    return cv2.dilate(out, np.ones((9, 9), np.uint8))


def flatten_bg(f, bg):
    """Everything that isn't the character (cursor debris, green dot, noise) -> exact bg colour."""
    d = np.abs(f.astype(int) - bg).sum(2)
    m = cv2.morphologyEx((d > 70).astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    # strong opening drops thin trail streaks; the core is regrown only ~10px so hair/edge detail survives
    ell = lambda k: cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k))
    core = cv2.morphologyEx(m, cv2.MORPH_OPEN, ell(17))
    n, lab, st, _ = cv2.connectedComponentsWithStats(core)
    core = (lab == 1 + np.argmax(st[1:, 4])).astype(np.uint8)
    main = cv2.dilate(core, ell(21)) & cv2.dilate(m, np.ones((5, 5), np.uint8))
    w = np.clip((d - 25) / 65.0, 0, 1)[..., None]
    out = (f * w + bg * (1 - w)).astype(np.uint8)
    out[main == 0] = bg
    return out, main


def torso_shift(f, ref, bg):
    def g(x):
        d = np.abs(x.astype(int) - bg).sum(2)
        return np.clip(d, 0, 255).astype(np.float32)[540:720, 150:1150]
    (dx, dy), _ = cv2.phaseCorrelate(g(ref), g(f), cv2.createHanningWindow((1000, 180), cv2.CV_32F))
    return dx, dy


def main():
    frames = load()
    total = len(frames)
    patch = np.concatenate([frames[:, 5:60, 5:60].reshape(-1, 3), frames[:, 5:60, -60:-5].reshape(-1, 3)])
    bg = np.median(patch, 0).astype(np.uint8)
    hexc = "#%02x%02x%02x" % (bg[2], bg[1], bg[0])
    print("background:", hexc)

    kf = np.array([c[1] for c in COMPASS], float)
    ka = np.array([c[2] for c in COMPASS], float)
    targets = np.interp(-90 + np.arange(N) * STEP, ka, kf)

    cand = {NEUTRAL_FRAME}
    for t in targets:
        cand.update(f for f in range(int(t) - 9, int(t) + 10) if 0 <= f < total)
    eyes, anchors = eye_masks_and_anchor(frames, sorted(cand))
    masks = {f: cursor_mask(frames[f], eyes[f], bg) for f in cand}
    for f in cand:
        if 20 <= f <= 175:
            masks[f] = masks[f] | trail_mask(frames[f], eyes[f], bg)

    chosen, used = [], set()
    for t in targets:
        pool = [f for f in range(int(t) - 9, int(t) + 10) if f in cand]
        best = min(pool, key=lambda f: abs(f - t) + (50 if f in TRAIL_BAD else 0) + masks[f].sum() / 400 + (0.6 if f in used else 0))
        chosen.append(best)
        used.add(best)
    print("chosen frames:", chosen)
    print("compass frames:", {c[0]: c[1] for c in COMPASS}, "| neutral:", NEUTRAL_FRAME)

    ref = frames[NEUTRAL_FRAME]
    H, W = ref.shape[:2]
    imgs, boxes, shifts = [], [], []
    for f in chosen + [NEUTRAL_FRAME]:
        im = frames[f].copy()
        if masks[f].any():
            im = cv2.inpaint(im, masks[f], 8, cv2.INPAINT_TELEA)
        im, main_m = flatten_bg(im, bg)
        dx, dy = torso_shift(im, ref, bg)
        dx, dy = float(np.clip(-dx, -30, 30)), float(np.clip(-dy, -30, 30))
        M = np.float32([[1, 0, dx], [0, 1, dy]])
        im = cv2.warpAffine(im, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT, borderValue=bg.tolist())
        ys, xs = np.where(cv2.warpAffine(main_m, M, (W, H)) > 0)
        boxes.append((xs.min(), xs.max(), ys.min()))
        imgs.append(im)
        shifts.append((dx, dy))
    print("max torso correction px:", np.abs(np.array(shifts)).max(0).round(1))

    b = np.array(boxes)
    x0 = max(0, int(b[:, 0].min()) - 24)
    x1 = min(W, int(b[:, 1].max()) + 24)
    y0 = max(0, int(b[:, 2].min()) - 24)
    x1 -= (x1 - x0) % 2
    y0 += (H - y0) % 2
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("*.webp"):
        old.unlink()
    for i, im in enumerate(imgs):
        name = "center.webp" if i == N else f"{i:02d}.webp"
        cv2.imwrite(str(OUT / name), im[y0:H, x0:x1], [cv2.IMWRITE_WEBP_QUALITY, QUALITY])
    # lossy WebP round-trips the flat colour through YUV (can shift by 1) -> use the *decoded* value for the page
    dec = cv2.imread(str(OUT / "center.webp"))
    dbg = np.median(np.concatenate([dec[:20, :20].reshape(-1, 3), dec[:20, -20:].reshape(-1, 3)]), 0).astype(int)
    hexc_dec = "#%02x%02x%02x" % (dbg[2], dbg[1], dbg[0])
    print("source background", hexc, "-> decoded WebP background", hexc_dec)
    ax, ay = anchors[NEUTRAL_FRAME]
    ax, ay = ax + shifts[-1][0], ay + shifts[-1][1]
    meta = {"count": N, "width": x1 - x0, "height": H - y0, "background": hexc_dec, "sourceBackground": hexc,
            "anchor": [round((ax - x0) / (x1 - x0), 4), round((ay - y0) / (H - y0), 4)],
            "startAngleDeg": -90, "clockwise": True,
            "source": {"frames": total, "chosen": chosen, "compass": {c[0]: c[1] for c in COMPASS}, "neutral": NEUTRAL_FRAME}}
    (OUT / "meta.json").write_text(json.dumps(meta, indent=1))
    print("wrote", N + 1, "frames", meta["width"], "x", meta["height"], "anchor", meta["anchor"])


if __name__ == "__main__":
    main()
