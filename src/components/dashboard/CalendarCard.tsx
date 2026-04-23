import React, { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Clock, ExternalLink } from 'lucide-react';
import { calendarService } from '../../services/calendarService';

interface CalendarCardProps {
  token: string | null;
  onLogin: () => void;
}

export const CalendarCard = ({ token, onLogin }: CalendarCardProps) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchEvents = async () => {
      setLoading(true);
      try {
        const now = new Date().toISOString();
        const items = await calendarService.listEvents(token, now);
        setEvents(items.slice(0, 5)); // Show top 5 upcoming
      } catch (error) {
        console.error('Calendar error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 300000); // Refresh every 5 mins
    return () => clearInterval(interval);
  }, [token]);

  if (!token) {
    return (
      <div className="saas-card p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[280px]">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
          <CalendarIcon className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-xl font-black text-text-main tracking-tight">Google Календар</h3>
          <p className="text-sm text-text-muted mt-2 max-w-[200px] mb-6">Синхронізуйте розклад замовлень з вашим корпоративним календарем</p>
          <button 
            onClick={onLogin}
            className="w-full py-3 bg-navy-dark text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-navy-dark/10 flex items-center justify-center gap-2"
          >
            <CalendarIcon className="w-4 h-4 text-violet-electric" />
            Підключити
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="saas-card p-8 h-full flex flex-col min-h-[350px]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-violet-soft rounded-2xl flex items-center justify-center text-violet-electric">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-caption mb-0.5">Розклад</p>
            <h3 className="text-xl font-black text-text-main tracking-tight">Майбутні події</h3>
          </div>
        </div>
        <a 
          href="https://calendar.google.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-violet-electric hover:border-violet-electric transition-all shadow-sm"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto no-scrollbar">
        {loading && events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-electric"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Завантаження...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm font-bold text-slate-400">На сьогодні подій немає</p>
          </div>
        ) : (
          events.map(event => (
            <div key={event.id} className="p-4 bg-ice-white rounded-2xl border border-transparent hover:border-violet-electric/20 hover:bg-white transition-all group shadow-sm hover:shadow-md">
              <p className="text-sm font-bold text-text-main group-hover:text-violet-electric transition-colors line-clamp-1 mb-2">{event.summary}</p>
              <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-slate-100">
                  <Clock className="w-3 h-3 text-violet-electric" />
                  <span>
                    {new Date(event.start.dateTime || event.start.date).toLocaleTimeString('uk-UA', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <span className="text-slate-300">•</span>
                <span>
                  {new Date(event.start.dateTime || event.start.date).toLocaleDateString('uk-UA', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
