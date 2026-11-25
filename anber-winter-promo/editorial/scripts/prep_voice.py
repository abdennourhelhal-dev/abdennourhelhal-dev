"""Prepare the voice-over clips for the reel.

usage: python3 -I scripts/prep_voice.py <out_dir> <clip1> <clip2> ...   (clips in script order)

For each clip: trim leading/trailing silence (keeping a short pre-roll and tail), high-pass
80 Hz, gentle denoise, light compression, then two-pass EBU R128 loudness normalisation to
-16 LUFS / -1.5 dBTP. Writes vo1.wav, vo2.wav, ... (48 kHz stereo) and prints each duration
in seconds and frames (30 fps) so the scenes can be timed to the voice.
"""
import json
import os
import subprocess
import sys

FPS = 30
PRE = (
    "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.06,"
    "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.15,areverse,"
    "highpass=f=80,afftdn=nf=-30,"
    "acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=1.5"
)


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, check=True)


def measure(src):
    r = run(['ffmpeg', '-hide_banner', '-i', src, '-af', PRE + ',loudnorm=I=-16:TP=-1.5:LRA=9:print_format=json', '-f', 'null', '-'])
    txt = r.stderr
    return json.loads(txt[txt.rindex('{'):txt.rindex('}') + 1])


def main():
    out, clips = sys.argv[1], sys.argv[2:]
    os.makedirs(out, exist_ok=True)
    for i, src in enumerate(clips, 1):
        m = measure(src)
        ln = (f"loudnorm=I=-16:TP=-1.5:LRA=9:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
              f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
        dst = os.path.join(out, f'vo{i}.wav')
        run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', src, '-af', PRE + ',' + ln,
             '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', dst])
        d = float(run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', dst]).stdout)
        print(f'vo{i}: {d:.2f}s = {d * FPS:.0f} frames (input {m["input_i"]} LUFS)')


if __name__ == '__main__':
    main()
