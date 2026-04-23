import React from 'react';
import { TrendingUp, ShieldCheck, Zap, Award } from 'lucide-react';

export const InfoTab = () => (
  <div className="space-y-8 max-w-5xl">
    <div className="saas-card p-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
          <TrendingUp className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-3xl font-bold text-slate-900">Feel UP</h3>
          <p className="text-slate-500 text-lg">Ваш помічник у світі кульок</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: ShieldCheck, title: 'Безпека', text: 'Ваші дані надійно захищені у хмарі Google Firebase із доступом через Google Auth.' },
          { icon: Zap, title: 'Швидкість', text: 'Миттєве оновлення залишків при кожному продажі або закупівлі.' },
          { icon: Award, title: 'Професійність', text: 'Ведіть бізнес на новому рівні з якісним обліком та аналітикою.' }
        ].map((item, i) => (
          <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <item.icon className="w-8 h-8 text-indigo-500 mb-4" />
            <h4 className="font-bold text-slate-900 mb-2">{item.title}</h4>
            <p className="text-sm text-slate-500 leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);
