import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  Firestore,
  Timestamp
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  User, 
  Calendar, 
  Info, 
  ChevronDown, 
  ChevronUp,
  Search,
  Filter
} from 'lucide-react';

interface AuditLogTabProps {
  db: Firestore;
}

interface LogEntry {
  id: string;
  action: string;
  details: any;
  oldValue: any;
  newValue: any;
  userEmail: string;
  timestamp: Timestamp;
}

export const AuditLogTab: React.FC<AuditLogTabProps> = ({ db }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'logs'), orderBy('timestamp', 'desc'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LogEntry[];
      setLogs(logData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [db]);

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionColor = (action: string) => {
    if (action.includes('CREATE')) return 'text-emerald-500 bg-emerald-50 border-emerald-100';
    if (action.includes('DELETE')) return 'text-rose-500 bg-rose-50 border-rose-100';
    if (action.includes('UPDATE')) return 'text-amber-500 bg-amber-50 border-amber-100';
    if (action.includes('LOGIN')) return 'text-blue-500 bg-blue-50 border-blue-100';
    return 'text-slate-500 bg-slate-50 border-slate-100';
  };

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return '...';
    const date = timestamp.toDate();
    return date.toLocaleString('uk-UA', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-6 rounded-[32px] border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-text-main">Журнал Аудиту</h2>
            <p className="text-sm text-text-muted">Історія всіх дій у системі FEEL UP</p>
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text"
            placeholder="Пошук за дією або email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredLogs.map((log) => (
            <motion.div 
              key={log.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-[24px] overflow-hidden hover:border-primary/20 transition-all shadow-sm"
            >
              <div 
                className="p-4 flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getActionColor(log.action)}`}>
                    {log.action}
                  </div>
                  <div className="flex items-center gap-2 text-text-muted text-xs">
                    <User className="w-3 h-3" />
                    <span>{log.userEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-muted text-xs">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(log.timestamp)}</span>
                  </div>
                </div>
                
                <button className="p-2 text-text-muted hover:text-primary transition-colors">
                  {expandedId === log.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              <AnimatePresence>
                {expandedId === log.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border bg-slate-50/50 p-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Деталі дії</h4>
                        <pre className="text-xs bg-white p-4 rounded-2xl border border-border overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                      {(log.oldValue || log.newValue) && (
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Зміни даних</h4>
                          <div className="grid gap-2">
                            {log.oldValue && (
                              <div className="text-xs bg-rose-50/50 p-3 rounded-xl border border-rose-100 text-rose-700">
                                <span className="font-bold block mb-1">Було:</span>
                                {typeof log.oldValue === 'object' ? JSON.stringify(log.oldValue, null, 2) : log.oldValue}
                              </div>
                            )}
                            {log.newValue && (
                              <div className="text-xs bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 text-emerald-700">
                                <span className="font-bold block mb-1">Стало:</span>
                                {typeof log.newValue === 'object' ? JSON.stringify(log.newValue, null, 2) : log.newValue}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
