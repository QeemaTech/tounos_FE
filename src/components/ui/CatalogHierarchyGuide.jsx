import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, BookOpenCheck, Users, Sparkles, Dumbbell, Calendar, 
  Info, ChevronDown, ChevronUp, Languages, ArrowRight, CheckCircle2, 
  Lightbulb, ExternalLink 
} from 'lucide-react';

export default function CatalogHierarchyGuide({ currentPage = '' }) {
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('tounos_catalog_guide_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('tounos_catalog_guide_lang') || 'ar';
    } catch {
      return 'ar';
    }
  });

  const toggleCollapsed = () => {
    setCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('tounos_catalog_guide_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const toggleLang = () => {
    setLang(prev => {
      const next = prev === 'ar' ? 'en' : 'ar';
      try {
        localStorage.setItem('tounos_catalog_guide_lang', next);
      } catch {}
      return next;
    });
  };

  const domains = [
    {
      id: 'categories',
      path: '/categories',
      icon: Layers,
      stepNum: '01',
      badgeAr: 'المظلة الكبيرة',
      badgeEn: 'Umbrella Grouping',
      titleAr: 'تصنيفات الخدمات',
      titleEn: 'Service Categories',
      roleAr: 'المظلة الرئيسية التي تجمع الخدمات',
      roleEn: 'Top-level grouping umbrella for club services',
      descAr: 'المظلة الكبيرة اللي بتجمع الخدمات (مثل: الحصص الجماعية، التدريب الخاص، المساج والاستشفاء). فايدتها: تنظيم الكتالوج، وإعطاء شكل وأيقونة وتنسيق لكل قسم في تطبيق المشتركات والداشبورد.',
      descEn: 'The master umbrella grouping all offerings (e.g. Group Classes, Private Training, Massage & Wellness). Organizes the catalog and provides category icons & mobile layouts.',
      exampleAr: 'أمثلة: "الحصص الجماعية"، "التدريب الخاص"، "المساج والاستشفاء"',
      exampleEn: 'Examples: "Group Classes", "Private Training", "Wellness & Massage"',
      actionHintAr: 'ابدأ من هنا لإضافة الأقسام وأيقوناتها الرياضية.',
      actionHintEn: 'Create master categories and select their sports icons first.'
    },
    {
      id: 'services',
      path: '/services',
      icon: BookOpenCheck,
      stepNum: '02',
      badgeAr: 'القاموس المرجعي',
      badgeEn: 'Base Dictionary',
      titleAr: 'كتالوج الخدمات',
      titleEn: 'Services Catalog',
      roleAr: 'القاموس المرجعي لكل نشاط وخدمة',
      roleEn: 'Central reference dictionary for all offerings',
      descAr: 'هنا بتعرّف الخدمة مجردة: (اسمها، مدتها بالدقائق، سعرها الفردي، ونوعها الفني serviceType: كلاس جماعي GROUP_CLASS أو تدريب خاص PRIVATE_TRAINING أو مساج MASSAGE)، وتحديد الفروع المتاحة.',
      descEn: 'Defines the raw service: name, standard duration (mins), base price, and technical serviceType (GROUP_CLASS, PRIVATE_TRAINING, or MASSAGE), plus branch availability.',
      exampleAr: 'مثال: خدمة "Power Yoga" مدتها 60 دقيقة، سعرها 250 ج، نوعها GROUP_CLASS.',
      exampleEn: 'Example: "Power Yoga" - 60 mins, EGP 250, type GROUP_CLASS.',
      actionHintAr: 'كل كلاس أو جلسة مساج أو تدريب خاص يجب أن تبدأ من هنا أولاً.',
      actionHintEn: 'Every class, massage, or private session must originate here first.'
    },
    {
      id: 'classes',
      path: '/classes',
      icon: Users,
      stepNum: '03',
      badgeAr: 'التشغيل الجماعي',
      badgeEn: 'Group Operations',
      titleAr: 'الكلاسات وجداولها',
      titleEn: 'Classes & Schedules',
      roleAr: 'تحويل الخدمة لحصة فعلية في الصالة مع جدولها',
      roleEn: 'Binds GROUP_CLASS to physical hall sessions & schedules',
      descAr: 'بتاخد أي خدمة نوعها GROUP_CLASS وتحولها لحصة جماعية فعلية في الصالة. بتحدد: سعة الصالة القصوى (Capacity مثلاً 20 مشتركة) ومستوى الحصة. وبداخلها يُبنى الجدول الأسبوعي (Schedules) ومواعيد الأيام بالساعة.',
      descEn: 'Converts any GROUP_CLASS service into an active hall session with max capacity (e.g. 20 members) and skill level. Houses weekly recurring schedule slots with trainers & branches.',
      exampleAr: 'مثال: كلاس الـ Yoga يوم الإثنين والأربعاء الساعة 5:00 مساءً في فرع الشيخ زايد.',
      exampleEn: 'Example: Yoga Class on Mon & Wed at 5:00 PM in Sheikh Zayed branch.',
      actionHintAr: 'قاعدة هامة: كل كلاس يرتبط بخدمة واحدة فقط من الكتالوج (1-to-1).',
      actionHintEn: 'Key rule: Each Class uniquely maps to one Catalog Service (1-to-1).'
    },
    {
      id: 'massage',
      path: '/massage',
      icon: Sparkles,
      stepNum: '04',
      badgeAr: 'تشغيل الاستشفاء',
      badgeEn: 'Spa Operations',
      titleAr: 'المساج والاستشفاء',
      titleEn: 'Massage & Recovery',
      roleAr: 'إدارة جلسات التدليك والأخصائيات 1:1',
      roleEn: 'Specialist-driven 1-on-1 therapy bookings & execution',
      descAr: 'شاشة تشغيلية وإدارية خاصة فقط بخدمات وجلسات التدليك والاستشفاء. بتعرض خدمات المساج المتاحة في الفرع، والمواعيد والجلسات المحجوزة مع الأخصائيات، ومتابعة تنفيذها وحضورها أو إلغائها.',
      descEn: 'Dedicated desk for massage therapies: lists branch treatments, therapist bookings, session execution tracking, and attendance/cancellation records.',
      exampleAr: 'حجز جلسة Swedish Massage لمدة 45 دقيقة مع الأخصائية في فرع المعادي.',
      exampleEn: 'Book Swedish Massage 45 min with Therapist at Maadi branch.',
      actionHintAr: 'تأكد من تسجيل الأخصائية وربطها بالفرع لتفعيل الحجوزات.',
      actionHintEn: 'Ensure therapists are registered and assigned to branch.'
    },
    {
      id: 'private-training',
      path: '/private-training',
      icon: Dumbbell,
      stepNum: '05',
      badgeAr: 'التدريب الخاص 1:1',
      badgeEn: '1-on-1 Coaching',
      titleAr: 'التدريب الخاص (PT)',
      titleEn: 'Private Training',
      roleAr: 'ربط المشتركة بالمدربة الخاصة بالساعة',
      roleEn: '1-on-1 coach booking & quota deduction desk',
      descAr: 'شاشة تشغيلية وإدارية لحصص التدريب الفردي (1-on-1 Sessions). ربط المشتركة بالمدربة الخاصة، وحجز مواعيد بالساعة، وتتبع استهلاك الجلسات المتبقية لكل عضوة من باقتها.',
      descEn: 'Operational desk for 1-on-1 coaching: link members with private trainers, book hourly sessions, and monitor remaining quota deductions per member.',
      exampleAr: 'حجز سيشن PT مع الكابتن سارة واستهلاك 1 جلسة من رصيد المشتركة.',
      exampleEn: 'Book 1-on-1 session with Coach Sarah and deduct 1 session quota.',
      actionHintAr: 'تأكد من وجود رصيد للمشتركة في باقتها أو حجز جلسة منفصلة.',
      actionHintEn: 'Verify member has private training quota or purchase single session.'
    }
  ];

  const tips = [
    {
      titleAr: 'قاعدة عدم تكرار الكلاسات (Classes 1-to-1 Mapping)',
      titleEn: 'Classes 1-to-1 Unique Service Mapping',
      textAr: 'كل كلاس جماعي يرتبط بخدمة واحدة فقط من الكتالوج. إذا ظهرت رسالة خطأ، فهذا يعني أن الخدمة المختارة مرتبطة بالفعل بكلاس جماعي آخر.',
      textEn: 'Each Group Class can only be mapped to ONE Service. If you receive an error, the selected service is already tied to another existing class.'
    },
    {
      titleAr: 'تلقائية ربط الخدمات بالفروع (Branch Auto-Linking)',
      titleEn: 'Automatic Branch Service Linking',
      textAr: 'الخدمات المضافة في الكتالوج تُربط تلقائياً بجميع الفروع لتكون جاهزة للحجز أو الجدولة فور إنشائها بدون خطوات معقدة.',
      textEn: 'Services created in catalog are automatically linked to active branches so they are immediately available for schedules & bookings.'
    },
    {
      titleAr: 'منع التعارض في المواعيد والجداول (Schedule Conflict Prevention)',
      titleEn: 'Schedule Collision Prevention',
      textAr: 'لا يمكن إضافة موعدين لنفس الكلاس في نفس الفرع واليوم ونفس وقت البدء. تأكد من تعديل الوقت أو اختيار مدربة أخرى.',
      textEn: 'Two schedule slots cannot share the same class, branch, day of week, and start time. Adjust start time or day if conflict occurs.'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-white via-slate-50/70 to-emerald-50/30 rounded-[28px] border border-slate-200/80 p-6 shadow-sm font-inter mb-8 transition-all">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 shadow-sm">
            <BookOpenCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-800 tracking-tight">
                {lang === 'ar' ? 'دليل هيكلة وتدفق الخدمات في النادي' : 'Club Services & Catalog Architecture'}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-brand-green/10 text-brand-green text-[9px] font-black uppercase tracking-wider">
                {lang === 'ar' ? 'خريطة النظام' : 'Workflow Map'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              {lang === 'ar' 
                ? 'توضيح الفرق والعلاقة بين التصنيفات، الكتالوج، الكلاسات، المساج، والتدريب الخاص لتفادي أخطاء الإضافة'
                : 'Clear distinction between Categories, Catalog, Classes, Massage & Private Training to prevent ADD errors'
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            type="button"
            onClick={toggleLang}
            className="h-9 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-all"
            title="تبديل اللغة / Toggle Language"
          >
            <Languages className="w-3.5 h-3.5 text-emerald-600" />
            <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
          </button>

          {/* Collapse toggle */}
          <button
            type="button"
            onClick={toggleCollapsed}
            className="h-9 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            {collapsed ? (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                <span>{lang === 'ar' ? 'عرض الشرح والتفاصيل' : 'Expand Guide'}</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                <span>{lang === 'ar' ? 'تصغير الدليل' : 'Minimize'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Collapsed quick strip */}
      {collapsed ? (
        <div className="pt-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
              {lang === 'ar' ? 'التسلسل المنطقي:' : 'Hierarchy:'}
            </span>
            {domains.map((d, i) => (
              <div key={d.id} className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => navigate(d.path)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                    currentPage === d.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{lang === 'ar' ? d.titleAr : d.titleEn}</span>
                  {currentPage === d.id && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                </button>
                {i < domains.length - 1 && (
                  <span className="text-slate-300 text-xs font-black">→</span>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={toggleCollapsed}
            className="text-[10px] font-black text-emerald-600 hover:underline flex items-center gap-1"
          >
            <span>{lang === 'ar' ? 'كيف ترتبط هذه الأقسام ببعضها؟' : 'How are these linked?'}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      ) : (
        /* Expanded full view */
        <div className="pt-5 space-y-6">
          {/* The 5 Domain Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
            {domains.map((d) => {
              const IconComp = d.icon;
              const isCurrent = currentPage === d.id;

              return (
                <div
                  key={d.id}
                  onClick={() => {
                    if (!isCurrent) navigate(d.path);
                  }}
                  className={`relative rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-500/20 -translate-y-0.5'
                      : 'bg-white/80 hover:bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div>
                    {/* Top step badge */}
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isCurrent 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-slate-100 text-slate-600'
                      }` }>
                        <IconComp className="w-4 h-4" />
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-black text-slate-400">
                          {d.stepNum}
                        </span>
                        {isCurrent && (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase tracking-wider animate-pulse">
                            {lang === 'ar' ? 'أنت هنا' : 'Active'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Badge */}
                    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[9px] font-bold mb-1.5">
                      {lang === 'ar' ? d.badgeAr : d.badgeEn}
                    </span>

                    {/* Title */}
                    <h4 className="text-xs font-black text-slate-800 leading-snug">
                      {lang === 'ar' ? d.titleAr : d.titleEn}
                    </h4>

                    {/* Role */}
                    <p className="text-[10px] font-bold text-emerald-600 mt-1">
                      {lang === 'ar' ? d.roleAr : d.roleEn}
                    </p>

                    {/* Description */}
                    <p className="text-[10.5px] text-slate-500 font-medium mt-2 leading-relaxed">
                      {lang === 'ar' ? d.descAr : d.descEn}
                    </p>
                  </div>

                  {/* Example & Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100/80">
                    <p className="text-[9.5px] font-semibold text-slate-400 italic">
                      {lang === 'ar' ? d.exampleAr : d.exampleEn}
                    </p>
                    <div className="mt-2 text-[9px] font-bold text-emerald-700 bg-emerald-50/70 p-1.5 rounded-lg">
                      {lang === 'ar' ? d.actionHintAr : d.actionHintEn}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Pitfalls & Prevention Tips Banner */}
          <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider">
                {lang === 'ar' ? 'إرشادات هامة لتفادي أخطاء الإضافة الشائعة' : 'Crucial Rules to Prevent ADD Failures'}
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {tips.map((t, idx) => (
                <div key={idx} className="bg-white/90 p-3 rounded-xl border border-amber-100 text-[10.5px]">
                  <p className="font-bold text-slate-800 mb-1">
                    {lang === 'ar' ? t.titleAr : t.titleEn}
                  </p>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    {lang === 'ar' ? t.textAr : t.textEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}