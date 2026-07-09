import { useNavigate } from 'react-router-dom';
import { Layers, ListPlus, Calendar, PlusCircle, CheckCircle2 } from 'lucide-react';

export default function ServiceSetupStepper({ activeStep }) {
  const navigate = useNavigate();

  const steps = [
    {
      id: 1,
      title: 'Categories',
      subtitle: 'Create logical groups',
      path: '/categories',
      icon: Layers,
    },
    {
      id: 2,
      title: 'Services Catalog',
      subtitle: 'Define pricing & duration',
      path: '/services',
      icon: ListPlus,
    },
    {
      id: 3,
      title: 'Classes Catalog',
      subtitle: 'Set class sizes & levels',
      path: '/classes?tab=classes',
      icon: PlusCircle,
    },
    {
      id: 4,
      title: 'Weekly Schedules',
      subtitle: 'Assign slots to branches',
      path: '/classes?tab=schedules',
      icon: Calendar,
    },
  ];

  return (
    <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm font-inter mb-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="flex h-2.5 w-2.5 rounded-full bg-brand-green animate-pulse" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Service Configuration Guide — دليل تهيئة الخدمات
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {steps.map((step) => {
          const StepIcon = step.icon;
          const isActive = activeStep === step.id;
          const isCompleted = activeStep > step.id;

          return (
            <button
              key={step.id}
              onClick={() => navigate(step.path)}
              className={`flex items-start gap-4 p-4 rounded-2xl border text-left transition-all outline-none cursor-pointer ${
                isActive
                  ? 'border-brand-green bg-brand-green/5 ring-1 ring-brand-green shadow-sm'
                  : isCompleted
                  ? 'border-emerald-100 bg-emerald-50/20 text-slate-600 hover:bg-slate-50'
                  : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 opacity-60'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                  isActive
                    ? 'bg-brand-green text-white'
                    : isCompleted
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-slate-400 uppercase">
                    Step 0{step.id}
                  </span>
                  {isActive && (
                    <span className="text-[8px] font-black uppercase text-brand-green tracking-wider bg-brand-green/10 px-1.5 py-0.5 rounded-md">
                      Active
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-slate-800 text-xs mt-0.5 truncate">{step.title}</h4>
                <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                  {step.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
