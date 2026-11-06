# Sahana — cursor-tracking hero

```bash
npm install
npm run dev          # http://localhost:5173
npm run build
```

## How it works
* `scripts/extract_frames.py` (OpenCV) reads `public/character.mp4` **once, offline** and writes
  64 WebP frames (`public/frames/00.webp … 63.webp`, 5.625° apart) + `center.webp` + `meta.json`.
  Frame `i` points at screen angle `-90° + i·5.625°` (i=0 UP, clockwise).
* `src/CharacterCanvas.jsx` preloads the frames as `ImageBitmap`s and, in one `requestAnimationFrame` loop,
  smooths `atan2(dy, dx)` with a shortest-path `lerpAngle` (0.26/frame), maps it to the nearest index and draws
  **one** opaque frame. No video playback or seeking, no CSS 3D, no cross-fading.
* Within 12% of the screen of her face it draws `center.webp` (eye contact; 15% hysteresis on exit).
* `prefers-reduced-motion` shows the neutral frame only.

## Compass → source frame numbers (`character.mp4` = your `character1.mp4`, 240 frames @ 24fps)
UP 18 · UP-RIGHT 33 · RIGHT 70 · DOWN-RIGHT 106 · DOWN 120 · DOWN-LEFT 135 · LEFT 148 · UP-LEFT 168 · neutral 0

## Background
Source video `#e40600`; after lossy WebP decode it is `#e50700`. `meta.json` stores the decoded value and the
app sets `--bg` from it, so page, canvas and frames are pixel-identical.

Re-run extraction: `pip install opencv-python numpy mediapipe==0.10.14 && npm run frames`
(mediapipe is only used to mask the eyes during cursor clean-up).
