import React, { useState } from 'react';
import { txt } from '../i18n/he';
import { Reminder } from '../types';
import { Calendar, Clock, Plus, Trash2, Mail, RefreshCw, Banknote } from 'lucide-react';
import { motion } from 'motion/react';

interface RemindersWidgetProps {
  reminders: Reminder[];
  onAddReminder: (subject: string, body: string, time: string, recurrence?: 'monthly', dayOfMonth?: number) => void;
  onDeleteReminder: (id: string) => void;
}

export default function RemindersWidget({ reminders, onAddReminder, onDeleteReminder }: RemindersWidgetProps) {
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dayOfMonth) {
       const subject = "להזין נתוני משכורת";
       const body = "הגיע הזמן להזין את נתוני המשכורת החודש.";
       const time = "09:00";
       
       const currentDate = new Date();
       let targetMonth = currentDate.getMonth();
       let targetYear = currentDate.getFullYear();
       
       // Handle case where we missed this month's occurrence
       const currentDay = currentDate.getDate();
       const currentHour = currentDate.getHours();
       const currentMin = currentDate.getMinutes();
       
       const selectedTime = new Date(`1970-01-01T${time}`);
       const targetHour = selectedTime.getHours();
       const targetMin = selectedTime.getMinutes();
       
       if (dayOfMonth < currentDay || (dayOfMonth === currentDay && (targetHour < currentHour || (targetHour === currentHour && targetMin <= currentMin)))) {
          targetMonth++;
          if (targetMonth > 11) {
             targetMonth = 0;
             targetYear++;
          }
       }
       
       const nextDate = new Date(targetYear, targetMonth, dayOfMonth, targetHour, targetMin);
       onAddReminder(subject, body, nextDate.toISOString(), 'monthly', dayOfMonth);
       setDayOfMonth(1);
       setIsAdding(false);
    }
  };

  return (
    <div className="glass-card rounded-[2rem] p-6 sm:p-8 border border-white/5 relative overflow-hidden flex flex-col h-full bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-zinc-800/50 rounded-2xl border border-white/5 shadow-inner">
            <Banknote className="h-5 w-5 text-zinc-300" />
          </div>
          <div>
             <h3 className="text-zinc-100 font-extrabold text-sm uppercase tracking-widest leading-none">{txt.reminders.title}</h3>
             <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mt-1">{txt.reminders.monthly}</p>
          </div>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="p-2 rounded-xl bg-pink-500/10 text-pink-500 hover:bg-pink-500/20 active:bg-pink-500/30 transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pe-2 custom-scrollbar space-y-3">
        {isAdding && (
          <motion.form 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-950/50 p-4 rounded-2xl border border-pink-500/20 space-y-3"
            onSubmit={handleSubmit}
          >
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2 block">{txt.reminders.dayOfMonth} (09:00)</label>
              <div className="relative">
                <select
                  value={dayOfMonth}
                  onChange={e => setDayOfMonth(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-pink-500/50 appearance-none"
                  required
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <button 
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 py-2 rounded-xl font-bold uppercase tracking-widest text-[10px] text-zinc-400 border border-white/10 hover:bg-white/5"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 py-2 rounded-xl font-bold uppercase tracking-widest text-[10px] text-pink-50 bg-pink-600 hover:bg-pink-500"
              >
                Schedule
              </button>
            </div>
          </motion.form>
        )}

        {reminders.length === 0 && !isAdding && (
          <div className="text-center py-6 text-zinc-500">
            <Mail className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p className="text-xs uppercase tracking-widest font-bold">{txt.reminders.empty}</p>
            <p className="text-[10px] max-w-[200px] mx-auto mt-2">{txt.reminders.note}</p>
          </div>
        )}

        {reminders.sort((a,b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()).map(reminder => (
          <div key={reminder.id} className={`p-4 rounded-2xl border ${reminder.sent ? 'bg-zinc-900/50 border-white/5' : 'bg-pink-900/10 border-pink-500/20'} flex flex-col group`}>
            <div className="flex items-center justify-between">
              <p className={`text-sm font-medium ${reminder.sent ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                {reminder.subject}
              </p>
              <button 
                onClick={() => onDeleteReminder(reminder.id)}
                className="p-1 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all ms-4"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-3 mt-2 text-[10px] tracking-widest uppercase font-bold text-zinc-500">
              {reminder.recurrence === 'monthly' ? (
                 <div className="flex items-center gap-1.5 text-pink-400/80">
                   <RefreshCw className="h-3 w-3" />
                   Monthly (Day {reminder.dayOfMonth})
                 </div>
              ) : (
                 <div className="flex items-center gap-1.5">
                   <Calendar className="h-3 w-3" />
                   {new Date(reminder.scheduledTime).toLocaleDateString()}
                 </div>
              )}
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                {new Date(reminder.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            {reminder.recurrence === 'monthly' && (
              <p className="text-[9px] text-zinc-600 mt-1 uppercase font-bold">Next: {new Date(reminder.scheduledTime).toLocaleDateString()}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

