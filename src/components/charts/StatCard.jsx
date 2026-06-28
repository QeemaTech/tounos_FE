import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, icon: Icon, change, trend, featured }) {
  const isUp = trend === 'up';

  if (featured) {
    return (
      <div 
        className="bg-gradient-to-br from-[#1ea43e] to-[#177b2f] rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] min-h-[130px] flex flex-col justify-between relative overflow-hidden group hover:-translate-y-[2px] transition-all duration-300 cursor-default"
      >
        <div className="absolute top-0 right-0 p-4 opacity-20 transform group-hover:scale-110 transition-transform">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
            {Icon && <Icon className="w-8 h-8 text-[#1ea43e]" />}
          </div>
        </div>
        <div>
          <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-extrabold text-white mt-1 tracking-tight">{value}</h3>
        </div>
        {change && (
          <div className="flex items-center gap-1 mt-2">
            <div className="flex items-center text-[10px] font-black text-white bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-tighter">
              {isUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {change}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className="card p-6 min-h-[130px] flex flex-col justify-between relative overflow-hidden group shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:-translate-y-[2px] transition-all duration-300 cursor-default border-none"
    >
      <div className="absolute top-0 right-0 p-4 transform group-hover:scale-110 transition-transform">
        <div className={`w-12 h-12 rounded-full ${isUp ? 'bg-[#e9f6ec]' : 'bg-red-50'} flex items-center justify-center border border-white/50 shadow-sm`}>
          {Icon && <Icon className={`w-6 h-6 ${isUp ? 'text-[#177b2f]' : 'text-red-500'}`} />}
        </div>
      </div>
      <div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">{value}</h3>
      </div>
      {change && (
        <div className="flex items-center gap-1 mt-2">
          <div className={`flex items-center text-[10px] font-black ${isUp ? 'text-[#177b2f] bg-[#e9f6ec]' : 'text-red-600 bg-red-50'} px-2 py-0.5 rounded-full uppercase tracking-tighter`}>
            {isUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {change}
          </div>
        </div>
      )}
    </div>
  );
}
