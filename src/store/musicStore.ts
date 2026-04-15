import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Track {
  id: string;
  name: string;
  fileName: string;
  blobUrl: string;
  coverUrl?: string;
  albumId?: string;
  folderId?: string;
  duration?: number;
  addedAt: number;
}

export interface Album {
  id: string;
  name: string;
  coverUrl?: string;
  createdAt: number;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: number;
}

export interface EQSettings {
  bass: number;      // -12 to 12 dB
  mid: number;
  treble: number;
}

export interface PlaybackSettings {
  pitch: number;     // cents, -1200 to 1200
  speed: number;     // 0.25 to 4
  eq: EQSettings;
}

interface MusicState {
  tracks: Track[];
  albums: Album[];
  folders: Folder[];
  currentTrackId: string | null;
  isPlaying: boolean;
  playbackSettings: PlaybackSettings;
  currentView: 'library' | 'album' | 'folder';
  currentViewId: string | null;

  addTrack: (track: Track) => void;
  removeTrack: (id: string) => void;
  updateTrack: (id: string, updates: Partial<Track>) => void;
  addAlbum: (album: Album) => void;
  removeAlbum: (id: string) => void;
  updateAlbum: (id: string, updates: Partial<Album>) => void;
  addFolder: (folder: Folder) => void;
  removeFolder: (id: string) => void;
  setCurrentTrack: (id: string | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackSettings: (settings: Partial<PlaybackSettings>) => void;
  setEQ: (eq: Partial<EQSettings>) => void;
  setView: (view: 'library' | 'album' | 'folder', id?: string) => void;
}

const uid = () => crypto.randomUUID();

export const useMusicStore = create<MusicState>()(
  persist(
    (set) => ({
      tracks: [],
      albums: [],
      folders: [],
      currentTrackId: null,
      isPlaying: false,
      playbackSettings: {
        pitch: 0,
        speed: 1,
        eq: { bass: 0, mid: 0, treble: 0 },
      },
      currentView: 'library',
      currentViewId: null,

      addTrack: (track) => set((s) => ({ tracks: [...s.tracks, track] })),
      removeTrack: (id) => set((s) => ({
        tracks: s.tracks.filter((t) => t.id !== id),
        currentTrackId: s.currentTrackId === id ? null : s.currentTrackId,
      })),
      updateTrack: (id, updates) => set((s) => ({
        tracks: s.tracks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      })),
      addAlbum: (album) => set((s) => ({ albums: [...s.albums, album] })),
      removeAlbum: (id) => set((s) => ({
        albums: s.albums.filter((a) => a.id !== id),
        tracks: s.tracks.map((t) => (t.albumId === id ? { ...t, albumId: undefined } : t)),
      })),
      updateAlbum: (id, updates) => set((s) => ({
        albums: s.albums.map((a) => (a.id === id ? { ...a, ...updates } : a)),
      })),
      addFolder: (folder) => set((s) => ({ folders: [...s.folders, folder] })),
      removeFolder: (id) => set((s) => ({
        folders: s.folders.filter((f) => f.id !== id),
        tracks: s.tracks.map((t) => (t.folderId === id ? { ...t, folderId: undefined } : t)),
      })),
      setCurrentTrack: (id) => set({ currentTrackId: id }),
      setIsPlaying: (playing) => set({ isPlaying: playing }),
      setPlaybackSettings: (settings) => set((s) => ({
        playbackSettings: { ...s.playbackSettings, ...settings },
      })),
      setEQ: (eq) => set((s) => ({
        playbackSettings: {
          ...s.playbackSettings,
          eq: { ...s.playbackSettings.eq, ...eq },
        },
      })),
      setView: (view, id) => set({ currentView: view, currentViewId: id ?? null }),
    }),
    {
      name: 'music-store',
      partialize: (state) => ({
        tracks: state.tracks.map(t => ({ ...t, blobUrl: '' })),
        albums: state.albums,
        folders: state.folders,
        playbackSettings: state.playbackSettings,
      }),
    }
  )
);
