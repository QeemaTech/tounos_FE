import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceCategoriesApi } from '../../api/endpoints';
import PageHeader from '../../components/layout/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import Dropdown from '../../components/ui/Dropdown';
import CreateCategoryModal from './CreateCategoryModal';
import EditCategoryModal from './EditCategoryModal';
import { 
  Plus, MoreHorizontal, Edit2, Trash2, 
  Folder, Activity, Layers 
} from 'lucide-react';
import { getCategoryIcon } from './categoryIcons';
import { toast } from 'react-hot-toast';

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['service-categories'],
    queryFn: () => serviceCategoriesApi.list().then(r => r.data),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }) => serviceCategoriesApi.update(id, { isActive: !isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
      toast.success('Category status updated');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update category');
    }
  });

  const categories = data?.data || [];

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen font-inter">
      <PageHeader 
        title="Service Categories" 
        subtitle="Organize your catalog into logical service segments" 
        breadcrumbs={[{ label: 'Categories' }]}
        actions={
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary !rounded-2xl flex items-center gap-2 shadow-lg shadow-brand-green/20"
          >
            <Plus className="w-5 h-5" /> New Category
          </button>
        }
      />

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
            <LoadingSpinner />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Loading Categories...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header !px-10">Category Identity</th>
                  <th className="table-header text-center">Linked Services</th>
                  <th className="table-header text-center">Status</th>
                  <th className="table-header text-right !px-10">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => {
                  const CategoryIcon = getCategoryIcon(c.icon);
                  return (
                    <tr key={c.id} className="table-row group">
                      <td className="table-cell !px-10">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-green/10 group-hover:text-brand-green transition-all shadow-inner border border-slate-100">
                            <CategoryIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-black text-slate-900 leading-tight">{c.name}</p>
                              {c.nameAr && (
                                <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg font-bold">
                                  {c.nameAr}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold truncate max-w-[200px] mt-0.5">{c.description || 'No description'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-black text-slate-900">{c._count?.services || 0}</span>
                          <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">Services Linked</span>
                        </div>
                      </td>
                      <td className="table-cell text-center">
                        <StatusBadge status={c.isActive ? 'ACTIVE' : 'ARCHIVED'} />
                      </td>
                      <td className="table-cell text-right !px-10">
                        <CategoryActions 
                          isActive={c.isActive}
                          onEdit={() => {
                            setSelectedCategory(c);
                            setIsEditModalOpen(true);
                          }} 
                          onToggleStatus={() => {
                            if (window.confirm(`Are you sure you want to ${c.isActive ? 'deactivate' : 'reactivate'} this category?`)) {
                              toggleStatusMutation.mutate({ id: c.id, isActive: c.isActive });
                            }
                          }} 
                        />
                      </td>
                    </tr>
                  );
                })}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-32 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-20">
                        <Layers className="w-16 h-16" />
                        <p className="font-black uppercase tracking-[0.2em] text-xs">No categories found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateCategoryModal 
        open={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />

      <EditCategoryModal 
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        category={selectedCategory}
      />
    </div>
  );
}

function CategoryActions({ onEdit, onToggleStatus, isActive }) {
  return (
    <Dropdown 
      trigger={
        <button className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      }
    >
      <button onClick={onEdit} className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-colors">
        <Edit2 className="w-4 h-4" /> Edit Category
      </button>
      <button onClick={onToggleStatus} className={`w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-orange-500 hover:bg-orange-50' : 'text-emerald-500 hover:bg-emerald-50'}`}>
        {isActive ? <Trash2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        {isActive ? 'Deactivate' : 'Reactivate'}
      </button>
    </Dropdown>
  );
}
