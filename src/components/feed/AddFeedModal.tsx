import React, { useState } from 'react';
import { Dialog } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useFeeds } from '../../context/FeedContext';
import { Plus, Rss, Folder, AlertCircle, Sparkles } from 'lucide-react';

export interface AddFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_FEEDS = [
  { url: 'https://overreacted.io/rss.xml', title: 'Overreacted (Dan Abramov)', folder: 'Engineering & AI' },
  { url: 'https://simonwillison.net/atom/entries/', title: 'Simon Willison’s Weblog', folder: 'Engineering & AI' },
  { url: 'https://news.ycombinator.com/rss', title: 'Hacker News Frontpage', folder: 'Tech Journalism' },
  { url: 'https://www.theverge.com/rss/index.xml', title: 'The Verge', folder: 'Tech Journalism' },
  { url: 'https://hacks.mozilla.org/feed/', title: 'Mozilla Hacks', folder: 'Web Development' },
];

export const AddFeedModal: React.FC<AddFeedModalProps> = ({ isOpen, onClose }) => {
  const { addNewFeed, folders } = useFeeds();
  const [url, setUrl] = useState('');
  const [folder, setFolder] = useState('Engineering & AI');
  const [customFolder, setCustomFolder] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    const targetFolder = customFolder.trim() || folder || 'General';

    try {
      await addNewFeed(url.trim(), targetFolder);
      setUrl('');
      setCustomFolder('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to discover or parse feed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (presetUrl: string, presetFolder: string) => {
    setUrl(presetUrl);
    setFolder(presetFolder);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Rss className="h-5 w-5 text-amber-500" />
          <span>Subscribe to New Wire</span>
        </div>
      }
      description="Enter a website URL or direct RSS/Atom XML link. IncogniRead will autodiscover the feed and parse it safely in-browser."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-theme-heading mb-1.5 font-editorial">
            Website or Feed URL
          </label>
          <Input
            type="text"
            placeholder="e.g. overreacted.io or https://example.com/feed"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            icon={<Rss className="h-4 w-4" />}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-theme-heading mb-1.5 font-editorial">
              Select Folder
            </label>
            <select
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              className="w-full h-11 min-h-[44px] rounded-xl border border-theme-border bg-theme-input text-sm text-theme-heading px-3 focus:outline-none focus:border-amber-500 font-serif"
            >
              {folders.map((f) => (
                <option key={f.id} value={f.name}>
                  {f.name}
                </option>
              ))}
              <option value="New Folder">+ Create New Folder...</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-theme-heading mb-1.5 font-editorial">
              Custom Folder Name (Optional)
            </label>
            <Input
              type="text"
              placeholder="e.g. Machine Learning"
              value={customFolder}
              onChange={(e) => setCustomFolder(e.target.value)}
              icon={<Folder className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-2 pt-2 border-t border-theme-subtle">
          <span className="text-[11px] font-bold uppercase tracking-wider text-theme-muted flex items-center gap-1 font-editorial">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Recommended Starter Feeds:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_FEEDS.map((preset) => (
              <button
                type="button"
                key={preset.url}
                onClick={() => handleSelectPreset(preset.url, preset.folder)}
                className="px-2.5 py-1 text-xs rounded-lg bg-theme-elevated border border-theme-border text-theme-muted hover:text-theme-heading hover:border-amber-500/40 transition-colors font-serif"
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-2 font-serif">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="amber" isLoading={isLoading} className="gap-2 font-bold">
            <Plus className="h-4 w-4" />
            <span>Discover & Subscribe</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
