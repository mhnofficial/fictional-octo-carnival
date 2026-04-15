import { useMusicStore } from '@/store/musicStore';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMemo } from 'react';

interface PlayerControlsProps {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  bassLevel: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onNext: () => void;
  onPrev: () => void;
}

function formatTime(s: number) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function PlayerControls({
  currentTime, duration, isPlaying, bassLevel, onPlay, onPause, onSeek, onNext, onPrev,
}: PlayerControlsProps) {
  const { currentTrackId, tracks } = useMusicStore();
  const currentTrack = tracks.find((t) => t.id === currentTrackId);

  // Calculate shake transform from bass level
  const shakeStyle = useMemo(() => {
    if (!isPlaying || bassLevel < 0.3) return {};
    const intensity = Math.max(0, (bassLevel - 0.3) / 0.7); // normalize 0.3-1 → 0-1
    const px = intensity * 3; // max 3px shake
    const angle = intensity * 2; // max 2deg rotation
    // Pseudo-random direction based on time
    const seed = Date.now() % 4;
    const dx = seed < 2 ? px : -px;
    const dy = seed % 2 === 0 ? px : -px;
    const scale = 1 + intensity * 0.05;
    return {
      transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) rotate(${(seed < 2 ? angle : -angle).toFixed(1)}deg) scale(${scale.toFixed(3)})`,
      transition: 'transform 50ms ease-out',
    };
  }, [isPlaying, bassLevel]);

  if (!currentTrack) return null;

  return (
    <div className="border-t border-border bg-card px-3 md:px-4 py-2.5 md:py-3">
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-9 h-9 rounded-sm overflow-hidden bg-secondary flex-shrink-0"
          style={currentTrack.coverUrl ? shakeStyle : {}}
        >
          {currentTrack.coverUrl ? (
            <img src={currentTrack.coverUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[10px] text-muted-foreground font-heading">♪</span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-foreground truncate">{currentTrack.name}</p>
          <p className="text-[11px] text-muted-foreground">{formatTime(currentTime)} / {formatTime(duration)}</p>
        </div>
        <div className="flex items-center gap-1 md:hidden">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPrev}>
            <SkipBack className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={isPlaying ? onPause : onPlay}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onNext}>
            <SkipForward className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <Slider
        value={[currentTime]}
        min={0}
        max={duration || 1}
        step={0.1}
        onValueChange={([v]) => onSeek(v)}
        className="mb-2 md:mb-3"
      />

      <div className="hidden md:flex items-center justify-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPrev}>
          <SkipBack className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={isPlaying ? onPause : onPlay}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onNext}>
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
