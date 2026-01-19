from __future__ import annotations

import argparse
import json
import subprocess
from dataclasses import dataclass
from pathlib import Path

from faster_whisper import WhisperModel


@dataclass(frozen=True)
class Segment:
    start: float
    end: float
    text: str


def format_vtt_timestamp(seconds: float) -> str:
    if seconds < 0:
        seconds = 0
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = seconds % 60
    return f"{hours:02d}:{minutes:02d}:{secs:06.3f}".replace(".", ".")


def run_ffmpeg_extract_audio(*, ffmpeg_exe: Path, input_video: Path, output_wav: Path) -> None:
    output_wav.parent.mkdir(parents=True, exist_ok=True)

    cmd = [
        str(ffmpeg_exe),
        "-y",
        "-i",
        str(input_video),
        "-vn",
        "-ac",
        "1",
        "-ar",
        "16000",
        "-f",
        "wav",
        str(output_wav),
    ]

    completed = subprocess.run(cmd, capture_output=True, text=True)
    if completed.returncode != 0:
        raise RuntimeError(
            "ffmpeg failed\n\nSTDOUT:\n"
            + completed.stdout
            + "\n\nSTDERR:\n"
            + completed.stderr
        )


def write_transcript(*, output_txt: Path, segments: list[Segment], header_lines: list[str]) -> None:
    output_txt.parent.mkdir(parents=True, exist_ok=True)

    lines: list[str] = []
    lines.extend(header_lines)
    lines.append("")

    for seg in segments:
        lines.append(seg.text.strip())

    content = "\n".join(lines).strip() + "\n"
    output_txt.write_text(content, encoding="utf-8")


def write_vtt(*, output_vtt: Path, segments: list[Segment]) -> None:
    output_vtt.parent.mkdir(parents=True, exist_ok=True)

    lines: list[str] = ["WEBVTT", ""]

    for seg in segments:
        start = format_vtt_timestamp(seg.start)
        end = format_vtt_timestamp(seg.end)
        text = seg.text.strip()
        if not text:
            continue
        lines.append(f"{start} --> {end}")
        lines.append(text)
        lines.append("")

    output_vtt.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Transcribe The_TABS_Project.mp4 into transcript + VTT")
    parser.add_argument(
        "--ffmpeg",
        required=True,
        help="Path to ffmpeg executable (e.g., node_modules/ffmpeg-static/ffmpeg.exe)",
    )
    parser.add_argument(
        "--model",
        default="small",
        help="Whisper model size: tiny|base|small|medium|large-v3 (default: small)",
    )
    parser.add_argument(
        "--compute-type",
        default="int8",
        help="Compute type for faster-whisper (default: int8)",
    )
    parser.add_argument(
        "--language",
        default="en",
        help="Language code (default: en)",
    )

    repo_root = Path(__file__).resolve().parents[1]
    args = parser.parse_args()

    ffmpeg_exe = Path(args.ffmpeg)
    input_video = repo_root / "public" / "videos" / "The_TABS_Project.mp4"
    tmp_audio = repo_root / ".tmp" / "The_TABS_Project_16000_mono.wav"

    output_transcript = repo_root / "public" / "press-kit" / "The_TABS_Project.transcript.txt"
    output_vtt = repo_root / "public" / "videos" / "The_TABS_Project.en.vtt"

    if not ffmpeg_exe.exists():
        raise FileNotFoundError(f"ffmpeg not found: {ffmpeg_exe}")
    if not input_video.exists():
        raise FileNotFoundError(f"input video not found: {input_video}")

    print("Extracting audio with ffmpeg...")
    run_ffmpeg_extract_audio(ffmpeg_exe=ffmpeg_exe, input_video=input_video, output_wav=tmp_audio)

    print(f"Loading faster-whisper model: {args.model} ({args.compute_type})")
    model = WhisperModel(args.model, device="cpu", compute_type=args.compute_type)

    print("Transcribing...")
    segments_iter, info = model.transcribe(
        str(tmp_audio),
        language=args.language,
        vad_filter=True,
        beam_size=5,
    )

    segments: list[Segment] = []
    for seg in segments_iter:
        segments.append(Segment(start=float(seg.start), end=float(seg.end), text=str(seg.text)))

    header_lines = [
        "Introduction to The TABS Project — Transcript (Auto-generated)",
        "",
        f"Language: {info.language}",
        f"Model: faster-whisper {args.model} ({args.compute_type})",
        "",
        "Note: This transcript is auto-generated and may contain errors.",
        "Corrections: contact@technologyadoptionbarriers.org",
    ]

    write_transcript(output_txt=output_transcript, segments=segments, header_lines=header_lines)
    write_vtt(output_vtt=output_vtt, segments=segments)

    # Optional: write a compact metadata file for debugging.
    meta = {
        "language": info.language,
        "language_probability": info.language_probability,
        "duration": info.duration,
        "model": args.model,
        "compute_type": args.compute_type,
        "segments": len(segments),
    }
    (repo_root / ".tmp" / "The_TABS_Project.transcript.meta.json").write_text(
        json.dumps(meta, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"Wrote transcript: {output_transcript}")
    print(f"Wrote captions:   {output_vtt}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
