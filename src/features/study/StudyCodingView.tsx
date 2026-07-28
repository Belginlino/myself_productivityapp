import React, { useState } from 'react';
import { Code2, BookOpen, Plus, ExternalLink, Trash2, Clock, Terminal, Award } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useStudyCodingStore } from '../../store/useStudyCodingStore';
import { useAppStore } from '../../store/useAppStore';

export const StudyCodingView: React.FC = () => {
  const { studySessions, codingSessions, addStudySession, deleteStudySession, addCodingSession, deleteCodingSession } = useStudyCodingStore();
  const { addXP, addCoins } = useAppStore();

  const [activeTab, setActiveTab] = useState<'coding' | 'study'>('coding');
  const [isStudyModalOpen, setIsStudyModalOpen] = useState(false);
  const [isCodingModalOpen, setIsCodingModalOpen] = useState(false);

  // Coding Form
  const [lang, setLang] = useState('TypeScript');
  const [project, setProject] = useState('Myself OS');
  const [duration, setDuration] = useState(60);
  const [repo, setRepo] = useState('https://github.com');
  const [techs, setTechs] = useState('React, Zustand, Tailwind');
  const [codeNotes, setCodeNotes] = useState('');

  // Study Form
  const [subject, setSubject] = useState('Computer Science');
  const [topic, setTopic] = useState('System Architecture');
  const [studyDuration, setStudyDuration] = useState(45);
  const [studyNotes, setStudyNotes] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const handleCreateCoding = (e: React.FormEvent) => {
    e.preventDefault();
    addCodingSession({
      language: lang,
      project,
      durationMinutes: Number(duration),
      repository: repo,
      technologies: techs.split(',').map((t) => t.trim()).filter(Boolean),
      date: todayStr,
      notes: codeNotes,
    });
    addXP(30);
    addCoins(15);
    setIsCodingModalOpen(false);
  };

  const handleCreateStudy = (e: React.FormEvent) => {
    e.preventDefault();
    addStudySession({
      subject,
      topic,
      durationMinutes: Number(studyDuration),
      date: todayStr,
      completed: true,
      notes: studyNotes,
    });
    addXP(25);
    addCoins(10);
    setIsStudyModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Code2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Study & Coding Tracker
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Log technical coding sessions, repository links, study subjects & exam revisions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('coding')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'coding'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" /> Coding ({codingSessions.length})
            </button>
            <button
              onClick={() => setActiveTab('study')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'study'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Study Sessions ({studySessions.length})
            </button>
          </div>

          {activeTab === 'coding' ? (
            <Button variant="secondary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsCodingModalOpen(true)}>
              Log Coding Session
            </Button>
          ) : (
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsStudyModalOpen(true)}>
              Log Study Session
            </Button>
          )}
        </div>
      </div>

      {/* Coding View */}
      {activeTab === 'coding' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {codingSessions.map((session) => (
            <Card key={session.id} className="p-5 relative group">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {session.language}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1.5">{session.project}</h3>
                </div>

                <button
                  onClick={() => deleteCodingSession(session.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                {session.technologies.map((tech) => (
                  <span key={tech} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {tech}
                  </span>
                ))}
              </div>

              {session.notes && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                  {session.notes}
                </p>
              )}

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {session.durationMinutes} mins
                </span>
                {session.repository && (
                  <a
                    href={session.repository}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-sans font-semibold"
                  >
                    Repo <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Study View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {studySessions.map((session) => (
            <Card key={session.id} className="p-5 relative group">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    {session.subject}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1.5">{session.topic}</h3>
                </div>

                <button
                  onClick={() => deleteStudySession(session.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {session.notes && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                  {session.notes}
                </p>
              )}

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {session.durationMinutes} mins
                </span>
                <span>Date: {session.date}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Coding Modal */}
      <Modal isOpen={isCodingModalOpen} onClose={() => setIsCodingModalOpen(false)} title="Log Coding Session">
        <form onSubmit={handleCreateCoding} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Language</label>
              <input
                type="text"
                required
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Project</label>
              <input
                type="text"
                required
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Duration (minutes)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Repository URL</label>
              <input
                type="url"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Technologies Used (comma separated)</label>
            <input
              type="text"
              value={techs}
              onChange={(e) => setTechs(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes / Highlights</label>
            <textarea
              rows={3}
              value={codeNotes}
              onChange={(e) => setCodeNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsCodingModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary">
              Save Coding Session
            </Button>
          </div>
        </form>
      </Modal>

      {/* Study Modal */}
      <Modal isOpen={isStudyModalOpen} onClose={() => setIsStudyModalOpen(false)} title="Log Study Session">
        <form onSubmit={handleCreateStudy} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Topic / Chapter</label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Duration (minutes)</label>
            <input
              type="number"
              value={studyDuration}
              onChange={(e) => setStudyDuration(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Key Summary Notes</label>
            <textarea
              rows={3}
              value={studyNotes}
              onChange={(e) => setStudyNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsStudyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Study Session
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
