import { useRef, useEffect, useCallback, useState } from 'react';
import { useMusicStore } from '@/store/musicStore';

export function useAudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const bassRef = useRef<BiquadFilterNode | null>(null);
  const midRef = useRef<BiquadFilterNode | null>(null);
  const trebleRef = useRef<BiquadFilterNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>(0);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bassLevel, setBassLevel] = useState(0);

  const { playbackSettings, isPlaying, setIsPlaying } = useMusicStore();

  const initAudio = useCallback((url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    cancelAnimationFrame(rafRef.current);

    const audio = new Audio(url);
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    if (!ctxRef.current) {
      const ctx = new AudioContext();
      ctxRef.current = ctx;

      const source = ctx.createMediaElementSource(audio);
      sourceRef.current = source;

      const bass = ctx.createBiquadFilter();
      bass.type = 'lowshelf';
      bass.frequency.value = 200;
      bassRef.current = bass;

      const mid = ctx.createBiquadFilter();
      mid.type = 'peaking';
      mid.frequency.value = 1000;
      mid.Q.value = 1;
      midRef.current = mid;

      const treble = ctx.createBiquadFilter();
      treble.type = 'highshelf';
      treble.frequency.value = 4000;
      trebleRef.current = treble;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      source.connect(bass).connect(mid).connect(treble).connect(analyser).connect(ctx.destination);
    } else {
      if (sourceRef.current) {
        sourceRef.current.disconnect();
      }
      const source = ctxRef.current.createMediaElementSource(audio);
      sourceRef.current = source;
      source.connect(bassRef.current!).connect(midRef.current!).connect(trebleRef.current!).connect(analyserRef.current!).connect(ctxRef.current.destination);
    }

    audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      cancelAnimationFrame(rafRef.current);
      setBassLevel(0);
    });

    return audio;
  }, [setIsPlaying]);

  // Bass analyser loop
  useEffect(() => {
    if (!isPlaying || !analyserRef.current) {
      cancelAnimationFrame(rafRef.current);
      if (!isPlaying) setBassLevel(0);
      return;
    }

    const analyser = analyserRef.current;
    const data = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(data);
      // Average of first ~6 bins (low frequencies, roughly 0-350Hz at 44.1kHz sample rate with fftSize 256)
      const bassBins = data.slice(0, 6);
      const avg = bassBins.reduce((a, b) => a + b, 0) / bassBins.length;
      // Normalize to 0-1
      setBassLevel(avg / 255);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying]);

  // Apply EQ
  useEffect(() => {
    if (bassRef.current) bassRef.current.gain.value = playbackSettings.eq.bass;
    if (midRef.current) midRef.current.gain.value = playbackSettings.eq.mid;
    if (trebleRef.current) trebleRef.current.gain.value = playbackSettings.eq.treble;
  }, [playbackSettings.eq]);

  // Apply pitch + speed
  useEffect(() => {
    if (audioRef.current) {
      const pitchRate = Math.pow(2, playbackSettings.pitch / 1200);
      const combinedRate = playbackSettings.speed * pitchRate;
      audioRef.current.playbackRate = combinedRate;
      audioRef.current.preservesPitch = false;
    }
  }, [playbackSettings.pitch, playbackSettings.speed]);

  const play = useCallback(async () => {
    if (audioRef.current) {
      if (ctxRef.current?.state === 'suspended') {
        await ctxRef.current.resume();
      }
      await audioRef.current.play();
      setIsPlaying(true);
    }
  }, [setIsPlaying]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, [setIsPlaying]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  return { initAudio, play, pause, seek, currentTime, duration, isPlaying, bassLevel };
}
