import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  Mail, 
  Lock, 
  Users, 
  Calendar, 
  Activity, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left: Brand panel with premium layout and glassmorphism elements */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0b3916] via-[#177b2f] to-[#082710] relative overflow-hidden flex-col justify-between p-16 text-white">
        
        {/* Soft Radial Glows & Abstract Patterns */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[#fced3c]/5 blur-[100px] pointer-events-none" />
        <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] rounded-full bg-emerald-400/5 blur-[80px] pointer-events-none" />
        
        {/* Grid Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        {/* Top: Logo & Title */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#fced3c] to-[#1ea43e] p-[2px] shadow-lg shadow-black/20">
            <div className="w-full h-full bg-[#0b3916] rounded-[10px] flex items-center justify-center text-white text-xl font-black">
              T
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider">
              TONUS <span className="text-[#fced3c]">CLUB</span>
            </h1>
            <p className="text-[10px] text-white/50 tracking-widest uppercase">Admin System</p>
          </div>
        </div>

        {/* Middle: Content & Glassmorphism Widgets */}
        <div className="relative z-10 my-auto max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-xs font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Admin Portal Active</span>
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight leading-tight mb-4">
            Manage your club's operations in <span className="text-[#fced3c]">Real-Time</span>.
          </h2>
          
          <p className="text-white/70 text-base leading-relaxed mb-12">
            Welcome to the Tonus Club admin console. Oversee membership subscriptions, handle class scheduling, process payments, and track gym statistics effortlessly.
          </p>

          {/* Staggered Glass Cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Stat 1 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 hover:border-white/25">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">+12%</span>
              </div>
              <div className="text-2xl font-bold">1,482</div>
              <p className="text-xs text-white/50 mt-1">Active Members</p>
            </div>

            {/* Stat 2 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 hover:border-white/25">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-yellow-500/20 text-[#fced3c] rounded-lg">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-[#fced3c] bg-yellow-500/10 px-2 py-0.5 rounded-full">Busy</span>
              </div>
              <div className="text-2xl font-bold">142</div>
              <p className="text-xs text-white/50 mt-1">Classes Today</p>
            </div>

            {/* Stat 3 (Spans 2 columns) */}
            <div className="col-span-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 hover:border-white/25">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 text-cyan-300 rounded-lg">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Live System Operations</div>
                  <div className="text-xs text-white/50">All branches operating normally</div>
                </div>
              </div>
              <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                99.9% Up
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="relative z-10 text-xs text-white/40 flex items-center justify-between border-t border-white/10 pt-6">
          <span>Tonus Club Admin Dashboard</span>
          <span>Version 2.0</span>
        </div>

      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-slate-50/50">
        
        {/* Subtle grid background for right panel */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />

        <div className="w-full max-w-[440px] relative z-10">
          
          {/* Mobile-only header */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#fced3c] to-[#1ea43e] p-[2px] flex items-center justify-center shadow-lg shadow-emerald-500/10 mx-auto mb-4">
              <div className="w-full h-full bg-[#0b3916] rounded-2xl flex items-center justify-center text-white text-2xl font-black">
                T
              </div>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">TONUS CLUB</h2>
            <p className="text-sm text-gray-500 mt-1">Admin Portal Management</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-100/50 border border-slate-100 p-8 sm:p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome Back</h2>
              <p className="text-sm text-slate-400 mt-1.5">Please sign in to access your administrative workspace</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 px-4 py-3 bg-rose-50 border border-rose-100 text-rose-700 text-sm rounded-xl flex items-start gap-3 animate-shake">
                <ShieldAlert className="shrink-0 w-5 h-5 text-rose-500 mt-0.5" />
                <span className="font-medium leading-snug">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 outline-none focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 transition-all duration-200"
                    placeholder="admin@tonusclub.com"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Password</label>
                  <a href="#forgot" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-600 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 outline-none focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 transition-all duration-200"
                    placeholder="••••••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Option */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-600 focus:ring-offset-0 accent-emerald-600"
                  />
                  <span className="text-sm text-slate-500 font-medium">Keep me signed in</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white rounded-xl py-3 px-4 font-bold text-sm hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-md shadow-emerald-600/15 hover:shadow-lg hover:shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Checking Credentials...
                  </>
                ) : (
                  <>
                    Sign In to Portal
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="text-center mt-8 text-xs text-slate-400 font-medium">
            <span>© {new Date().getFullYear()} Tonus Club. Powered by Antigravity Core.</span>
          </div>

        </div>
      </div>
    </div>
  );
}
