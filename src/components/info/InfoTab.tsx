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

export const InfoTab = () => (
  <div className="space-y-12 max-w-6xl pb-20">
    {/* Header Section */}
    <div className="saas-card p-6 lg:p-10 border-none shadow-none bg-slate-50 rounded-[32px]">
      <div className="flex items-center gap-5 mb-6">
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm border border-border shrink-0">
          <BookOpen className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight uppercase">FEEL UP: ТЕХНІЧНИЙ ГІД</h2>
          <p className="text-primary font-bold text-[10px] tracking-widest uppercase mt-1">Документація та логіка системи</p>
        </div>
      </div>
      <p className="text-slate-600 text-base max-w-3xl leading-relaxed">
        Система FEEL UP — це професійний інструмент для управління студією аеродизайну. 
        Усі розрахунки автоматизовані для вашої зручності та точності обліку.
      </p>
    </div>

    {/* Section: Основні блоки */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[
        { 
          icon: Box, 
          title: 'Складська логіка', 
          desc: 'Залишки оновлюються автоматично при кожній операції закупівлі або продажу. Система підтримує як транзакційний облік, так і динамічний перерахунок.'
        },
        { 
          icon: TrendingUp, 
          title: 'Фінансова логіка', 
          desc: 'Чистий прибуток обчислюється як різниця між сумою продажу та зафіксованою собівартістю (Cost Price) кожного товару.'
        },
        { 
          icon: ShieldCheck, 
          title: 'Цілісність даних', 
          desc: 'Система блокує видалення товарів, клієнтів або замовлень, якщо це може призвести до помилок у фінансовій звітності.'
        }
      ].map((item, i) => (
        <div key={i} className="saas-card p-8">
          <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center mb-6">
            <item.icon className="w-6 h-6" />
          </div>
          <h4 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h4>
          <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>

    {/* Section: Алгоритми */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Остатки */}
      <div className="saas-card p-8">
        <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center mb-6">
          <Activity className="w-6 h-6" />
        </div>
        <h4 className="text-xl font-bold text-slate-900 mb-6">Розрахунок залишків</h4>
        <div className="space-y-6">
          <div>
            <p className="text-base font-bold text-slate-900 mb-1">Вільний залишок (Free Stock)</p>
            <p className="text-sm text-slate-500">Ваш фактичний склад за вирахуванням "Резерву" — товарів, які вже заброньовані клієнтами у нових замовленнях.</p>
          </div>
          <div>
            <p className="text-base font-bold text-slate-900 mb-1">Резервування</p>
            <p className="text-sm text-slate-500">Товари стають недоступними для нових продажів одразу після додавання у замовлення зі статусом "В обробці".</p>
          </div>
          <div>
            <p className="text-base font-bold text-slate-900 mb-1">Архівна логіка</p>
            <p className="text-sm text-slate-500">Архівовані товари приховуються зі списків вибору, щоб не захаращувати інтерфейс, але зберігаються в історії.</p>
          </div>
        </div>
      </div>

      {/* Гелий */}
      <div className="saas-card p-8">
        <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center mb-6">
          <Wind className="w-6 h-6" />
        </div>
        <h4 className="text-xl font-bold text-slate-900 mb-6">Облік Гелію</h4>
        <div className="space-y-6">
          <div>
            <p className="text-base font-bold text-slate-900 mb-2">Автоматичне списання</p>
            <p className="text-sm text-slate-500 leading-relaxed">
              При кожному виконанні замовлення система автоматично перераховує літраж кульок у кубічні метри та віднімає їх від балансу балона.
            </p>
          </div>
          <div>
            <p className="text-base font-bold text-slate-900 mb-2">Технічні карти</p>
            <p className="text-sm text-slate-500 leading-relaxed">
              Точність розрахунків забезпечується технічними нормами, де прописано витрату газу на кожен конкретний розмір кулі.
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Section: Безпека */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[
        { icon: Trash2, title: 'Кошик', desc: 'Записи не видаляються миттєво. Вони переміщуються у Кошик, звідки їх можна відновити у разі помилки.' },
        { icon: Lock, title: 'Захист документів', desc: 'Виконані замовлення та оплачені закупівлі стають недоступними для випадкових змін.' },
        { icon: Users, title: 'Аудит лог', desc: 'Система фіксує кожну суттєву дію: хто, коли і яку операцію виконав у системі FEEL UP.' }
      ].map((item, i) => (
        <div key={i} className="saas-card p-8">
          <div className="w-12 h-12 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center mb-6">
            <item.icon className="w-6 h-6" />
          </div>
          <h4 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h4>
          <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>

    {/* Section: Життєвий цикл */}
    <div className="saas-card p-10 lg:p-16">
      <h3 className="text-2xl font-black text-slate-900 mb-12 text-center uppercase tracking-tight">Життєвий цикл замовлення</h3>
      
      <div className="relative flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-6">
        <div className="flex flex-col items-center text-center max-w-[220px] relative z-10">
          <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center mb-6 shadow-sm font-black text-slate-400">01</div>
          <p className="font-bold text-slate-900 text-lg mb-2">В обробці</p>
          <p className="text-sm text-slate-500">Товар резервується на складі, але фактичне списання ще не відбулося.</p>
        </div>

        <ArrowRight className="hidden lg:block w-8 h-8 text-slate-200" />

        <div className="flex flex-col items-center text-center max-w-[220px] relative z-10">
          <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <p className="font-bold text-slate-900 text-lg mb-2">Виконано</p>
          <p className="text-sm text-slate-500">Товар остаточно списується зі складу, а кошти додаються до вашого доходу.</p>
        </div>

        <ArrowRight className="hidden lg:block w-8 h-8 text-slate-200" />

        <div className="flex flex-col items-center text-center max-w-[220px] relative z-10">
          <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mb-6 shadow-sm font-black text-slate-300">03</div>
          <p className="font-bold text-slate-400 text-lg mb-2">Архівація</p>
          <p className="text-sm text-slate-300">Замовлення зберігається в історії для аналітики без можливості подальших змін.</p>
        </div>

        <div className="absolute top-6 left-1/4 right-1/4 h-px bg-slate-100 hidden lg:block"></div>
      </div>
    </div>
  </div>
);
