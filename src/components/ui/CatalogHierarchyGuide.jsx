import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Compass, 
  Layers, 
  BookOpenCheck, 
  Calendar, 
  Sparkles, 
  Dumbbell, 
  ArrowRight, 
  ArrowLeft,
  ChevronDown, 
  ChevronUp, 
  Languages, 
  CheckCircle2, 
  Lightbulb, 
  AlertCircle,
  HelpCircle,
  Eye,
  GitFork
} from 'lucide-react';

export default function CatalogHierarchyGuide({ currentPage = '' }) {
  const navigate = useNavigate();

  // Collapsed state
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('tounos_guide_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Language state
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('tounos_guide_lang') || 'ar';
    } catch {
      return 'ar';
    }
  });

  // Mode: 'focused' (شرح الصفحة الحالية فقط) or 'pipeline' (خريطة الخطوات الكاملة)
  const [viewMode, setViewMode] = useState('focused');

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('tounos_guide_collapsed', String(next)); } catch {}
      return next;
    });
  };

  const toggleLang = () => {
    setLang(prev => {
      const next = prev === 'ar' ? 'en' : 'ar';
      try { localStorage.setItem('tounos_guide_lang', next); } catch {}
      return next;
    });
  };

  // بيانات كل صفحة بأسلوب بسيط جداً وسهل الفهم
  const pageGuides = {
    categories: {
      titleAr: 'أنت في: تصنيفات الخدمات (الأقسام الرئيسية)',
      titleEn: 'You are in: Service Categories (Master Sections)',
      icon: Layers,
      color: 'blue',
      whatAr: 'هنا بتعمل الأقسام الكبيرة اللي بتجمع خدمات النادي (زي: كلاسات جماعية، مساج، تدريب خاص)، وتختار لكل قسم الأيقونة اللي هتظهر للمشتركات في التطبيق.',
      whatEn: 'Create the top-level sections grouping your offerings (e.g. Group Classes, Spa, PT) and choose their app icons.',
      nextStepAr: 'بعد ما تنشئ القسم ⬅️ ادخل على "كتالوج الخدمات" عشان تضيف أسماء الحصص وأسعارها.',
      nextStepEn: 'Next step ⬅️ Go to "Services Catalog" to add individual service names and prices.',
      nextPath: '/services',
      tipAr: 'التصنيف وظيفته تنظيم شكل التطبيق للمشتركات وتسهيل التصفح.',
      tipEn: 'Categories organize the mobile app experience and make browsing intuitive.'
    },
    services: {
      titleAr: 'أنت في: كتالوج الخدمات (الاسم والسعر والمدة)',
      titleEn: 'You are in: Services Catalog (Name, Price & Duration)',
      icon: BookOpenCheck,
      color: 'emerald',
      whatAr: 'هنا بتسجل بيانات أي خدمة جديدة يقدمها النادي: (اسمها، مدتها بالدقائق، وسعرها الفردي)، وبتحدد نوعها: كلاس جماعي أو مساج أو تدريب خاص.',
      whatEn: 'Register raw service offerings: name, duration in mins, price, and technical type (Class, Massage, or Private Training).',
      nextStepAr: 'لو نوعها كلاس جماعي ⬅️ توجه لـ "الكلاسات" لعمل جدول المواعيد الأسبوعي. لو مساج أو تدريب خاص ⬅️ ستكون جاهزة للحجز في شاشاتها مباشرة.',
      nextStepEn: 'If it is a Group Class ⬅️ Go to "Classes" to set weekly schedules. If Massage or PT, it is immediately bookable.',
      nextPath: '/classes',
      tipAr: 'مش محتاج تربط الخدمة بالفروع يدوي، النظام بيربطها تلقائياً بكل الفروع.',
      tipEn: 'No need to link branches manually; new services auto-link to all active branches.'
    },
    classes: {
      titleAr: 'أنت في: الكلاسات وجداولها (التشغيل والمواعيد)',
      titleEn: 'You are in: Classes & Weekly Schedules (Hall Operations)',
      icon: Calendar,
      color: 'purple',
      whatAr: 'هنا بتاخد الخدمة اللي سجلتها في الكتالوج، وتحط لها: سعة الصالة (كام مشتركة)، والجدول الأسبوعي (يوم إيه والساعة كام والمدربة مين في كل فرع).',
      whatEn: 'Turn catalog group services into live hall sessions with capacity limits, weekly schedule slots, and assigned trainers.',
      nextStepAr: 'بعد ضبط الجدول ⬅️ ستظهر المواعيد فورياً للمشتركات في تطبيق الموبايل للحجز.',
      nextStepEn: 'Once scheduled ⬅️ Members can instantly see and book slots via the mobile app.',
      nextPath: null,
      tipAr: '⚠️ قاعدة هامة: كل كلاس جماعي بيرتبط بخدمة واحدة بس من الكتالوج (الخدمة المستخدمة لا يمكن تكرارها لكلاس تاني).',
      tipEn: '⚠️ Golden Rule: Each Class uniquely pairs with 1 Service (cannot reuse the same service for 2 classes).'
    },
    massage: {
      titleAr: 'أنت في: المساج والاستشفاء (جلسات التدليك 1:1)',
      titleEn: 'You are in: Massage & Recovery (1-on-1 Therapy)',
      icon: Sparkles,
      color: 'pink',
      whatAr: 'شاشة تشغيلية خاصة بجلسات التدليك: متابعة المواعيد المحجوزة مع الأخصائيات، وتأكيد الحضور أو الإلغاء، وإضافة خدمات مساج جديدة للفرع.',
      whatEn: 'Dedicated desk for massage therapies: manage bookings with therapists, track attendance, and add branch therapies.',
      nextStepAr: 'تأكد أن الأخصائية مسجلة ومربوطة بالفرع لتتمكن المشتركات من حجز الجلسات معها.',
      nextStepEn: 'Ensure specialists are registered and assigned to this branch to accept bookings.',
      nextPath: '/therapists',
      tipAr: 'جلسات المساج فردية (1-on-1) وتحجز بالساعة مع الأخصائية.',
      tipEn: 'Massage sessions are individual (1-on-1) and booked by duration slots.'
    },
    'private-training': {
      titleAr: 'أنت في: التدريب الخاص (جلسات المدربة الخاصة 1:1)',
      titleEn: 'You are in: Private Training (1-on-1 Coach Sessions)',
      icon: Dumbbell,
      color: 'amber',
      whatAr: 'شاشة إدارة حصص التدريب الفردي: ربط المشتركة بمدربتها الخاصة، حجز المواعيد بالساعة، وتتبع استهلاك الجلسات من رصيد باقة العضوة.',
      whatEn: '1-on-1 coaching desk: match members with private trainers, book hourly sessions, and deduct package quotas.',
      nextStepAr: 'تأكد من وجود رصيد جلسات متبقي في اشتراك المشتركة قبل الحجز.',
      nextStepEn: 'Verify the member has remaining session quota in their active subscription.',
      nextPath: '/trainers',
      tipAr: 'كل جلسة تدريب خاص بتخصم تلقائياً من رصيد حصص التدريب الخاص في باقة المشتركة.',
      tipEn: 'Each completed session automatically deducts from the member private training package quota.'
    }
  };

  const current = pageGuides[currentPage] || pageGuides.services;
  const CurrentIcon = current.icon;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm font-inter mb-6 overflow-hidden transition-all">
      {/* Top Header Bar */}
      <div className="bg-slate-50/80 px-6 py-3.5 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-black text-slate-800 tracking-tight">
              {lang === 'ar' ? 'دليل الخدمات السريع' : 'Services Quick Guide'}
            </span>
            <span className="mx-2 text-slate-300">|</span>
            <span className="text-[11px] text-slate-500 font-medium">
              {lang === 'ar' 
                ? '3 خطوات بسيطة لإضافة أي نشاط بدون أي لخبطة' 
                : '3 simple steps to add and manage club offerings smoothly'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode switcher */}
          <div className="bg-white p-0.5 rounded-xl border border-slate-200 flex items-center text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setViewMode('focused')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                viewMode === 'focused' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>{lang === 'ar' ? 'شرح الصفحة الحالية' : 'Current Page'}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('pipeline')}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                viewMode === 'pipeline' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <GitFork className="w-3 h-3" />
              <span>{lang === 'ar' ? 'خريطة الخطوات الـ 3' : '3-Step Pipeline'}</span>
            </button>
          </div>

          {/* Lang toggle */}
          <button
            type="button"
            onClick={toggleLang}
            className="h-8 px-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-[10px] font-bold flex items-center gap-1"
          >
            <Languages className="w-3 h-3 text-emerald-600" />
            <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          {/* Collapse */}
          <button
            type="button"
            onClick={toggleCollapsed}
            className="h-8 px-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 text-[10px] font-bold flex items-center gap-1"
          >
            {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            <span>{collapsed ? (lang === 'ar' ? 'إظهار' : 'Show') : (lang === 'ar' ? 'إخفاء' : 'Hide')}</span>
          </button>
        </div>
      </div>

      {/* Body Content */}
      {!collapsed && (
        <div className="p-6">
          {viewMode === 'focused' ? (
            /* Mode 1: Clean, focused explanation for the current page only */
            <div className="flex flex-col lg:flex-row items-stretch gap-6">
              {/* Left/Main explanation */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                    <CurrentIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800">
                      {lang === 'ar' ? current.titleAr : current.titleEn}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                      {lang === 'ar' ? current.whatAr : current.whatEn}
                    </p>
                  </div>
                </div>

                {/* Golden Tip Box */}
                <div className="p-3.5 bg-amber-50/80 border border-amber-200/70 rounded-2xl flex items-start gap-2.5 text-xs">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-amber-900 font-semibold leading-relaxed">
                    {lang === 'ar' ? current.tipAr : current.tipEn}
                  </p>
                </div>
              </div>

              {/* Right: What to do next */}
              <div className="lg:w-80 bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{lang === 'ar' ? 'خطوتك التالية' : 'Next Step'}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-700 leading-relaxed">
                    {lang === 'ar' ? current.nextStepAr : current.nextStepEn}
                  </p>
                </div>

                {current.nextPath && (
                  <button
                    type="button"
                    onClick={() => navigate(current.nextPath)}
                    className="mt-4 w-full h-9 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 transition-all shadow-2xs"
                  >
                    <span>{lang === 'ar' ? 'الانتقال للخطوة التالية' : 'Go to Next Screen'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Mode 2: The 3-Step Simple Pipeline Map */
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Step 1: Category */}
                <div 
                  onClick={() => navigate('/categories')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    currentPage === 'categories'
                      ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-400/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-blue-600 bg-blue-100/70 px-2 py-0.5 rounded-md">
                      {lang === 'ar' ? 'خطوة 1: القسم' : 'Step 1: Section'}
                    </span>
                    <Layers className="w-4 h-4 text-blue-600" />
                  </div>
                  <h4 className="text-xs font-black text-slate-800">
                    {lang === 'ar' ? 'تصنيفات الخدمات' : 'Categories'}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                    {lang === 'ar' 
                      ? 'اعمل القسم واختار أيقونته (زي: كلاسات جماعية، مساج، تدريب خاص) عشان تنظم شكل التطبيق.'
                      : 'Create logical umbrella categories with mobile icons (e.g. Classes, Spa, PT).'}
                  </p>
                </div>

                {/* Step 2: Catalog */}
                <div 
                  onClick={() => navigate('/services')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    currentPage === 'services'
                      ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-400/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                      {lang === 'ar' ? 'خطوة 2: الاسم والسعر' : 'Step 2: Service & Price'}
                    </span>
                    <BookOpenCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h4 className="text-xs font-black text-slate-800">
                    {lang === 'ar' ? 'كتالوج الخدمات' : 'Services Catalog'}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed">
                    {lang === 'ar' 
                      ? 'اكتب اسم الحصة ومدتها وسعرها (مثال: يوغا - 60 دقيقة - 200 ج)، وحدد نوعها الفني.'
                      : 'Define raw service: name, duration in mins, price, and technical type.'}
                  </p>
                </div>

                {/* Step 3: Schedules & Operations */}
                <div className="p-4 rounded-2xl border bg-white border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-purple-600 bg-purple-100/70 px-2 py-0.5 rounded-md">
                      {lang === 'ar' ? 'خطوة 3: المواعيد والتشغيل' : 'Step 3: Operations'}
                    </span>
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <h4 className="text-xs font-black text-slate-800">
                    {lang === 'ar' ? 'تحديد المواعيد والصالة' : 'Schedule & Staff'}
                  </h4>
                  <div className="text-[11px] text-slate-600 font-medium mt-2 space-y-1.5">
                    <div 
                      onClick={() => navigate('/classes')}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-purple-50 hover:text-purple-700 cursor-pointer transition-all flex items-center justify-between"
                    >
                      <span>🏋️ {lang === 'ar' ? 'كلاس جماعي ⬅️ الصالة وجدول الأسبوع' : 'Group Class ➔ Weekly Schedule'}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </div>
                    <div 
                      onClick={() => navigate('/massage')}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-pink-50 hover:text-pink-700 cursor-pointer transition-all flex items-center justify-between"
                    >
                      <span>💆 {lang === 'ar' ? 'مساج ⬅️ الأخصائية ومواعيد الحجز' : 'Massage ➔ Therapist & Slot'}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </div>
                    <div 
                      onClick={() => navigate('/private-training')}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 hover:text-amber-700 cursor-pointer transition-all flex items-center justify-between"
                    >
                      <span>🎯 {lang === 'ar' ? 'تدريب خاص ⬅️ المدربة وسيشن 1:1' : 'PT ➔ 1-on-1 Coach & Session'}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom One-liner */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold">
                  {lang === 'ar' 
                    ? '💡 الخلاصة: بتعمل (القسم) ➔ بعدين تحط جواه (الخدمة وسعرها) ➔ بعدين تحط لها (المواعيد والمدربة).' 
                    : '💡 Summary: Create (Section) ➔ Add (Service & Price) ➔ Assign (Schedule & Staff).'}
                </span>
                <span className="text-[11px] text-brand-green font-black">
                  {lang === 'ar' ? 'نظام تونس الرياضي' : 'Tounos System'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
