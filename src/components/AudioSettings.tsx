import { useMusicStore } from '@/store/musicStore';
import { Slider } from '@/components/ui/slider';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AudioSettings() {
  const { playbackSettings, setPlaybackSettings, setEQ } = useMusicStore();
  const { eq, pitch, speed } = playbackSettings;

  return (
    <div className="p-4 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-xs uppercase tracking-widest text-muted-foreground">Audio Settings</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => {
            setPlaybackSettings({ pitch: 0, speed: 1 });
            setEQ({ bass: 0, mid: 0, treble: 0 });
          }}
        >
          <RotateCcw className="w-3 h-3" />
        </Button>
      </div>

      {/* Speed */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Speed</span>
          <span className="text-foreground font-heading">{speed.toFixed(2)}x</span>
        </div>
        <Slider
          value={[speed]}
          min={0.25}
          max={4}
          step={0.05}
          onValueChange={([v]) => setPlaybackSettings({ speed: v })}
        />
      </div>

      {/* Pitch */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Pitch</span>
          <span className="text-foreground font-heading">{pitch > 0 ? '+' : ''}{pitch}¢</span>
        </div>
        <Slider
          value={[pitch]}
          min={-1200}
          max={1200}
          step={1}
          onValueChange={([v]) => setPlaybackSettings({ pitch: v })}
        />
      </div>

      {/* EQ */}
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">EQ</p>
        {([
          ['Bass', 'bass', eq.bass],
          ['Mid', 'mid', eq.mid],
          ['Treble', 'treble', eq.treble],
        ] as const).map(([label, key, value]) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{label}</span>
              <span className="text-foreground font-heading">{value > 0 ? '+' : ''}{value}dB</span>
            </div>
            <Slider
              value={[value]}
              min={-12}
              max={12}
              step={0.5}
              onValueChange={([v]) => setEQ({ [key]: v })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
