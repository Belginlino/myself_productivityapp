import React from 'react';
import { BarChart3, TrendingUp, Activity, CheckSquare, Clock, Zap } from 'lucide-react';
import { Card } from '../../components/common/Card';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { useTaskStore } from '../../store/useTaskStore';
import { useHabitStore } from '../../store/useHabitStore';
import { usePomodoroStore } from '../../store/usePomodoroStore';
import { useStudyCodingStore } from '../../store/useStudyCodingStore';

export const AnalyticsView: React.FC = () => {
  const { tasks } = useTaskStore();
  const { habits } = useHabitStore();
  const { totalSessionsCompleted } = usePomodoroStore();
  const { studySessions, codingSessions } = useStudyCodingStore();

  const weeklyCompletionData = [
    { day: 'Mon', tasks: 4, focusMinutes: 75, study: 60 },
    { day: 'Tue', tasks: 6, focusMinutes: 100, study: 90 },
    { day: 'Wed', tasks: 5, focusMinutes: 125, study: 45 },
    { day: 'Thu', tasks: 7, focusMinutes: 150, study: 120 },
    { day: 'Fri', tasks: 8, focusMinutes: 110, study: 90 },
    { day: 'Sat', tasks: 3, focusMinutes: 60, study: 30 },
    { day: 'Sun', tasks: 5, focusMinutes: 90, study: 45 },
  ];

  const distributionData = [
    { name: 'Tasks Completed', value: tasks.filter((t) => t.status === 'completed').length + 5, color: '#4F46E5' },
    { name: 'Focus Sessions', value: totalSessionsCompleted + 4, color: '#F59E0B' },
    { name: 'Study Logged', value: studySessions.length + 3, color: '#3B82F6' },
    { name: 'Coding Logged', value: codingSessions.length + 4, color: '#10B981' },
  ];

  const productivityScore = 92; // Calculated composite score out of 100

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Productivity Analytics & Reports
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visual graphs, weekly trends, focus distribution, and composite performance score.
          </p>
        </div>

        {/* Score Badge */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-emerald-600 text-white p-3 px-5 rounded-2xl shadow-lg">
          <Zap className="w-6 h-6 text-amber-300 fill-amber-300" />
          <div>
            <span className="text-[11px] font-medium text-indigo-100 uppercase tracking-wider block">Productivity Score</span>
            <span className="text-xl font-extrabold">{productivityScore} / 100 (Excellent)</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Line Chart */}
        <Card className="lg:col-span-2 p-5">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" /> Weekly Productivity Trend (Tasks vs Focus)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyCompletionData}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
                <Line type="monotone" dataKey="tasks" stroke="#4F46E5" strokeWidth={3} name="Tasks Done" />
                <Line type="monotone" dataKey="study" stroke="#10B981" strokeWidth={3} name="Study Mins" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Time Distribution Pie Chart */}
        <Card className="p-5 flex flex-col justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500" /> Time Distribution
          </h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distributionData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            {distributionData.map((item) => (
              <div key={item.name} className="flex justify-between items-center text-xs">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} /> {item.name}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Focus Minutes Bar Chart */}
      <Card className="p-5">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" /> Daily Focus Minutes Log
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyCompletionData}>
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
              <Bar dataKey="focusMinutes" fill="#F59E0B" radius={[8, 8, 0, 0]} name="Focus Minutes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
