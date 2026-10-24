#!/usr/bin/env bash
# Encodes the closing-section arch video from public/video/begin-arch.mp4 (the 716x1284 source).
# The first run moves the source to media-src/ (gitignored) so the encoded mp4 can take its name.
# Outputs: public/video/begin-arch.webm (VP9), public/video/begin-arch.mp4 (H.264, faststart,
# keyframe every 12 frames for smooth scrubbing), public/video/begin-arch-poster.jpg (frame 0, 1200px tall).
set -euo pipefail
cd "$(dirname "$0")/.."
SRC=media-src/begin-arch.mp4
OUT=public/video
mkdir -p media-src "$OUT"
if [ ! -f "$SRC" ]; then
  if [ -f "$OUT/begin-arch.mp4" ]; then mv "$OUT/begin-arch.mp4" "$SRC"; else echo "Put the source at $OUT/begin-arch.mp4 first." >&2; exit 1; fi
fi
LIMIT=$((2500 * 1024))
size() { stat -c %s "$1" 2>/dev/null || stat -f %z "$1"; }

crf=33
until ffmpeg -y -v error -i "$SRC" -an -c:v libvpx-vp9 -b:v 0 -crf "$crf" -row-mt 1 -g 12 "$OUT/begin-arch.webm" && [ "$(size "$OUT/begin-arch.webm")" -le "$LIMIT" ]; do crf=$((crf + 3)); echo "webm over 2.5 MB, retrying at CRF $crf"; done

crf=26
until ffmpeg -y -v error -i "$SRC" -an -c:v libx264 -crf "$crf" -preset slow -pix_fmt yuv420p -g 12 -movflags +faststart "$OUT/begin-arch.mp4" && [ "$(size "$OUT/begin-arch.mp4")" -le "$LIMIT" ]; do crf=$((crf + 2)); echo "mp4 over 2.5 MB, retrying at CRF $crf"; done

q=3
until ffmpeg -y -v error -i "$SRC" -frames:v 1 -vf "scale=-2:1200" -q:v "$q" "$OUT/begin-arch-poster.jpg" && [ "$(size "$OUT/begin-arch-poster.jpg")" -le $((120 * 1024)) ]; do q=$((q + 1)); done

for f in begin-arch.webm begin-arch.mp4 begin-arch-poster.jpg; do printf '%-24s %6s KB\n' "$f" "$(( $(size "$OUT/$f") / 1024 ))"; done
