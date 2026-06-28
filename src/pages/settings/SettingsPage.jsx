import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Save, Shield, Bell, Globe, Database, 
  Settings, Info, Mail, Coins, Percent, 
  Lock, BellRing, Terminal, CheckCircle2, ShieldCheck, Clock
} from 'lucide-react';
import { settingsApi } from '../../api/endpoints';
import PageHeader from '../../components/layout/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

export default function SettingsPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({});

  // 1. Fetch Settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get().then(r => r.data.data || []),
  });

  // 2. Initialize Form Data
  useEffect(() => {
    if (settings) {
      const initialData = {};
      settings.forEach(s => {
        initialData[s.key] = s.value;
      });
      setFormData(initialData);
    }
  }, [settings]);

  // 3. Update Mutation
  const updateMut = useMutation({
    mutationFn: (data) => {
        const payload = Object.keys(data).map(key => {
            const original = settings?.find(s => s.key === key) || {};
            return {
                key,
                value: String(data[key]),
                group: original.group || getGroupForKey(key),
                label: original.label || getLabelForKey(key),
                type: original.type || 'string'
            };
        });
        return settingsApi.bulkUpdate(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings updated successfully', {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
          style: { borderRadius: '16px', background: '#fff', color: '#1e293b', fontWeight: 'bold' }
      });
    },
    onError: () => {
        toast.error('Failed to update settings');
    }
  });

  const getGroupForKey = (key) => {
      if (['club_name', 'support_email', 'currency', 'tax_rate'].includes(key)) return 'general';
      if (['two_factor_auth', 'session_timeout'].includes(key)) return 'security';
      return 'general';
  };

  const getLabelForKey = (key) => {
      return key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) return <div className="py-32 flex justify-center"><LoadingSpinner /></div>;

  const tabs = [
    { id: 'general', label: 'General', icon: Globe, color: 'emerald' },
    { id: 'security', label: 'Security', icon: Shield, color: 'blue' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'amber' },
    { id: 'system', label: 'System', icon: Database, color: 'rose' },
  ];

  return (
    <div className="max-w-5xl animate-in fade-in duration-500 pb-20">
      <PageHeader
        title="Settings"
        subtitle="Manage your club's global configuration and policies"
        breadcrumbs={[{ label: 'Configuration' }, { label: 'Settings' }]}
        action={
          <button 
            className="h-11 bg-brand-green hover:bg-emerald-600 text-white px-8 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            onClick={() => updateMut.mutate(formData)}
            disabled={updateMut.isPending}
          >
            {updateMut.isPending ? <LoadingSpinner size="xs" /> : <Save className="w-3.5 h-3.5" />}
            Save Changes
          </button>
        }
      />

      <div className="flex flex-col md:flex-row gap-8 mt-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-green text-white shadow-xl shadow-emerald-500/20 translate-x-2'
                  : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100 hover:border-slate-200'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-8 md:p-10">
            {activeTab === 'general' && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Info className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Club Information</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Core identity and branding settings</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <Settings className="w-3 h-3" /> Club Name
                    </label>
                    <input 
                        type="text" 
                        value={formData.club_name || ''} 
                        onChange={e => handleChange('club_name', e.target.value)}
                        className="w-full h-12 bg-slate-50 border-none rounded-2xl px-6 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-green/20 outline-none transition-all" 
                        placeholder="e.g. Tonus Club"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <Mail className="w-3 h-3" /> Support Email
                    </label>
                    <input 
                        type="email" 
                        value={formData.support_email || ''} 
                        onChange={e => handleChange('support_email', e.target.value)}
                        className="w-full h-12 bg-slate-50 border-none rounded-2xl px-6 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-green/20 outline-none transition-all" 
                        placeholder="support@tonus.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <Coins className="w-3 h-3" /> Currency
                    </label>
                    <select 
                        value={formData.currency || 'EGP'} 
                        onChange={e => handleChange('currency', e.target.value)}
                        className="w-full h-12 bg-slate-50 border-none rounded-2xl px-6 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-green/20 outline-none transition-all appearance-none cursor-pointer"
                    >
                      <option value="EGP">EGP - Egyptian Pound</option>
                      <option value="SAR">SAR - Saudi Riyal</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="AED">AED - UAE Dirham</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <Percent className="w-3 h-3" /> Default Tax Rate (%)
                    </label>
                    <input 
                        type="number" 
                        value={formData.tax_rate || 0} 
                        onChange={e => handleChange('tax_rate', e.target.value)}
                        className="w-full h-12 bg-slate-50 border-none rounded-2xl px-6 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-green/20 outline-none transition-all" 
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Lock className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Security Policy</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Access control and system protection</p>
                    </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 transition-all group">
                    <div className="flex gap-4">
                        <div className="p-3 bg-white rounded-2xl text-blue-500 shadow-sm group-hover:scale-110 transition-transform">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-700 uppercase tracking-tight">Two-Factor Authentication</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Require 2FA for all administrative accounts</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={formData.two_factor_auth === 'true'} 
                            onChange={e => handleChange('two_factor_auth', e.target.checked ? 'true' : 'false')}
                            className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-green"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 transition-all group">
                    <div className="flex gap-4">
                        <div className="p-3 bg-white rounded-2xl text-blue-500 shadow-sm group-hover:scale-110 transition-transform">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-700 uppercase tracking-tight">Session Auto-Timeout</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Automatically logout inactive users after 30 mins</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={formData.session_timeout === 'true'} 
                            onChange={e => handleChange('session_timeout', e.target.checked ? 'true' : 'false')}
                            className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-green"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in duration-300">
                <div className="w-20 h-20 rounded-[40px] bg-amber-50 flex items-center justify-center text-amber-500 mb-6">
                    <BellRing className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">Notification Engine</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 max-w-sm text-center leading-loose">
                    Advanced configuration for SMS gateways, Email providers, and automated member reminders is coming soon.
                </p>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in duration-300">
                <div className="w-20 h-20 rounded-[40px] bg-rose-50 flex items-center justify-center text-rose-500 mb-6">
                    <Terminal className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">System Architecture</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2 max-w-sm text-center leading-loose">
                    Direct access to system logs, API keys management, and environment variables. Restricted to SuperAdmins.
                </p>
              </div>
            )}
          </div>

          <div className="p-6 bg-brand-green/5 rounded-3xl border border-brand-green/10 flex items-start gap-4">
              <ShieldCheck className="w-5 h-5 text-brand-green mt-0.5" />
              <div>
                  <p className="text-[11px] font-black text-brand-green uppercase tracking-widest">Note on Global Settings</p>
                  <p className="text-[10px] font-medium text-emerald-800/60 mt-1">Changes made here will affect all branches and administrative users across the entire organization. Please verify all entries before saving.</p>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
