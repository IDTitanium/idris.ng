# BytesBurn welcome audio

The public recording is a lightly processed copy of the MP3 supplied by Idris on September 8, 2026. The source in his Documents directory remains untouched. Audio processing was performed locally; no audio was uploaded to an external cleanup or transcription service.

## Processing

- Removed the first 5.15 seconds of digital silence, retaining roughly a third of a second before speech begins. Internal pauses and speaking speed are unchanged.
- Applied a 70 Hz high-pass filter for low-frequency rumble.
- Applied conservative FFT noise reduction: 5 dB reduction setting, -50 dB noise-floor setting, gain smoothing 8. Quiet source pauses measured around -52 to -53 dB RMS.
- Added 20 ms opening / 40 ms closing fades to soften file boundaries.
- Used measured two-pass loudness processing targeting -16 LUFS and -2 dBTP. This controls new peaks; it does not reconstruct any distortion already present in the source.
- Encoded a 44.1 kHz stereo MP3 at 160 kb/s and removed inherited metadata. Pitch and timing effects, music, and synthesized speech were not added.

## Measurements

Measured from decoded audio (final values remeasured after MP3 encoding):

| Metric | Original | Cleaned |
| --- | --- | --- |
| Decoded duration | 30.00 seconds | approximately 24.85 seconds |
| Integrated loudness | -16.79 LUFS | -16.82 LUFS |
| True peak | +0.15 dBTP | -2.36 dBTP |

The goal was a quicker, cleaner opening and controlled peaks, not simply making an already reasonably loud voice louder. These are signal measurements, not a substitute for Idris's listening review.

Source SHA-256: `8eee6ce215901ad4d839ff1e676f7b9eb96d29b4671ed0c2f0e2ce6da2e931ae`

Cleaned SHA-256: `56ab0c4d647e7df2db07110a052ec6a081d0f5a4ff8257b00646f3eef8ffc1b1`

## Recipe

FFmpeg 7.0.2 was used. Run this against the original, never against an already compressed cleanup copy. Choose a new output filename to preserve previous versions. This recipe is specific to the measurements above; remeasure before using it on another recording.

```sh
ffmpeg -n -i ORIGINAL.mp3 -map_metadata -1 \
  -af 'atrim=start=5.15,asetpts=PTS-STARTPTS,highpass=f=70,afftdn=nr=5:nf=-50:gs=8,afade=t=in:st=0:d=0.02,areverse,afade=t=in:st=0:d=0.04,areverse,loudnorm=I=-16:TP=-2:LRA=11:measured_I=-17.05:measured_TP=1.25:measured_LRA=6.00:measured_thresh=-27.56:offset=0.52:linear=false:print_format=json' \
  -ar 44100 -c:a libmp3lame -b:a 160k CLEANED.mp3
```

Filter reference: [FFmpeg audio filters](https://ffmpeg.org/ffmpeg-filters.html).

The website serves `public/audio/bytesburn-welcome.mp3` only after explicit playback. The transcript remains unset until Idris confirms the actual recorded wording.
