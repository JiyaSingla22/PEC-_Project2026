import React, { useState, useRef } from 'react';
import { useFeeds } from '../../context/FeedContext';
import { downloadOPML, parseOPML, OPMLFeedItem } from '../../lib/opml';
import { Dialog } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Download,
  Upload,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Folder,
  Rss,
  FileUp,
} from 'lucide-react';

export interface OPMLModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OPMLModal: React.FC<OPMLModalProps> = ({ isOpen, onClose }) => {
  const { feeds, addNewFeed } = useFeeds();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [parsedItems, setParsedItems] = useState<OPMLFeedItem[]>([]);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExport = () => {
    downloadOPML(feeds);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setImportStatus(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const items = parseOPML(text);
        if (items.length === 0) {
          setErrorMessage('No valid RSS/Atom feed outlines found in this OPML file.');
          setParsedItems([]);
        } else {
          setParsedItems(items);
        }
      } catch (err: any) {
        setErrorMessage(`Failed to parse OPML: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (parsedItems.length === 0) return;
    setImporting(true);
    setImportStatus('Importing feeds into local IndexedDB...');

    let addedCount = 0;
    for (const item of parsedItems) {
      try {
        await addNewFeed(item.feedUrl, item.folder || 'Imported');
        addedCount++;
      } catch (err) {
        console.warn(`Skipped feed ${item.feedUrl}:`, err);
      }
    }

    setImporting(false);
    setImportStatus(`Successfully imported ${addedCount} subscriptions to your reading list!`);
    setParsedItems([]);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
            <FileCode className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-editorial font-bold text-theme-heading">
              OPML Subscription Exchange
            </div>
            <div className="text-xs font-serif text-theme-muted font-normal">
              Open standard import and export for independent feed readers
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Tab Selection */}
        <div className="flex border-b border-theme-border pb-2 gap-2">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-colors ${
              activeTab === 'export'
                ? 'bg-amber-500 text-black shadow-sm'
                : 'text-theme-muted hover:text-theme-heading hover:bg-theme-elevated'
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export OPML</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-serif font-bold transition-colors ${
              activeTab === 'import'
                ? 'bg-amber-500 text-black shadow-sm'
                : 'text-theme-muted hover:text-theme-heading hover:bg-theme-elevated'
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Import OPML</span>
          </button>
        </div>

        {/* EXPORT TAB */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <p className="text-xs font-serif text-theme-muted leading-relaxed">
              Export all your <strong>{feeds.length}</strong> subscribed feeds organized by folder into a standardized OPML 2.0 XML file. You can migrate your subscriptions to NetNewsWire, Feedly, Feedbin, or back up your offline reader state.
            </p>

            <div className="p-4 rounded-xl border border-theme-border bg-theme-surface/50 flex items-center justify-between">
              <div>
                <span className="font-editorial font-bold text-xs text-theme-heading block">
                  incogniread-subscriptions.opml
                </span>
                <span className="text-[11px] font-mono text-theme-muted">
                  {feeds.length} feeds • Categorized by folder
                </span>
              </div>

              <Button
                variant="amber"
                size="sm"
                onClick={handleExport}
                className="gap-2 font-serif font-bold text-xs"
              >
                <Download className="h-4 w-4" />
                <span>Download OPML</span>
              </Button>
            </div>
          </div>
        )}

        {/* IMPORT TAB */}
        {activeTab === 'import' && (
          <div className="space-y-4">
            <p className="text-xs font-serif text-theme-muted leading-relaxed">
              Import feeds from another RSS reader or a fellow blogger's published blogroll. All feeds are parsed client-side and saved into your private local IndexedDB.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".opml,.xml,text/xml"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-6 rounded-2xl border-2 border-dashed border-theme-border hover:border-amber-500/50 bg-theme-surface/30 hover:bg-theme-elevated text-center cursor-pointer transition-colors space-y-2 group"
            >
              <FileUp className="h-8 w-8 text-amber-500 mx-auto group-hover:scale-110 transition-transform" />
              <div className="text-xs font-serif font-bold text-theme-heading">
                Click to browse or drop your .opml file here
              </div>
              <div className="text-[11px] font-mono text-theme-muted">
                Accepts standard OPML 1.0/2.0 XML
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {importStatus && (
              <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{importStatus}</span>
              </div>
            )}

            {/* Parsed Previews */}
            {parsedItems.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif font-bold text-theme-heading">
                    Found {parsedItems.length} feeds in OPML:
                  </span>
                  <Button
                    variant="amber"
                    size="sm"
                    onClick={handleExecuteImport}
                    isLoading={importing}
                    className="font-serif font-bold text-xs gap-1.5"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Import All ({parsedItems.length})</span>
                  </Button>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {parsedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-theme-border bg-theme-surface flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <Rss className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span className="font-serif font-bold text-theme-heading truncate">
                          {item.title}
                        </span>
                      </div>
                      <Badge variant="glass" className="text-[10px] font-mono shrink-0">
                        {item.folder}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
};
