import { useMusicStore } from '@/store/musicStore';
import { Library, Disc, FolderOpen, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { albums, folders, currentView, currentViewId, setView, addAlbum, addFolder, removeAlbum, removeFolder } = useMusicStore();
  const [newAlbum, setNewAlbum] = useState(false);
  const [newFolder, setNewFolder] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleCreate = (type: 'album' | 'folder') => {
    if (!inputValue.trim()) return;
    if (type === 'album') {
      addAlbum({ id: crypto.randomUUID(), name: inputValue.trim(), createdAt: Date.now() });
      setNewAlbum(false);
    } else {
      addFolder({ id: crypto.randomUUID(), name: inputValue.trim(), createdAt: Date.now() });
      setNewFolder(false);
    }
    setInputValue('');
  };

  const handleNavClick = (view: 'library' | 'album' | 'folder', id?: string) => {
    setView(view, id);
    onClose();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-60 border-r border-border flex flex-col bg-card
          transition-transform duration-200 ease-in-out
          md:relative md:translate-x-0 md:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h1 className="font-heading text-sm tracking-widest uppercase">Mono</h1>
          <Button variant="ghost" size="icon" className="h-7 w-7 md:hidden" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          <button
            onClick={() => handleNavClick('library')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-sm text-sm transition-colors ${
              currentView === 'library' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            }`}
          >
            <Library className="w-3.5 h-3.5" />
            All Tracks
          </button>

          {/* Albums */}
          <div className="pt-3">
            <div className="flex items-center justify-between px-3 mb-1">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-heading">Albums</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => { setNewAlbum(true); setNewFolder(false); setInputValue(''); }}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            {newAlbum && (
              <div className="px-3 mb-1">
                <input
                  autoFocus
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate('album');
                    if (e.key === 'Escape') setNewAlbum(false);
                  }}
                  onBlur={() => setNewAlbum(false)}
                  placeholder="Album name..."
                  className="w-full bg-secondary text-sm px-2 py-1 rounded-sm outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
            )}
            {albums.map((album) => (
              <button
                key={album.id}
                onClick={() => handleNavClick('album', album.id)}
                className={`group w-full flex items-center gap-2 px-3 py-1.5 rounded-sm text-sm transition-colors ${
                  currentView === 'album' && currentViewId === album.id
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <Disc className="w-3.5 h-3.5" />
                <span className="truncate flex-1 text-left">{album.name}</span>
                <Trash2
                  className="w-3 h-3 opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); removeAlbum(album.id); }}
                />
              </button>
            ))}
          </div>

          {/* Folders */}
          <div className="pt-3">
            <div className="flex items-center justify-between px-3 mb-1">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-heading">Folders</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => { setNewFolder(true); setNewAlbum(false); setInputValue(''); }}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            {newFolder && (
              <div className="px-3 mb-1">
                <input
                  autoFocus
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate('folder');
                    if (e.key === 'Escape') setNewFolder(false);
                  }}
                  onBlur={() => setNewFolder(false)}
                  placeholder="Folder name..."
                  className="w-full bg-secondary text-sm px-2 py-1 rounded-sm outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
            )}
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => handleNavClick('folder', folder.id)}
                className={`group w-full flex items-center gap-2 px-3 py-1.5 rounded-sm text-sm transition-colors ${
                  currentView === 'folder' && currentViewId === folder.id
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span className="truncate flex-1 text-left">{folder.name}</span>
                <Trash2
                  className="w-3 h-3 opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity"
                  onClick={(e) => { e.stopPropagation(); removeFolder(folder.id); }}
                />
              </button>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}
