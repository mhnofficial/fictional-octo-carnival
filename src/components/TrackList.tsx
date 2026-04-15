import { useMusicStore, Track } from '@/store/musicStore';
import { Play, Pause, Trash2, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';

interface TrackListProps {
  tracks: Track[];
  onPlay: (track: Track) => void;
}

export function TrackList({ tracks, onPlay }: TrackListProps) {
  const { currentTrackId, isPlaying, removeTrack, updateTrack } = useMusicStore();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const coverTrackId = useRef<string>('');

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && coverTrackId.current) {
      const url = URL.createObjectURL(file);
      updateTrack(coverTrackId.current, { coverUrl: url });
    }
    e.target.value = '';
  };

  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="font-heading text-sm">No tracks yet</p>
        <p className="text-xs mt-1">Upload some music to get started</p>
      </div>
    );
  }

  return (
    <>
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleCoverUpload}
      />
      <div className="space-y-px">
        {tracks.map((track, i) => {
          const active = track.id === currentTrackId;
          return (
            <div
              key={track.id}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-sm transition-colors cursor-pointer ${
                active ? 'bg-accent' : 'hover:bg-accent/50'
              }`}
              onClick={() => onPlay(track)}
            >
              {/* Cover / Index */}
              <div className="relative w-9 h-9 rounded-sm overflow-hidden bg-secondary flex-shrink-0 flex items-center justify-center">
                {track.coverUrl ? (
                  <img src={track.coverUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-muted-foreground font-heading">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                )}
                {active && (
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                    {isPlaying ? (
                      <Pause className="w-3.5 h-3.5 text-foreground" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-foreground" />
                    )}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${active ? 'text-foreground' : 'text-secondary-foreground'}`}>
                  {track.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">{track.fileName}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    coverTrackId.current = track.id;
                    coverInputRef.current?.click();
                  }}
                >
                  <Image className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTrack(track.id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
