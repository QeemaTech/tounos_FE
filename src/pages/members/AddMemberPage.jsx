import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Check, ArrowLeft, Lock } from 'lucide-react';
import { membersApi, branchesApi } from '../../api/endpoints';
import { useAuth } from '../../hooks/useAuth';
import PageHeader from '../../components/layout/PageHeader';
import { toast } from 'react-hot-toast';

export default function AddMemberPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { defaultBranchId, isSuperAdmin } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      gender: 'MALE',
      dateOfBirth: '',
      branchId: defaultBranchId || '',
      status: 'ACTIVE'
    }
  });

  const { data: branches } = useQuery({
    queryKey: ['branches-list'],
    queryFn: () => branchesApi.list().then(r => r.data.data || []),
  });

  const mutation = useMutation({
    mutationFn: (data) => membersApi.create(data),
    onSuccess: (res) => {
      toast.success('Member created successfully');
      queryClient.invalidateQueries(['members']);
      navigate(`/members/${res.data.data.id}`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create member');
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-8 lg:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => navigate('/members')} 
              className="group w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-brand-green hover:bg-brand-green/5 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-brand-green transition-colors" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Onboard New Member</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Initialize Club Membership Record</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Personal Info */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-10 space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-green/10 flex items-center justify-center text-brand-green shadow-sm">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">Personal Identity</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Legal name and contact details</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">First Name</label>
                  <input 
                    {...register('firstName', { required: true })}
                    className="w-full h-14 bg-slate-50 border-2 border-transparent rounded-2xl px-5 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-brand-green/30 transition-all placeholder:text-slate-300"
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Last Name</label>
                  <input 
                    {...register('lastName', { required: true })}
                    className="w-full h-14 bg-slate-50 border-2 border-transparent rounded-2xl px-5 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-brand-green/30 transition-all placeholder:text-slate-300"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-green transition-colors" />
                  <input 
                    type="email"
                    {...register('email', { required: true })}
                    className="w-full h-14 bg-slate-50 border-2 border-transparent rounded-2xl pl-14 pr-5 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-brand-green/30 transition-all placeholder:text-slate-300"
                    placeholder="member@example.com"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Account Password</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-green transition-colors" />
                  <input 
                    type="password"
                    {...register('password')}
                    className="w-full h-14 bg-slate-50 border-2 border-transparent rounded-2xl pl-14 pr-5 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-brand-green/30 transition-all placeholder:text-slate-300"
                    placeholder="Enter secure password"
                  />
                </div>
                <p className="text-[10px] font-bold text-slate-400 leading-relaxed ml-2 border-l-2 border-brand-green/30 pl-2">
                  <span className="text-brand-green">Security Hint:</span> Leave blank to auto-generate <code className="bg-slate-100 text-slate-500 px-1 py-0.5 rounded">changeme123</code>. The member can change this later from their mobile app.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-green transition-colors" />
                  <input 
                    {...register('phone', { required: true })}
                    className="w-full h-14 bg-slate-50 border-2 border-transparent rounded-2xl pl-14 pr-5 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-brand-green/30 transition-all placeholder:text-slate-300"
                    placeholder="01xxxxxxxxx"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Assignment & Submission */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-10 space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-sm">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight">Assignment</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Club branch and profile tags</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Branch Location</label>
                <div className={`relative group ${defaultBranchId ? 'opacity-60' : ''}`}>
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                  <select 
                    {...register('branchId', { required: true })}
                    disabled={!!defaultBranchId}
                    className="w-full h-14 bg-slate-50 border-2 border-transparent rounded-2xl pl-14 pr-12 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500/30 transition-all appearance-none cursor-pointer disabled:cursor-not-allowed"
                  >
                    <option value="">Select Target Branch</option>
                    {branches?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Gender</label>
                  <div className="relative group">
                    <select 
                      {...register('gender', { required: true })}
                      className="w-full h-14 bg-slate-50 border-2 border-transparent rounded-2xl px-5 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500/30 transition-all appearance-none cursor-pointer"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Birth Date</label>
                  <input 
                    type="date"
                    {...register('dateOfBirth')}
                    className="w-full h-14 bg-slate-50 border-2 border-transparent rounded-2xl px-5 text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-indigo-500/30 transition-all"
                  />
                </div>
              </div>

              <div className="pt-6">
                 <button 
                   type="submit" 
                   disabled={mutation.isPending}
                   className="group relative w-full h-16 bg-brand-green text-white rounded-[24px] text-[12px] font-black uppercase tracking-[0.25em] shadow-[0_20px_40px_rgb(30,164,62,0.25)] hover:shadow-[0_20px_50px_rgb(30,164,62,0.35)] hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                 >
                   {mutation.isPending ? (
                     <div className="flex items-center gap-3">
                       <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                       <span>Processing...</span>
                     </div>
                   ) : (
                     <>
                       Complete Onboarding 
                       <Check className="w-5 h-5 group-hover:scale-125 transition-transform" />
                     </>
                   )}
                 </button>
                 <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-6">
                    By clicking complete, you agree to initialize a new member record
                 </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function ChevronDown(props) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}
