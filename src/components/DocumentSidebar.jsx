import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, FileText, Layers, Loader2, Plus, Ship, Upload, ChevronLeft, ChevronRight, MessageCircle, Clock3 } from 'lucide-react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

const DocumentSidebar = ({
  userId,
  activeChapter,
  setActiveChapter,
  sidebarCollapsed,
  onCollapse,
  chatHistory,
  activeChatId,
  onNewChat,
  onSelectChat,
  onUploadSuccess,
}) => {
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [chapterInput, setChapterInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fetchUserPdfs = async () => {
    if (!userId) return;
    setIsLoadingList(true);

    try {
      const response = await axios.get('http://localhost:3003/api/rag/user-pdfs', {
        params: { user_id: Number(userId) },
      });

      if (response.data.status) {
        setUploadedDocuments(response.data.data || []);
        if (response.data.data.length > 0 && !activeChapter) {
          setActiveChapter(response.data.data[0].chapterNumber);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user PDF list:', error);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchUserPdfs();
  }, [userId]);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!chapterInput.trim()) {
      alert('Please enter a chapter number before uploading.');
      event.target.value = null;
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', Number(userId));
    formData.append('chapter_number', Number(chapterInput));

    setIsUploading(true);

    try {
      const response = await axios.post('http://localhost:3003/api/rag/upload-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.status) {
        const newDoc = {
          recordId: response.data.recordId || `${Date.now()}-${file.name}`,
          fileName: file.name,
          chapterNumber: Number(chapterInput),
          status: 'Indexed',
        };
        setUploadedDocuments((prev) => [newDoc, ...prev]);
        setActiveChapter(Number(chapterInput));
        setChapterInput('');
        if (onUploadSuccess) onUploadSuccess(newDoc);
      }
    } catch (error) {
      console.error('Upload failure:', error);
      alert(error.response?.data?.error || 'Failed to upload document.');
    } finally {
      setIsUploading(false);
      event.target.value = null;
    }
  };

  const documentRows = uploadedDocuments.map((doc) => {
    const isActive = activeChapter === doc.chapterNumber;

    return (
      <button
        key={doc.recordId}
        type="button"
        onClick={() => setActiveChapter(doc.chapterNumber)}
        className={`group flex w-full items-start gap-3 rounded-3xl border px-4 py-4 text-left transition-all duration-200 ${
          isActive
            ? 'border-cyan-400 bg-slate-900/95 shadow-soft'
            : 'border-slate-700/80 bg-slate-950/80 hover:border-cyan-400 hover:bg-slate-900/80'
        }`}
        title={doc.fileName}
      >
        <FileText className={`mt-1 h-5 w-5 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-100">{doc.fileName}</p>
          <p className="mt-1 text-xs text-slate-400">Chapter {doc.chapterNumber} • {doc.status}</p>
        </div>
      </button>
    );
  });

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-3 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-400/15 text-cyan-300 shadow-lg shadow-cyan-500/10">
            <Ship className="h-5 w-5" />
          </div>
          {!sidebarCollapsed && (
            <div>
              <p className="text-sm font-semibold text-slate-50">Solmarine AI</p>
              <p className="text-xs text-slate-300">Maritime intelligence workspace</p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onCollapse}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-600/80 bg-slate-950/90 text-slate-100 transition hover:border-cyan-400 hover:text-cyan-300"
        >
          {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      <div className={sidebarCollapsed ? 'hidden' : 'block'}>
        <Card className="mx-3 mb-4 rounded-[28px] border border-slate-700/70 bg-slate-950/90 p-4 shadow-soft">
          <div className="space-y-4">
            <Button variant="primary" size="default" onClick={onNewChat} className="w-full justify-center gap-2">
              <Plus className="h-4 w-4" />
              New chat
            </Button>

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-3xl border border-slate-700/80 bg-slate-950/90 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-400 hover:bg-slate-900/80">
              <Upload className="h-4 w-4 text-cyan-300" />
              Upload PDF
              <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
            </label>

            <div className="rounded-3xl border border-slate-700/80 bg-slate-900/90 p-3">
              <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-slate-500">Document chapter</label>
              <input
                type="number"
                min="1"
                value={chapterInput}
                onChange={(event) => setChapterInput(event.target.value)}
                placeholder="e.g. 1"
                className="w-full rounded-2xl border border-slate-800/80 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>
          </div>
        </Card>

        <div className="mx-3 mb-4">
          <button
            type="button"
            onClick={() => setActiveChapter(null)}
            className={`flex w-full items-center gap-3 rounded-3xl border px-4 py-4 text-left transition-all duration-200 ${
              activeChapter === null
                ? 'border-cyan-400 bg-slate-900/95 shadow-soft'
                : 'border-slate-700/80 bg-slate-950/90 hover:border-cyan-400 hover:bg-slate-900/80'
            }`}
          >
            <Layers className="h-5 w-5 text-cyan-300" />
            <div>
              <p className="text-sm font-semibold text-slate-100">All Documents</p>
              <p className="text-xs text-slate-400">Search across every uploaded file</p>
            </div>
          </button>
        </div>

        <div className="mx-3 mb-3 flex items-center justify-between px-2 text-xs uppercase tracking-[0.24em] text-slate-500">
          <span>PDF Library</span>
          <span>{uploadedDocuments.length} files</span>
        </div>

        <div className="mx-3 mb-4 flex max-h-[24rem] flex-col gap-3 overflow-y-auto pr-1 pb-2">
          {isLoadingList ? (
            <div className="flex min-h-[120px] items-center justify-center rounded-3xl border border-dashed border-slate-700/80 bg-slate-950/90 p-5 text-slate-400">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Fetching uploaded PDFs…
            </div>
          ) : uploadedDocuments.length === 0 ? (
            <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-700/80 bg-slate-950/90 p-5 text-slate-400">
              <BookOpen className="h-7 w-7 text-slate-500" />
              <p className="text-sm text-slate-400">No uploaded PDFs yet. Add a document to start your maritime Q&A.</p>
            </div>
          ) : (
            documentRows
          )}
        </div>

        <div className="mx-3 mb-3 border-t border-slate-700/80 pt-4">
          <div className="mb-3 flex items-center gap-2 px-1 text-xs uppercase tracking-[0.24em] text-slate-500">
            <MessageCircle className="h-4 w-4 text-cyan-300" />
            <span>AI Chat History</span>
          </div>

          <div className="space-y-2 overflow-y-auto pr-1">
            {chatHistory.map((chat) => {
              const isActive = activeChatId === chat.id;
              return (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => onSelectChat(chat.id)}
                  className={`flex w-full flex-col gap-1 rounded-3xl border px-4 py-3 text-left transition-all duration-200 ${
                    isActive
                      ? 'border-cyan-400 bg-slate-900/95 shadow-soft'
                      : 'border-slate-700/80 bg-slate-950/90 hover:border-cyan-400 hover:bg-slate-900/80'
                  }`}
                >
                  <p className="truncate text-sm font-semibold text-slate-100">{chat.title}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate">{chat.snippet}</span>
                    <Clock3 className="ml-2 h-3.5 w-3.5 text-slate-500" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSidebar;
