import React from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Box, 
  Users, 
  ShoppingBag, 
  CreditCard, 
  BookOpen, 
  Activity, 
  Wind,
  Trash2,
  Lock,
  ArrowRight
} from 'lucide-react';

export const InfoTab = () => (
  <div className="space-y-8 max-w-6xl pb-10">
    {/* Header Section */}
    <div className="saas-card p-8 lg:p-12 bg-gradient-to-br from-primary/5 via-transparent to-indigo-500/5 relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">FEEL UP: Технічний гід</h2>
        </div>
        <p className="text-slate-600 text-lg lg:text-xl max-w-3xl leading-relaxed">
          Система побудована як єдиний технічний механізм для автоматизації студії аеродизайну. 
          Нижче описані ключові алгоритми та принципи роботи вашого бізнес-помічника.
        </p>
      </div>
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
    </div>

    {/* Main Modules Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[
        { 
          icon: Box, 
          title: 'Складська логіка', 
          desc: 'Гібридний метод розрахунку. Залишки оновлюються автоматично ("атомарно") при кожній операції закупівлі або продажу.',
          color: 'text-blue-500',
          bg: 'bg-blue-50'
        },
        { 
          icon: TrendingUp, 
          title: 'Фінансова логіка', 
          desc: 'Маржа рахується як різниця між ціною продажу та собівартістю (Cost Basis) кожного окремого товару.',
          color: 'text-indigo-500',
          bg: 'bg-indigo-50'
        },
        { 
          icon: ShieldCheck, 
          title: 'Цілісність даних', 
          desc: 'Жорсткі обмеження (Hard Constraints) на видалення товарів, які знаходяться в активних замовленнях.',
          color: 'text-emerald-500',
          bg: 'bg-emerald-50'
        }
      ].map((item, i) => (
        <div key={i} className="saas-card p-6 border-transparent hover:border-primary/20 transition-all group">
          <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
            <item.icon className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 mb-3">{item.title}</h4>
          <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>

    {/* Detailed Sections */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Inventory Engine Card */}
      <div className="saas-card p-8">
        <div className="flex items-center gap-3 mb-8">
          <Activity className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold text-slate-900 uppercase tracking-wider">Розрахунок залишків</h3>
        </div>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 shrink-0 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 font-bold text-xs italic">FS</div>
            <div>
              <p className="font-bold text-slate-900 mb-1">Вільний залишок (Free Stock)</p>
              <p className="text-sm text-slate-500">Актуальний залишок на складі мінус "Резерв" (товари у замовленнях "В обробці").</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 shrink-0 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 font-bold text-xs italic">RS</div>
            <div>
              <p className="font-bold text-slate-900 mb-1">Резервування</p>
              <p className="text-sm text-slate-500">Товари стають недоступними для нових продажів одразу після створення чернетки замовлення.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-10 h-10 shrink-0 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 font-bold text-xs italic">AL</div>
            <div>
              <p className="font-bold text-slate-900 mb-1">Архівна логіка</p>
              <p className="text-sm text-slate-500">Архівовані товари зберігаються в історії, але приховані у всіх формах вибору.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Helium Logic Card */}
      <div className="saas-card p-8 bg-slate-900 text-white border-none shadow-indigo-500/20">
        <div className="flex items-center gap-3 mb-8">
          <Wind className="w-5 h-5 text-indigo-400" />
          <h3 className="text-xl font-bold text-white uppercase tracking-wider">Облік Гелію</h3>
        </div>
        <div className="space-y-6">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-2">Автоматичне списання</p>
            <p className="text-sm text-slate-300 leading-relaxed">
              Система автоматично конвертує літраж кожної кульки у м³ та віднімає це значення від балансу балона при виконанні замовлення.
            </p>
          </div>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-indigo-300 text-[10px] font-black uppercase tracking-widest mb-2">Технічні карти</p>
            <p className="text-sm text-slate-300 leading-relaxed">
              Базується на довіднику "Норми", де прописано витрату газу на кожен розмір кулі.
            </p>
          </div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs italic mt-4">
            <Zap className="w-3 h-3" /> 1 м³ = 1000 літрів
          </div>
        </div>
      </div>
    </div>

    {/* Security & Lifecycle Section */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="saas-card p-6 bg-slate-50">
        <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4">
          <Trash2 className="w-5 h-5" />
        </div>
        <h5 className="font-bold text-slate-900 mb-2 italic">Soft Delete</h5>
        <p className="text-xs text-slate-500 leading-relaxed">
          Будь-яке видалення є "м'яким". Записи переміщуються в кошик, звідки їх можна відновити.
        </p>
      </div>

      <div className="saas-card p-6 bg-slate-50">
        <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mb-4">
          <Lock className="w-5 h-5" />
        </div>
        <h5 className="font-bold text-slate-900 mb-2 italic">Immutable Docs</h5>
        <p className="text-xs text-slate-500 leading-relaxed">
          Виконані замовлення та оплачені закупівлі захищені від випадкових змін для цілісності обліку.
        </p>
      </div>

      <div className="saas-card p-6 bg-slate-50">
        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
          <Users className="w-5 h-5" />
        </div>
        <h5 className="font-bold text-slate-900 mb-2 italic">Audit Log</h5>
        <p className="text-xs text-slate-500 leading-relaxed">
          Кожна суттєва дія (зміна статусу, створення) записується в журнал для контролю менеджерами.
        </p>
      </div>
    </div>

    {/* Document Lifecycle Section */}
    <div className="saas-card p-8 lg:p-12 overflow-hidden relative">
      <h3 className="text-2xl font-black text-slate-900 mb-10 text-center italic tracking-tight">Життєвий цикл замовлення</h3>
      
      <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-4">
        {/* Step 1 */}
        <div className="flex flex-col items-center text-center max-w-[200px] relative z-10">
          <div className="w-14 h-14 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center mb-4 shadow-sm">
            <span className="text-lg font-black text-slate-400">01</span>
          </div>
          <p className="font-bold text-slate-900 mb-1">В обробці</p>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Резерв на складі</p>
        </div>

        <ArrowRight className="hidden lg:block w-6 h-6 text-slate-300" />

        {/* Step 2 */}
        <div className="flex flex-col items-center text-center max-w-[200px] relative z-10">
          <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-primary/25 scale-110">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <p className="font-bold text-slate-900 mb-1">Виконано</p>
          <p className="text-[10px] text-primary font-black uppercase tracking-widest">Списання + Дохід</p>
        </div>

        <ArrowRight className="hidden lg:block w-6 h-6 text-slate-300" />

        {/* Step 3 */}
        <div className="flex flex-col items-center text-center max-w-[200px] relative z-10 opacity-40">
          <div className="w-14 h-14 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center mb-4 shadow-sm">
            <Zap className="w-6 h-6 text-slate-400" />
          </div>
          <p className="font-bold text-slate-900 mb-1">Архівація</p>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Збереження історії</p>
        </div>

        {/* Background Line */}
        <div className="absolute top-7 left-20 right-20 h-0.5 bg-slate-100 hidden lg:block"></div>
      </div>
    </div>
  </div>
);

const CheckCircle2 = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);
