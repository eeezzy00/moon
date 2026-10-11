"""Меряет громкость треков в music/ (EBU R128, LUFS) и пишет поправки в src/lib/radio-levels.json.
Плеер подтягивает каждый трек к одной громкости (TARGET) через свою шину.
Запуск после добавления треков: npm run music:levels  (нужен Python и пакет imageio-ffmpeg)."""
import glob, json, os, re, subprocess
import imageio_ffmpeg

TARGET = -16.0  # LUFS, общая громкость радио
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ff = imageio_ffmpeg.get_ffmpeg_exe()
levels = {}
for path in sorted(glob.glob(os.path.join(ROOT, 'music', '**', '*.*'), recursive=True)):
    if not path.lower().endswith(('.mp3', '.ogg', '.m4a', '.wav')):
        continue
    out = subprocess.run([ff, '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128', '-f', 'null', '-'],
                         capture_output=True, text=True, encoding='utf8', errors='ignore').stderr
    lufs = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', out)[-1])
    key = os.path.relpath(path, os.path.join(ROOT, 'music')).replace(os.sep, '/')
    levels[key] = round(min(0.0, TARGET - lufs), 1)  # только тише: громкие треки опускаем до общей громкости
    print(f'{key}: {lufs} LUFS -> {levels[key]} dB')
with open(os.path.join(ROOT, 'src', 'lib', 'radio-levels.json'), 'w', encoding='utf8') as f:
    json.dump(levels, f, indent=2, ensure_ascii=False)
    f.write('\n')
