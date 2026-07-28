import React, { useState } from 'react';
import { FileText, Plus, Pin, Lock, Search, Trash2, Eye, Edit3, ArrowLeft, List } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useNoteStore } from '../../store/useNoteStore';
import { useAppStore } from '../../store/useAppStore';
import { NoteItem } from '../../types';

export const NoteView: React.FC = () => {
  const { notes, searchQuery, setSearchQuery, addNote, updateNote, deleteNote, togglePinNote } = useNoteStore();
  const { addXP } = useAppStore();

  const [activeNote, setActiveNote] = useState<NoteItem | null>(notes[0] || null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mobileMode, setMobileMode] = useState<'list' | 'editor'>('list');

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('Docs, Architecture');
  const [folder, setFolder] = useState('General');

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newN = addNote({
      title: title.trim(),
      content: content.trim(),
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      folder: folder.trim(),
      pinned: false,
      locked: false,
    });

    addXP(20);
    setActiveNote(newN);
    setMobileMode('editor');
    setTitle('');
    setContent('');
    setIsModalOpen(false);
  };

  const handleContentChange = (newContent: string) => {
    if (!activeNote) return;
    updateNote(activeNote.id, { content: newContent });
    setActiveNote({ ...activeNote, content: newContent });
  };

  const selectNoteMobile = (note: NoteItem) => {
    setActiveNote(note);
    setMobileMode('editor');
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            Notes & Knowledge Base
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Markdown rich note taker with tagging, folder organization & security locks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile view toggle */}
          <div className="lg:hidden flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setMobileMode('list')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 ${
                mobileMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
            <button
              onClick={() => setMobileMode('editor')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 ${
                mobileMode === 'editor'
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" /> Editor
            </button>
          </div>

          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
            New Note
          </Button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Notes List Column */}
        <Card className={`p-4 space-y-3 ${mobileMode === 'editor' ? 'hidden lg:block' : 'block'}`}>
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredNotes.map((note) => {
              const isSelected = activeNote?.id === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => selectNoteMobile(note)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-500/10 border-purple-500/40 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-purple-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate flex-1">
                      {note.pinned && '📌 '} {note.title}
                    </h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePinNote(note.id);
                      }}
                      className="p-1 text-slate-400 hover:text-amber-500"
                    >
                      <Pin className={`w-3.5 h-3.5 ${note.pinned ? 'text-amber-500 fill-amber-500' : ''}`} />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {note.locked ? '🔒 Locked private note' : note.content}
                  </p>

                  <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400">
                    <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">{note.folder || 'General'}</span>
                    <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right Editor Area */}
        <Card className={`lg:col-span-2 p-6 flex flex-col min-h-[500px] ${mobileMode === 'list' ? 'hidden lg:flex' : 'flex'}`}>
          {activeNote ? (
            <>
              {/* Note Header Toolbar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMobileMode('list')}
                    className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{activeNote.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {activeNote.tags.map((t) => (
                        <span key={t} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPreviewMode(!isPreviewMode)}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  >
                    {isPreviewMode ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {isPreviewMode ? 'Edit' : 'Preview'}
                  </button>

                  <button
                    onClick={() => deleteNote(activeNote.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Editor / Preview Body */}
              <div className="flex-1">
                {isPreviewMode ? (
                  <div className="prose dark:prose-invert text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {activeNote.content}
                  </div>
                ) : (
                  <textarea
                    rows={16}
                    value={activeNote.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Write your markdown note here..."
                    className="w-full h-full p-3 bg-transparent text-xs text-slate-900 dark:text-white font-mono focus:outline-none resize-none"
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
              Select or create a note to begin writing.
            </div>
          )}
        </Card>
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Note">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Title</label>
            <input
              type="text"
              required
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Content (Markdown supported)</label>
            <textarea
              rows={5}
              placeholder="# Heading\n- Bullet point..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Folder</label>
              <input
                type="text"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Note
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
