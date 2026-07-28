import React, { useState } from 'react';
import { Target, Layers, Plus, CheckSquare, Trophy, Trash2, Sparkles, Calendar as CalendarIcon } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Modal } from '../../components/common/Modal';
import { useGoalStore } from '../../store/useGoalStore';
import { useAppStore } from '../../store/useAppStore';
import { GoalCategory } from '../../types';

export const GoalProjectView: React.FC = () => {
  const { goals, projects, addGoal, deleteGoal, toggleMilestone, addProject, deleteProject } = useGoalStore();
  const { addXP, addCoins } = useAppStore();

  const [activeTab, setActiveTab] = useState<'goals' | 'projects'>('goals');
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Goal Form
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCategory, setGoalCategory] = useState<GoalCategory>('learning');
  const [targetDate, setTargetDate] = useState(new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0]);
  const [milestonesInput, setMilestonesInput] = useState('Step 1, Step 2, Step 3');

  // Project Form
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projColor, setProjColor] = useState('#4F46E5');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    const milestonesList = milestonesInput
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean)
      .map((m, idx) => ({ id: 'm-' + idx + '-' + Date.now(), title: m, completed: false }));

    addGoal({
      title: goalTitle.trim(),
      category: goalCategory,
      targetDate,
      milestones: milestonesList,
    });

    addXP(30);
    addCoins(15);
    setGoalTitle('');
    setIsGoalModalOpen(false);
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim()) return;

    addProject({
      title: projTitle.trim(),
      description: projDesc.trim(),
      color: projColor,
      icon: 'Layers',
      deadline: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
    });

    addXP(25);
    setProjTitle('');
    setProjDesc('');
    setIsProjectModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Goals & Project Manager
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track multi-step life goals with milestones & software project milestones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('goals')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'goals'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Target className="w-3.5 h-3.5" /> Goals ({goals.length})
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'projects'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Projects ({projects.length})
            </button>
          </div>

          {activeTab === 'goals' ? (
            <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsGoalModalOpen(true)}>
              New Goal
            </Button>
          ) : (
            <Button variant="secondary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsProjectModalOpen(true)}>
              New Project
            </Button>
          )}
        </div>
      </div>

      {/* Goals View */}
      {activeTab === 'goals' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => (
            <Card key={goal.id} className="relative group">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    {goal.category}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white mt-1.5">{goal.title}</h3>
                </div>

                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Progress */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500 dark:text-slate-400">Progress</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{goal.progress}%</span>
                </div>
                <ProgressBar progress={goal.progress} height="h-2.5" color="bg-indigo-600" />
              </div>

              {/* Milestones list */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Milestones Checklist</h4>
                {goal.milestones.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => toggleMilestone(goal.id, m.id)}
                    className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <span className={m.completed ? 'text-emerald-500 font-bold' : 'text-slate-400'}>
                      {m.completed ? '☑' : '☐'}
                    </span>
                    <span className={m.completed ? 'line-through text-slate-400' : ''}>{m.title}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                <CalendarIcon className="w-3.5 h-3.5" /> Target Date: {goal.targetDate}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Projects View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <Card key={proj.id} className="relative group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shadow-md"
                    style={{ backgroundColor: proj.color || '#4F46E5' }}
                  >
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{proj.title}</h3>
                    <p className="text-xs text-slate-400">{proj.description}</p>
                  </div>
                </div>

                <button
                  onClick={() => deleteProject(proj.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between font-mono">
                <span>Tasks Linked: {proj.taskIds.length}</span>
                <span>Deadline: {proj.deadline}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Goal Modal */}
      <Modal isOpen={isGoalModalOpen} onClose={() => setIsGoalModalOpen(false)} title="Create New Goal">
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Goal Title</label>
            <input
              type="text"
              required
              placeholder="e.g., Master FullStack Architecture"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={goalCategory}
                onChange={(e) => setGoalCategory(e.target.value as GoalCategory)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="learning">Learning</option>
                <option value="career">Career</option>
                <option value="personal">Personal</option>
                <option value="health">Health</option>
                <option value="finance">Finance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Milestones (comma separated)</label>
            <textarea
              rows={2}
              value={milestonesInput}
              onChange={(e) => setMilestonesInput(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsGoalModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Goal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Project Modal */}
      <Modal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Name</label>
            <input
              type="text"
              required
              placeholder="e.g., Myself Mobile Android Port"
              value={projTitle}
              onChange={(e) => setProjTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <input
              type="text"
              value={projDesc}
              onChange={(e) => setProjDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsProjectModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary">
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
