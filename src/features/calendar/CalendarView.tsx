import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { useTaskStore } from '../../store/useTaskStore';
import { useHabitStore } from '../../store/useHabitStore';
import { useRoutineStore } from '../../store/useRoutineStore';
import { useGoalStore } from '../../store/useGoalStore';

export const CalendarView: React.FC = () => {
  const { tasks } = useTaskStore();
  const { habits } = useHabitStore();
  const { routines } = useRoutineStore();
  const { goals } = useGoalStore();

  const todayStr = new Date().toISOString().split('T')[0];

  // Map Tasks to FullCalendar events
  const taskEvents = tasks.map((t) => ({
    id: t.id,
    title: `[Task] ${t.title}`,
    date: t.dueDate || todayStr,
    backgroundColor: t.priority === 'high' ? '#EF4444' : t.priority === 'medium' ? '#F59E0B' : '#4F46E5',
    borderColor: 'transparent',
    textColor: '#ffffff',
  }));

  // Map Habits to FullCalendar events
  const habitEvents = habits.map((h) => ({
    id: h.id,
    title: `[Habit] ${h.title}`,
    date: todayStr,
    backgroundColor: h.color || '#10B981',
    borderColor: 'transparent',
    textColor: '#ffffff',
  }));

  // Map Goals to FullCalendar events
  const goalEvents = goals.map((g) => ({
    id: g.id,
    title: `[Goal Target] ${g.title}`,
    date: g.targetDate,
    backgroundColor: '#3B82F6',
    borderColor: 'transparent',
    textColor: '#ffffff',
  }));

  const allEvents = [...taskEvents, ...habitEvents, ...goalEvents];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Calendar Agenda Planner
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Unified view of all tasks, habit targets, routine milestones, and goal deadlines.
          </p>
        </div>
      </div>

      <Card className="p-4 sm:p-6 overflow-x-auto">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          buttonText={{
            today: 'Today',
            month: 'Month',
            week: 'Week',
            day: 'Day',
          }}
          dayHeaderFormat={{ weekday: 'short' }}
          events={allEvents}
          editable={true}
          selectable={true}
          height="auto"
        />
      </Card>
    </div>
  );
};
