# Audio generation has moved to generate-audio.py (Microsoft Edge Neural TTS).
#
# Run from repo root:
#   python walkthrough/.build/generate-audio.py
#
# Requires: pip install edge-tts
# Voice: en-US-AriaNeural  Rate: -5%
#
# The Python script outputs MP3 files to walkthrough/audio/.
# The player (walkthrough/index.html) loads them as .mp3.
#
# --- Legacy SAPI fallback (kept for reference only) ---
# The original script used Microsoft Zira (SAPI, Win32) and produced WAV files.
# It is no longer used because Zira is a legacy voice with noticeably robotic
# prosody. The edge-tts neural voice is a significant quality improvement.
#
# To regenerate all audio:
#   python walkthrough/.build/generate-audio.py
