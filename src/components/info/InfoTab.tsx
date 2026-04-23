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
  <div className="space-y-10 max-w-6xl pb-20">
    {/* Header Section */}
    <div className="saas-card p-8 lg:p-12 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 relative overflow-hidden border-none shadow-none bg-slate-50/50">
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm border border-border">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight uppercase">FEEL UP: ТЕХНІЧНИЙ ГІД</h2>
            <p className="text-primary font-bold text-xs tracking-[0.2em] uppercase mt-1">Документація системи</p>
          </div>
        </div>
        <p className="text-slate-600 text-lg max-w-3xl leading-relaxed">
          Система побудована як єдиний технічний механізм для автоматизації студії аеродизайну. 
          Нижче описані ключові алгоритми та принципи роботи вашого бізнес-помічника.
        </p>
      </div>
    </div>

    {/* Section: Основні модулі */}
    <div className="space-y-6">
      <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] px-2">Основні модулі</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { 
            icon: Box, 
            title: 'Складська логіка', 
            desc: 'Гібридний метод розрахунку. Залишки оновлюються автоматично при кожній операції закупівлі або продажу.',
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
            desc: 'Жорсткі обмеження на видалення товарів, які знаходяться в активних замовленнях або закупівлях.',
            color: 'text-emerald-500',
            bg: 'bg-emerald-50'
          }
        ].map((item, i) => (
          <div key={i} className="saas-card p-8 flex flex-col items-start text-left">
            <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mb-6`}>
              <item.icon className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h4>
            <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Section: Детальні алгоритми */}
    <div className="space-y-6">
      <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] px-2">Алгоритми та розрахунки</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="saas-card p-8">
          <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mb-6">
            <Activity className="w-6 h-6" />
          </div>
          <h4 className="text-xl font-bold text-slate-900 mb-4">Розрахунок залишків</h4>
          <div className="space-y-6">
            <div>
              <p className="font-bold text-slate-900 mb-1">Вільний залишок (Free Stock)</p>
              <p className="text-sm text-slate-500">Актуальний залишок на складі мінус Резерв (товари у замовленнях зі статусом "В обробці").</p>
            </div>
            <div>
              <p className="font-bold text-slate-900 mb-1">Резервування</p>
              <p className="text-sm text-slate-500">Товари стають недоступними для нових продажів одразу після додавання у замовлення.</p>
            </div>
            <div>
              <p className="font-bold text-slate-900 mb-1">Архівна логіка</p>
              <p className="text-sm text-slate-500">Архівовані товари зберігаються в історії для звітів, але приховані у всіх нових документах.</p>
            </div>
          </div>
        </div>

        <div className="saas-card p-8 border-primary/20 bg-primary/[0.02]">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
            <Wind className="w-6 h-6" />
          </div>
          <h4 className="text-xl font-bold text-slate-900 mb-4">Облік Гелію</h4>
          <div className="space-y-6">
            <div>
              <p className="font-bold text-slate-900 mb-2">Автоматичне списання</p>
              <p className="text-sm text-slate-500 leading-relaxed">
                Система автоматично конвертує літраж кожної кульки у м³ та віднімає це значення від балансу балона при виконанні замовлення.
              </p>
            </div>
            <div>
              <p className="font-bold text-slate-900 mb-2">Технічні карти</p>
              <p className="text-sm text-slate-500 leading-relaxed">
                Розрахунок базується на довіднику технічних норм, де прописано точну витрату газу на кожен розмір кулі.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Section: Безпека */}
    <div className="space-y-6">
      <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] px-2">Контроль та безпека</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { icon: Trash2, title: 'Кошик (Soft Delete)', desc: 'Видалені записи не зникають назавжди, а переміщуються в кошик для можливості відновлення.', color: 'text-amber-600', bg: 'bg-amber-50' },
          { icon: Lock, title: 'Захист документів', desc: 'Виконані замовлення та оплачені закупівлі блокуються для змін, щоб зберегти цілісність обліку.', color: 'text-rose-600', bg: 'bg-rose-50' },
          { icon: Users, title: 'Журнал дій', desc: 'Кожна суттєва зміна статусу або створення документа записується в системний лог дій.', color: 'text-indigo-600', bg: 'bg-indigo-50' }
        ].map((item, i) => (
          <div key={i} className="saas-card p-8 flex flex-col items-start text-left">
            <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mb-6`}>
              <item.icon className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h4>
            <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Section: Lifecycle */}
    <div className="space-y-6">
      <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] px-2">Життєвий цикл замовлення</h3>
      <div className="saas-card p-10 lg:p-16">
        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-4">
          <div className="flex flex-col items-center text-center max-w-[220px] relative z-10">
            <div className="w-14 h-14 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center mb-6 shadow-sm font-black text-slate-400">01</div>
            <p className="font-bold text-slate-900 text-lg mb-2">В обробці</p>
            <p className="text-xs text-slate-500 leading-relaxed">Товар резервується на складі, але ще не списується фізично.</p>
          </div>

          <ArrowRight className="hidden lg:block w-8 h-8 text-slate-200 shrink-0" />

          <div className="flex flex-col items-center text-center max-w-[220px] relative z-10">
            <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-primary/20 scale-110">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="font-bold text-slate-900 text-lg mb-2">Виконано</p>
            <p className="text-xs text-slate-500 leading-relaxed">Остаточне списання зі складу та додавання суми до доходу.</p>
          </div>

          <ArrowRight className="hidden lg:block w-8 h-8 text-slate-200 shrink-0" />

          <div className="flex flex-col items-center text-center max-w-[220px] relative z-10">
            <div className="w-14 h-14 bg-slate-50 border-2 border-slate-200 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Zap className="w-6 h-6 text-slate-300" />
            </div>
            <p className="font-bold text-slate-400 text-lg mb-2">Архівація</p>
            <p className="text-xs text-slate-300 leading-relaxed">Замовлення стає частиною історії без можливості редагування.</p>
          </div>

          <div className="absolute top-7 left-1/4 right-1/4 h-0.5 bg-slate-100 hidden lg:block"></div>
        </div>
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
