import { useCallback, useRef, useState } from 'react';
import { useMusicStore, Track } from '@/store/musicStore';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { Sidebar } from '@/components/Sidebar';
import { TrackList } from '@/components/TrackList';
import { PlayerControls } from '@/components/PlayerControls';
import { AudioSettings } from '@/components/AudioSettings';
import { Button } from '@/components/ui/button';
import { Upload, SlidersHorizontal, Image, Menu, X } from 'lucide-react';

export default function Index() {
  const {
    tracks, albums, folders, currentView, currentViewId,
    addTrack, updateAlbum, setCurrentTrack, currentTrackId,
  } = useMusicStore();

  const { initAudio, play, pause, seek, currentTime, duration, isPlaying, bassLevel } = useAudioEngine();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const blobMapRef = useRef<Map<string, string>>(new Map());

  const filteredTracks = currentView === 'library'
    ? tracks
    : currentView === 'album'
      ? tracks.filter((t) => t.albumId === currentViewId)
      : tracks.filter((t) => t.folderId === currentViewId);

  const currentAlbum = currentView === 'album' ? albums.find((a) => a.id === currentViewId) : null;
  const currentFolder = currentView === 'folder' ? folders.find((f) => f.id === currentViewId) : null;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) return;
      const id = crypto.randomUUID();
      const blobUrl = URL.createObjectURL(file);
      blobMapRef.current.set(id, blobUrl);
      const track: Track = {
        id,
        name: file.name.replace(/\.[^.]+$/, ''),
        fileName: file.name,
        blobUrl,
        albumId: currentView === 'album' ? currentViewId ?? undefined : undefined,
        folderId: currentView === 'folder' ? currentViewId ?? undefined : undefined,
        addedAt: Date.now(),
      };
      addTrack(track);
    });
    e.target.value = '';
  };

  const handlePlay = useCallback((track: Track) => {
    let url = track.blobUrl;
    if (!url && blobMapRef.current.has(track.id)) {
      url = blobMapRef.current.get(track.id)!;
    }
    if (!url) return;
    if (track.id === currentTrackId) {
      if (isPlaying) pause();
      else play();
      return;
    }
    setCurrentTrack(track.id);
    const audio = initAudio(url);
    audio.play().catch(() => {});
    useMusicStore.getState().setIsPlaying(true);
  }, [currentTrackId, isPlaying, play, pause, setCurrentTrack, initAudio]);

  const handleNext = useCallback(() => {
    const idx = filteredTracks.findIndex((t) => t.id === currentTrackId);
    if (idx < filteredTracks.length - 1) handlePlay(filteredTracks[idx + 1]);
  }, [filteredTracks, currentTrackId, handlePlay]);

  const handlePrev = useCallback(() => {
    const idx = filteredTracks.findIndex((t) => t.id === currentTrackId);
    if (idx > 0) handlePlay(filteredTracks[idx - 1]);
  }, [filteredTracks, currentTrackId, handlePlay]);

  const handleAlbumCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentAlbum) {
      updateAlbum(currentAlbum.id, { coverUrl: URL.createObjectURL(file) });
    }
    e.target.value = '';
  };

  const viewTitle = currentView === 'library'
    ? 'All Tracks'
    : currentAlbum?.name ?? currentFolder?.name ?? '';

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar - hidden on mobile, shown via overlay */}
      <div className="hidden md:flex">
        <Sidebar open={true} onClose={() => {}} />
      </div>
      <div className="md:hidden">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-3 md:px-5 py-3 md:py-4 border-b border-border gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 md:hidden flex-shrink-0"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-4 h-4" />
            </Button>
            {currentAlbum?.coverUrl && (
              <img src={currentAlbum.coverUrl} alt="" className="w-8 h-8 md:w-10 md:h-10 rounded-sm object-cover flex-shrink-0" />
            )}
            <div className="min-w-0">
              <h2 className="font-heading text-base md:text-lg tracking-tight truncate">{viewTitle}</h2>
              <span className="text-[11px] text-muted-foreground">{filteredTracks.length} tracks</span>
            </div>
          </div>
          <div className="flex gap-1.5 flex-shrink-0">
            {currentAlbum && (
              <>
                <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleAlbumCover} />
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => coverInputRef.current?.click()}>
                  <Image className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button
              variant={showSettings ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowSettings(!showSettings)}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
            <input ref={fileInputRef} type="file" accept="audio/*,video/*,.mov,.mp4,.m4a,.aac,.wav,.mp3,.flac,.ogg,.aiff" multiple className="hidden" onChange={handleUpload} />
            <Button variant="outline" size="icon" className="h-8 w-8 md:hidden" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-3.5 h-3.5" />
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs hidden md:flex" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-3 h-3 mr-1.5" />
              Upload
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden relative">
          <div className="flex-1 overflow-y-auto">
            <TrackList tracks={filteredTracks} onPlay={handlePlay} />
          </div>

          {/* Settings panel - side on desktop, bottom sheet on mobile */}
          {showSettings && (
            <>
              {/* Desktop side panel */}
              <div className="hidden md:block w-64 border-l border-border overflow-y-auto">
                <AudioSettings />
              </div>
              {/* Mobile bottom sheet */}
              <div className="md:hidden fixed inset-0 z-50">
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
                <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-xl max-h-[70vh] overflow-y-auto">
                  <div className="flex items-center justify-between px-4 pt-3">
                    <h3 className="font-heading text-xs uppercase tracking-widest text-muted-foreground">Audio Settings</h3>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowSettings(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <AudioSettings />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Player */}
        <PlayerControls
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          bassLevel={bassLevel}
          onPlay={play}
          onPause={pause}
          onSeek={seek}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      </div>
    </div>
  );
}
