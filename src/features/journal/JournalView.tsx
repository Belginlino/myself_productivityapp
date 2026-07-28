import React, { useState } from 'react';
import { BookOpen, Smile, Heart, Trophy, AlertTriangle, Lightbulb, Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useJournalStore } from '../../store/useJournalStore';
import { useAppStore } from '../../store/useAppStore';
import { JournalMood } from '../../types';

export const JournalView: React.FC = () => {
  const { journals, addJournal, deleteJournal } = useJournalStore();
  const { addXP, addCoins } = useAppStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mood, setMood] = useState<JournalMood>('amazing');
  const [gratitude, setGratitude] = useState('Productive work, Great health');
  const [wins, setWins] = useState('Finished feature development');
  const [challenges, setChallenges] = useState('Overcoming afternoon fatigue');
  const [lessons, setLessons] = useState('Take 5-min walk every 50 minutes.');
  const [content, setContent] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const moodEmojis: { [key in JournalMood]: { emoji: string; label: string; color: string } } = {
    amazing: { emoji: '🤩', label: 'Amazing', color: 'text-amber-500 bg-amber-500/10 border-amber-500/30' },
    good: { emoji: '😊', label: 'Good', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30' },
    okay: { emoji: '😐', label: 'Okay', color: 'text-blue-500 bg-blue-500/10 border-blue-500/30' },
    down: { emoji: '😔', label: 'Down', color: 'text-purple-500 bg-purple-500/10 border-purple-500/30' },
    stressed: { emoji: '😫', label: 'Stressed', color: 'text-red-500 bg-red-500/10 border-red-500/30' },
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    addJournal({
      date: todayStr,
      mood,
      gratitude: gratitude.split(',').map((g) => g.trim()).filter(Boolean),
      wins: wins.split(',').map((w) => w.trim()).filter(Boolean),
      challenges: challenges.split(',').map((c) => c.trim()).filter(Boolean),
      lessons,
      content,
      photos: [],
    });

    addXP(25);
    addCoins(10);
    setContent('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Daily Reflection & Journal
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track daily moods, gratitude, wins, and life lessons.
          </p>
        </div>

        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
          Write Daily Reflection
        </Button>
      </div>

      {/* Timeline Entries List */}
      <div className="space-y-6">
        {journals.map((entry) => {
          const m = moodEmojis[entry.mood];
          return (
            <Card key={entry.id} className="p-6 relative group">
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`text-2xl p-2 rounded-2xl border ${m.color}`}>
                    {m.emoji}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{entry.date} Reflection</h3>
                    <span className="text-xs font-semibold text-slate-400 capitalize">Mood: {m.label}</span>
                  </div>
                </div>

                <button
                  onClick={() => deleteJournal(entry.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Reflection Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <h4 className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-1.5">
                    <Heart className="w-4 h-4" /> Gratitude
                  </h4>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-700 dark:text-slate-300">
                    {entry.gratitude.map((g, idx) => (
                      <li key={idx}>{g}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <h4 className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 mb-1.5">
                    <Trophy className="w-4 h-4" /> Today's Wins
                  </h4>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-700 dark:text-slate-300">
                    {entry.wins.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <h4 className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 mb-1.5">
                    <Lightbulb className="w-4 h-4" /> Lesson Learned
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300 italic">{entry.lessons}</p>
                </div>
              </div>

              {entry.content && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {entry.content}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Journal Entry">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">How are you feeling today?</label>
            <div className="flex items-center justify-between gap-2">
              {(Object.keys(moodEmojis) as JournalMood[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMood(key)}
                  className={`flex-1 p-2 rounded-xl border text-center transition-all ${
                    mood === key
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-xl block">{moodEmojis[key].emoji}</span>
                  <span className="text-[10px] font-semibold mt-0.5 block">{moodEmojis[key].label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">What are you grateful for today?</label>
            <input
              type="text"
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Today's Key Wins</label>
            <input
              type="text"
              value={wins}
              onChange={(e) => setWins(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Lessons Learned</label>
            <input
              type="text"
              value={lessons}
              onChange={(e) => setLessons(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Journal Entry / Thoughts</label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Reflect on your day..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Entry
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
