import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../../api/endpoints';
import Modal from '../../components/ui/Modal';
import { toast } from 'react-hot-toast';
import { 
  Package, DollarSign, Tag, Image as ImageIcon, 
  Upload, X, Percent, MapPin
} from 'lucide-react';
import { useBranchScope } from '../../hooks/useBranchScope';

export default function ProductFormModal({ open, onClose, product }) {
  const queryClient = useQueryClient();
  const isEdit = !!product;
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Branch-scoped: branch admins see only their branch, super admins see all
  const { branches, isSuperAdmin, defaultBranchId } = useBranchScope({ enabled: open });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    values: product ? {
      name: product.name,
      nameAr: product.nameAr || '',
      description: product.description || '',
      price: product.price,
      discountType: product.discountType || '',
      discountValue: product.discountValue || 0,
      isUpsell: product.isUpsell,
      isActive: product.isActive,
      branchStocks: product.branches?.map(b => ({ branchId: b.branchId, stock: b.stock })) || []
    } : {
      name: '',
      nameAr: '',
      description: '',
      price: '',
      discountType: '',
      discountValue: 0,
      isUpsell: false,
      isActive: true,
      branchStocks: []
    }
  });

  useEffect(() => {
    if (product?.imageUrl) {
      setPreview(`http://localhost:5000${product.imageUrl}`);
    } else {
      setPreview(null);
    }
    setSelectedFile(null);
  }, [product, open]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const mutation = useMutation({
    mutationFn: (data) => {
      const formData = new FormData();

      // For branch admins creating new products, auto-scope to their branch only.
      // This prevents sending empty branchStocks from other branches.
      let finalData = { ...data };
      if (!isEdit && !isSuperAdmin && defaultBranchId) {
        // Scope branchStocks to only this admin's branch
        const stock = (data.branchStocks || []).find(s => s.branchId === defaultBranchId);
        finalData.branchStocks = [{ branchId: defaultBranchId, stock: stock?.stock || 0 }];
      }

      Object.keys(finalData).forEach(key => {
        const value = finalData[key];
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value) || (typeof value === 'object' && !(value instanceof File))) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }
        }
      });

      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      return isEdit ? productsApi.update(product.id, formData) : productsApi.create(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(isEdit ? 'Inventory record updated' : 'Product added to inventory');
      onClose();
    },
    onError: (err) => {
      console.error('Submission error:', err);
      const message = err.response?.data?.message || err.message || 'Operation failed';
      toast.error(message);
    }
  });

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Modify Product' : 'Add to Inventory'} size="xl">
      <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="p-8 space-y-8 font-inter overflow-y-auto max-h-[80vh]">
        
        {/* Image Upload Section */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <ImageIcon className="w-3.5 h-3.5" /> Product Visual
          </label>
          <div className="relative group">
            <div className={`
              w-full h-48 rounded-[32px] border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all overflow-hidden
              ${preview ? 'border-brand-green/30 bg-white' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'}
            `}>
              {preview ? (
                <>
                  <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                  <button 
                    type="button" 
                    onClick={() => { setPreview(null); setSelectedFile(null); }}
                    className="absolute top-4 right-4 p-2 bg-white rounded-xl shadow-lg text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-black text-slate-600">Upload High-Res Product Image</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tighter">PNG, JPG up to 5MB</p>
                  </div>
                </>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Package className="w-3.5 h-3.5" /> Product Name (EN)
            </label>
            <input 
              {...register('name', { required: 'Required' })}
              className={`w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/20 outline-none ${errors.name ? 'ring-2 ring-red-100' : ''}`}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
               Product Name (AR)
            </label>
            <input 
              {...register('nameAr')}
              dir="rtl"
              className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/20 outline-none"
            />
          </div>
        </div>

        {/* Pricing & Discounts */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5" /> Base Price
            </label>
            <input 
              type="number" step="0.01"
              {...register('price', { required: true })}
              className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/20 outline-none"
            />
          </div>
          <div className="col-span-6 lg:col-span-4 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Percent className="w-3.5 h-3.5" /> Discount Type
            </label>
            <select 
              {...register('discountType')}
              className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/20 outline-none appearance-none"
            >
              <option value="">No Discount</option>
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED_AMOUNT">Fixed Amount (EGP)</option>
            </select>
          </div>
          <div className="col-span-6 lg:col-span-4 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Tag className="w-3.5 h-3.5" /> Discount Value
            </label>
            <input 
              type="number" step="0.01"
              {...register('discountValue')}
              className="w-full h-14 bg-slate-50 border-none rounded-2xl px-5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/20 outline-none"
            />
          </div>
        </div>

        {/* Upsell & Status */}
        <div className="grid grid-cols-2 gap-6">
          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <div>
              <p className="text-sm font-black text-slate-800">Upsell Strategy</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Show in checkout flows</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" {...register('isUpsell')} className="sr-only peer" />
              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand-green"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <div>
              <p className="text-sm font-black text-slate-800">Inventory Status</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visible to members</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" {...register('isActive')} className="sr-only peer" />
              <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Branch Stocks */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" /> Stock Allocation
            {!isSuperAdmin && defaultBranchId && (
              <span className="ml-auto px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                Your Branch Only
              </span>
            )}
          </label>
          <div className={`grid grid-cols-1 gap-4 ${isSuperAdmin ? 'md:grid-cols-2 lg:grid-cols-3' : ''}`}>
            {branches?.map(b => (
              <div key={b.id} className="p-4 bg-white border border-slate-100 rounded-[24px] flex items-center justify-between group hover:shadow-lg transition-all">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{b.name}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <input 
                      type="number"
                      placeholder="0"
                      className="w-20 h-10 bg-slate-50 border-none rounded-xl px-3 text-xs font-black text-slate-800 focus:ring-2 focus:ring-brand-green/20 outline-none"
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        const currentStocks = watch('branchStocks') || [];
                        const idx = currentStocks.findIndex(s => s.branchId === b.id);
                        if (idx >= 0) {
                          currentStocks[idx].stock = val;
                        } else {
                          currentStocks.push({ branchId: b.id, stock: val });
                        }
                        setValue('branchStocks', [...currentStocks]);
                      }}
                      defaultValue={product?.branches?.find(bs => bs.branchId === b.id)?.stock || 0}
                    />
                    <span className="text-[10px] font-bold text-slate-400">Units</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 flex items-center gap-4 border-t border-slate-100">
          <button 
            type="button" 
            onClick={onClose} 
            className="flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={mutation.isPending}
            className="flex-[2] h-14 bg-brand-green text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-green/20 hover:bg-brand-green-dark hover:-translate-y-0.5 transition-all"
          >
            {mutation.isPending ? 'Syncing...' : isEdit ? 'Commit Changes' : 'Add to Inventory'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
