import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Kanban,
  List,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useTaskStore } from '../../store/useTaskStore';
import { useAppStore } from '../../store/useAppStore';
import { TaskItem, TaskStatus, PriorityLevel } from '../../types';

export const TaskView: React.FC = () => {
  const {
    tasks,
    searchQuery,
    selectedPriority,
    selectedStatus,
    setSearchQuery,
    setSelectedPriority,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    toggleSubtask,
    addSubtask,
    moveTaskStatus,
  } = useTaskStore();

  const { addXP } = useAppStore();

  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [mobileKanbanTab, setMobileKanbanTab] = useState<TaskStatus>('pending');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [newSubtaskInput, setNewSubtaskInput] = useState<{ [taskId: string]: string }>({});

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [labels, setLabels] = useState('Work, Dev');
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask) {
      updateTask(editingTask.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate,
        labels: labels.split(',').map((l) => l.trim()).filter(Boolean),
        estimatedMinutes: Number(estimatedMinutes),
      });
      setEditingTask(null);
    } else {
      addTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        status: 'pending',
        dueDate,
        labels: labels.split(',').map((l) => l.trim()).filter(Boolean),
        subtasks: [],
        estimatedMinutes: Number(estimatedMinutes),
      });
      addXP(20);
    }

    setTitle('');
    setDescription('');
    setIsCreateModalOpen(false);
  };

  const handleAddSubtaskSubmit = (taskId: string) => {
    const text = newSubtaskInput[taskId]?.trim();
    if (!text) return;
    addSubtask(taskId, text);
    setNewSubtaskInput({ ...newSubtaskInput, [taskId]: '' });
  };

  const handleCompleteToggle = (id: string) => {
    toggleTaskComplete(id);
    addXP(25);
  };

  const kanbanColumns: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'pending', label: 'To Do', color: 'border-slate-300 dark:border-slate-700' },
    { id: 'in-progress', label: 'In Progress', color: 'border-indigo-500' },
    { id: 'completed', label: 'Completed', color: 'border-emerald-500' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Task Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organize tasks with subtasks, labels, drag-stage views & priorities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" /> Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
          </div>

          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateModalOpen(true)}>
            Add Task
          </Button>
        </div>
      </div>

      {/* Filter Strip */}
      <Card className="py-3 px-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full md:w-auto flex-1">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Priority:
          </span>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as PriorityLevel | 'all')}
            className="bg-slate-100 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </Card>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="space-y-4">
          {/* Mobile Kanban Stage Tabs */}
          <div className="md:hidden flex items-center justify-between p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            {kanbanColumns.map((col) => (
              <button
                key={col.id}
                onClick={() => setMobileKanbanTab(col.id)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg text-center transition-all ${
                  mobileKanbanTab === col.id
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                {col.label} ({filteredTasks.filter((t) => t.status === col.id).length})
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {kanbanColumns.map((col) => {
              const colTasks = filteredTasks.filter((t) => t.status === col.id);
              const isMobileHidden = mobileKanbanTab !== col.id;
              return (
                <div key={col.id} className={`space-y-3 ${isMobileHidden ? 'hidden md:block' : 'block'}`}>
                  {/* Column Header */}
                  <div className={`flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-900 amoled:bg-amoled-card border-l-4 ${col.color} border-slate-200 dark:border-slate-800 shadow-sm`}>
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      {col.label}
                    </h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Column Tasks List */}
                  <div className="space-y-3 min-h-[300px]">
                    {colTasks.map((task) => {
                      const isDone = task.status === 'completed';
                      return (
                        <Card key={task.id} className="p-4 relative group">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                              {task.title}
                            </h4>
                            <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setEditingTask(task);
                                  setTitle(task.title);
                                  setDescription(task.description || '');
                                  setPriority(task.priority);
                                  setDueDate(task.dueDate || '');
                                  setLabels(task.labels.join(', '));
                                  setIsCreateModalOpen(true);
                                }}
                                className="p-1 text-slate-400 hover:text-indigo-500"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => deleteTask(task.id)} className="p-1 text-slate-400 hover:text-red-500">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {task.description && (
                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          {/* Labels & Due date */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                              task.priority === 'high' ? 'bg-red-500/10 text-red-500' : task.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-500'
                            }`}>
                              {task.priority}
                            </span>

                            {task.dueDate && (
                              <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                <Clock className="w-3 h-3" /> {task.dueDate}
                              </span>
                            )}
                          </div>

                          {/* Subtasks Checklists */}
                          {task.subtasks.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                              {task.subtasks.map((st) => (
                                <div
                                  key={st.id}
                                  onClick={() => toggleSubtask(task.id, st.id)}
                                  className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 cursor-pointer"
                                >
                                  <span className={st.completed ? 'line-through text-slate-400' : ''}>
                                    {st.completed ? '☑' : '☐'} {st.title}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Inline add subtask input */}
                          <div className="mt-2 flex items-center gap-1">
                            <input
                              type="text"
                              placeholder="+ Add subtask"
                              value={newSubtaskInput[task.id] || ''}
                              onChange={(e) => setNewSubtaskInput({ ...newSubtaskInput, [task.id]: e.target.value })}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddSubtaskSubmit(task.id)}
                              className="w-full bg-slate-50 dark:bg-slate-900 text-[10px] px-2 py-1 rounded border border-slate-200 dark:border-slate-800 focus:outline-none"
                            />
                          </div>

                          {/* Stage Shift Controls */}
                          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px]">
                            <button
                              onClick={() => handleCompleteToggle(task.id)}
                              className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> {isDone ? 'Reopen' : 'Complete'}
                            </button>

                            <select
                              value={task.status}
                              onChange={(e) => moveTaskStatus(task.id, e.target.value as TaskStatus)}
                              className="bg-transparent text-[10px] text-slate-400 font-medium focus:outline-none"
                            >
                              <option value="pending">To Do</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <Card className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredTasks.map((task) => (
            <div key={task.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  onChange={() => handleCompleteToggle(task.id)}
                  className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                />
                <div className="min-w-0">
                  <h4 className={`text-xs font-bold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                    {task.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">{task.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 uppercase">
                  {task.priority}
                </span>
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">{task.dueDate}</span>
                <button onClick={() => deleteTask(task.id)} className="text-slate-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Create / Edit Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingTask(null);
        }}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Task Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Complete UI Glassmorphism polish"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key requirements or details..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingTask ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
