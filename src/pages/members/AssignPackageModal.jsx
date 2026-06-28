import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { 
  Package, Calendar, StickyNote, X, ChevronDown, 
  User, MapPin, ShoppingBag, Plus, Minus, CheckCircle2 
} from 'lucide-react';
import { packagesApi, ordersApi, membersApi, productsApi } from '../../api/endpoints';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useBranchScope } from '../../hooks/useBranchScope';
import { toast } from 'react-hot-toast';

export default function AssignPackageModal({ open, onClose, memberId, branchId: propBranchId, onSuccess }) {
  const queryClient = useQueryClient();
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedAddons, setSelectedAddons] = useState([]);

  // Branch scoping: get the admin's accessible branches
  const { branches, isBranchLocked, defaultBranchId } = useBranchScope({ enabled: open });

  // Effective branchId: prop > admin's single branch > empty (super admin chooses)
  const effectiveBranchId = propBranchId || defaultBranchId || '';

  // Single-branch admins OR prop passed → no selector needed
  const showBranchSelector = !propBranchId && !isBranchLocked;

  const { register, handleSubmit, reset, watch, setValue, formState: { isSubmitting, errors } } = useForm({
    defaultValues: {
      memberId: memberId || '',
      branchId: effectiveBranchId,
      packageId: '',
      startDate: new Date().toISOString().split('T')[0],
      notes: ''
    }
  });

  // Auto-set branchId into form whenever branches load for locked admins
  useEffect(() => {
    if (effectiveBranchId) {
      setValue('branchId', effectiveBranchId);
    }
  }, [effectiveBranchId, setValue]);

  const selectedMemberId = watch('memberId');
  const selectedBranchId = watch('branchId');
  const selectedPackageId = watch('packageId');

  // 1. Fetch Packages
  const { data: packagesData, isLoading: isLoadingPackages } = useQuery({
    queryKey: ['packages-list'],
    queryFn: () => packagesApi.list().then(r => r.data.data),
    enabled: open
  });

  // 2. Fetch Products (Add-ons) — scoped to selected branch
  const { data: productsData } = useQuery({
    queryKey: ['products-upsell', selectedBranchId],
    queryFn: () => productsApi.list({ isUpsell: true, branchId: selectedBranchId }).then(r => r.data.data),
    enabled: open
  });

  // 3. Fetch Members
  const { data: membersData } = useQuery({
    queryKey: ['members-search', memberSearch],
    queryFn: () => membersApi.list({ search: memberSearch, pageSize: 5 }).then(r => r.data.data),
    enabled: open && !memberId
  });

  const selectedPackage = useMemo(() => 
    packagesData?.find(p => p.id === selectedPackageId),
    [packagesData, selectedPackageId]
  );

  // --- Add-on Management ---
  const toggleAddon = (product) => {
    const exists = selectedAddons.find(a => a.productId === product.id);
    if (exists) {
      setSelectedAddons(prev => prev.filter(a => a.productId !== product.id));
    } else {
      setSelectedAddons(prev => [...prev, { 
        productId: product.id, 
        name: product.name, 
        price: product.pricing?.finalPrice || product.price, 
        quantity: 1 
      }]);
    }
  };

  const updateAddonQty = (productId, delta) => {
    setSelectedAddons(prev => prev.map(a => 
      a.productId === productId 
        ? { ...a, quantity: Math.max(1, a.quantity + delta) } 
        : a
    ));
  };

  const totals = useMemo(() => {
    const pkgPrice = parseFloat(selectedPackage?.price || 0);
    const addonsTotal = selectedAddons.reduce((sum, a) => sum + (a.price * a.quantity), 0);
    return { pkgPrice, addonsTotal, grandTotal: pkgPrice + addonsTotal };
  }, [selectedPackage, selectedAddons]);

  // --- Submission ---
  const mutation = useMutation({
    mutationFn: (data) => ordersApi.create({
      memberId: data.memberId,
      branchId: data.branchId,
      packageId: data.packageId,
      productItems: selectedAddons.map(a => ({ productId: a.productId, quantity: a.quantity })),
      notes: data.notes
    }),
    onSuccess: () => {
      toast.success('Bundle Order created successfully');
      reset();
      setSelectedAddons([]);
      onSuccess?.();
      queryClient.invalidateQueries(['orders']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to process bundle');
    }
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <Modal open={open} onClose={onClose} title="Bundle Checkout: Package + Add-ons" size="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 font-inter bg-slate-50/50">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1: Core Selection */}
          <div className="lg:col-span-1 space-y-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-[11px] font-black text-brand-green uppercase tracking-widest mb-4">Step 1: Enrollment</h3>
            
            {!memberId && (
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <User className="w-3 h-3" /> Find Member
                </label>
                <input 
                  type="text"
                  placeholder="Search name/phone..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-xs font-bold focus:ring-2 focus:ring-brand-green/20"
                />
                <div className="max-h-32 overflow-y-auto space-y-1 mt-2">
                  {membersData?.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setValue('memberId', m.id)}
                      className={`w-full text-left p-3 rounded-xl text-[11px] font-bold transition-all ${selectedMemberId === m.id ? 'bg-brand-green text-white shadow-md' : 'bg-white border border-slate-100 hover:bg-slate-50 text-slate-600'}`}
                    >
                      {m.firstName} {m.lastName}
                    </button>
                  ))}
                </div>
                <input type="hidden" {...register('memberId', { required: 'Member required' })} />
              </div>
            )}

            {/* Branch selector — 3 modes based on role */}
            {showBranchSelector ? (
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Branch
                </label>
                <select 
                  {...register('branchId', { required: 'Branch required' })}
                  className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-xs font-bold text-slate-800 appearance-none focus:ring-2 focus:ring-brand-green/20 outline-none"
                >
                  <option value="" disabled>Select branch...</option>
                  {branches?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            ) : (
              // Auto-selected branch — show as read-only badge
              effectiveBranchId && (
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Branch
                  </label>
                  <div className="h-11 bg-blue-50 border border-blue-100 rounded-xl px-4 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-xs font-black text-blue-700 uppercase tracking-tight">
                      {branches?.find(b => b.id === effectiveBranchId)?.name || 'Your Branch'}
                    </span>
                    <span className="ml-auto text-[9px] font-black text-blue-400 uppercase tracking-widest">Auto</span>
                  </div>
                  <input type="hidden" {...register('branchId')} />
                </div>
              )
            )}


            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Package className="w-3 h-3" /> Package
              </label>
              <select 
                {...register('packageId', { required: 'Package required' })}
                className="w-full h-11 bg-slate-50 border-none rounded-xl px-4 text-xs font-bold text-slate-800 appearance-none focus:ring-2 focus:ring-brand-green/20 outline-none"
              >
                <option value="" disabled>Select package...</option>
                {packagesData?.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>{pkg.name} (EGP {pkg.price})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Column 2: Add-ons Selector */}
          <div className="lg:col-span-1 space-y-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-[11px] font-black text-brand-green uppercase tracking-widest mb-4">Step 2: Add-ons</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {productsData?.map(product => {
                const isSelected = selectedAddons.find(a => a.productId === product.id);
                const branchStock = product.branches?.[0]?.stock || 0;
                const isOutOfStock = branchStock <= 0;

                return (
                  <div 
                    key={product.id}
                    onClick={() => !isOutOfStock && toggleAddon(product)}
                    className={`
                      group cursor-pointer p-3 rounded-2xl border transition-all 
                      ${isSelected ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100 hover:border-slate-300'}
                      ${isOutOfStock ? 'opacity-50 cursor-not-allowed grayscale' : ''}
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className={`text-[11px] font-black uppercase tracking-tight ${isSelected ? 'text-emerald-700' : 'text-slate-700'}`}>{product.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[10px] font-bold text-slate-400">EGP {product.pricing?.finalPrice || product.price}</p>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${branchStock < 5 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                            {branchStock} IN STOCK
                          </span>
                        </div>
                      </div>
                      {isSelected ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Plus className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />}
                    </div>
                    {isSelected && (
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-emerald-100" onClick={e => e.stopPropagation()}>
                        <button type="button" onClick={() => updateAddonQty(product.id, -1)} className="p-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-100 transition-colors"><Minus className="w-3 h-3" /></button>
                        <span className="text-[11px] font-black text-emerald-700">{isSelected.quantity}</span>
                        <button type="button" 
                          disabled={isSelected.quantity >= branchStock}
                          onClick={() => updateAddonQty(product.id, 1)} 
                          className="p-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {productsData?.length === 0 && <p className="text-center py-10 text-[10px] font-bold text-slate-400 uppercase">No products available</p>}
            </div>
          </div>

          {/* Column 3: Order Summary */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-6">
              <h3 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Order Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <Package className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-widest">{selectedPackage?.name || 'No Package Selected'}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Main Membership</p>
                    </div>
                  </div>
                  <span className="text-sm font-black">EGP {totals.pkgPrice.toLocaleString()}</span>
                </div>

                <div className="space-y-2 border-t border-slate-800 pt-4">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Selected Add-ons</p>
                  {selectedAddons.map(a => (
                    <div key={a.productId} className="flex justify-between items-center group">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 flex items-center justify-center bg-slate-800 rounded text-[9px] font-black text-emerald-400">{a.quantity}x</span>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tight truncate max-w-[100px]">{a.name}</span>
                      </div>
                      <span className="text-[11px] font-black">EGP {(a.price * a.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  {selectedAddons.length === 0 && <p className="text-[10px] text-slate-600 font-bold italic">No add-ons added</p>}
                </div>

                <div className="border-t border-emerald-500/30 pt-4 mt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">Total to Pay</span>
                    <span className="text-2xl font-black text-emerald-500">EGP {totals.grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || !selectedPackageId || !selectedMemberId}
                className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20"
              >
                {isSubmitting ? <LoadingSpinner size="sm" color="text-slate-900" /> : <>Confirm & Process Pay <CheckCircle2 className="w-4 h-4" /></>}
              </button>
            </div>

            <button 
              type="button" 
              onClick={onClose}
              className="w-full h-12 bg-white border border-slate-200 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors"
            >
              Cancel Transaction
            </button>
          </div>

        </div>
      </form>
    </Modal>
  );
}
