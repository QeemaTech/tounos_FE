import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../../api/endpoints';
import PageHeader from '../../components/layout/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import Dropdown from '../../components/ui/Dropdown';
import ProductFormModal from './ProductFormModal';
import { 
  Plus, MoreHorizontal, Edit2, Trash2, 
  Search, Package, DollarSign, Tag, 
  ShoppingCart, Zap, ShieldAlert, BarChart3,
  Activity
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['products', { search }],
    queryFn: () => productsApi.list({ search: search || undefined }).then(r => r.data),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }) => productsApi.update(id, { isActive: !isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Inventory status updated');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => productsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product removed from inventory');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  });

  const products = data?.data || [];

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen font-inter">
      <PageHeader 
        title="Inventory & Products" 
        subtitle="Manage club merchandise, supplements, and checkout upsells" 
        breadcrumbs={[{ label: 'Inventory' }]}
        actions={
          <button 
            onClick={() => { setSelectedProduct(null); setIsModalOpen(true); }}
            className="btn-primary !rounded-2xl flex items-center gap-2 shadow-lg shadow-brand-green/20"
          >
            <Plus className="w-5 h-5" /> Add Product
          </button>
        }
      />

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-green transition-colors" />
          <input 
            type="text"
            placeholder="Search products by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-14 pl-12 pr-5 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/20 outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
            <LoadingSpinner />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Syncing Inventory...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header !px-10">Product Detail</th>
                  <th className="table-header text-center">Unit Price</th>
                  <th className="table-header text-center">Total Stock</th>
                  <th className="table-header text-center">Checkout Strategy</th>
                  <th className="table-header text-center">Status</th>
                  <th className="table-header text-right !px-10">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const totalStock = p.branches?.reduce((acc, b) => acc + (b.stock || 0), 0) || 0;
                  return (
                    <tr key={p.id} className="table-row group">
                      <td className="table-cell !px-10">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-brand-green/10 group-hover:text-brand-green transition-all shadow-inner border border-slate-100 overflow-hidden">
                            {p.imageUrl ? (
                              <img src={`http://localhost:5000${p.imageUrl}`} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <Package className="w-6 h-6" />
                            )}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 leading-tight">{p.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-tighter">{p.nameAr || 'No Arabic Name'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-black text-slate-900">EGP {Number(p.pricing.finalPrice).toLocaleString()}</span>
                          {p.pricing.saving > 0 && (
                            <span className="text-[8px] font-black text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-lg uppercase">
                              Save EGP {p.pricing.saving}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="table-cell text-center">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black ${totalStock < 10 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'}`}>
                          <BarChart3 className="w-3.5 h-3.5" /> {totalStock} Units
                        </div>
                      </td>
                      <td className="table-cell text-center">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${p.isUpsell ? 'bg-brand-green/5 text-brand-green border border-brand-green/20' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                          <Zap className={`w-3.5 h-3.5 ${p.isUpsell ? 'fill-brand-green' : ''}`} />
                          {p.isUpsell ? 'Upsell Active' : 'Standard'}
                        </div>
                      </td>
                      <td className="table-cell text-center">
                        <StatusBadge status={p.isActive ? 'ACTIVE' : 'ARCHIVED'} />
                      </td>
                      <td className="table-cell text-right !px-10">
                        <Dropdown 
                          trigger={
                            <button className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 border border-transparent hover:border-slate-200">
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                          }
                        >
                          <button onClick={() => { setSelectedProduct(p); setIsModalOpen(true); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors">
                            <Edit2 className="w-4 h-4" /> Edit Details
                          </button>
                          <button onClick={() => toggleStatusMutation.mutate({ id: p.id, isActive: p.isActive })} className={`w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest transition-colors ${p.isActive ? 'text-orange-500 hover:bg-orange-50' : 'text-emerald-500 hover:bg-emerald-50'}`}>
                            <Activity className="w-4 h-4" /> {p.isActive ? 'Archive' : 'Restore'}
                          </button>
                          <button onClick={() => { if(window.confirm('Wipe product from inventory?')) deleteMutation.mutate(p.id); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 className="w-4 h-4" /> Delete Record
                          </button>
                        </Dropdown>
                      </td>
                    </tr>
                  );
                })}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-32 text-center text-slate-400 opacity-20">
                      <ShieldAlert className="w-16 h-16 mx-auto mb-4" />
                      <p className="font-black uppercase tracking-widest text-xs">Inventory is empty</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ProductFormModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        product={selectedProduct}
      />
    </div>
  );
}
