import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import PageHeader from '../../components/layout/PageHeader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import StatusBadge from '../../components/ui/StatusBadge';
import Dropdown from '../../components/ui/Dropdown';
import Modal from '../../components/ui/Modal';
import { serviceCategoriesApi, branchesApi } from '../../api/endpoints';
import {
  Plus, MoreHorizontal, Edit2, Trash2, Search,
  Clock, DollarSign, Ban, LayoutList, ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

/**
 * Shared admin UI for Massage / Private Training offerings + sessions.
 */
export default function SpecialtyServicePage({
  title,
  subtitle,
  queryKey,
  api,
  staffLabel,
  icon: Icon = LayoutList,
}) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('offerings');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sessionPage, setSessionPage] = useState(1);
  const [sessionStatus, setSessionStatus] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const pageSize = 20;

  const { data, isLoading } = useQuery({
    queryKey: [queryKey, 'offerings', { search, page }],
    queryFn: () =>
      api.list({ search: search || undefined, page, pageSize }).then((r) => r.data),
    enabled: tab === 'offerings',
  });

  const { data: sessionsData, isLoading: sessionsLoading } = useQuery({
    queryKey: [queryKey, 'sessions', { sessionPage, sessionStatus }],
    queryFn: () =>
      api
        .listSessions({
          page: sessionPage,
          pageSize,
          status: sessionStatus || undefined,
        })
        .then((r) => r.data),
    enabled: tab === 'sessions',
  });

  const { data: categories } = useQuery({
    queryKey: ['service-categories-list'],
    queryFn: () => serviceCategoriesApi.list().then((r) => r.data.data),
  });

  const { data: branches } = useQuery({
    queryKey: ['branches-all'],
    queryFn: () => branchesApi.list().then((r) => r.data.data || r.data),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      nameAr: '',
      categoryId: '',
      description: '',
      price: 0,
      duration: 60,
      isActive: true,
      branchIds: [],
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [queryKey] });
  };

  const saveMutation = useMutation({
    mutationFn: (form) => {
      const payload = {
        name: form.name,
        nameAr: form.nameAr || '',
        categoryId: form.categoryId,
        description: form.description || '',
        price: parseFloat(form.price) || 0,
        duration: parseInt(form.duration, 10) || 60,
        isActive: form.isActive === true || form.isActive === 'true',
        branchIds: Array.isArray(form.branchIds) ? form.branchIds : [],
      };
      return editing ? api.update(editing.id, payload) : api.create(payload);
    },
    onSuccess: () => {
      toast.success(editing ? 'Offering updated' : 'Offering created');
      invalidate();
      setModalOpen(false);
      setEditing(null);
      reset();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Save failed'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => api.update(id, { isActive: !isActive }),
    onSuccess: () => {
      toast.success('Status updated');
      invalidate();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.remove(id),
    onSuccess: () => {
      toast.success('Offering deactivated');
      invalidate();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Delete failed'),
  });

  const cancelSessionMutation = useMutation({
    mutationFn: (id) => api.cancelSession(id, 'Cancelled by admin'),
    onSuccess: () => {
      toast.success('Session cancelled');
      invalidate();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Cancel failed'),
  });

  const openCreate = () => {
    setEditing(null);
    reset({
      name: '',
      nameAr: '',
      categoryId: '',
      description: '',
      price: 0,
      duration: 60,
      isActive: true,
      branchIds: [],
    });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    reset({
      name: item.name || '',
      nameAr: item.nameAr || '',
      categoryId: item.categoryId || item.category?.id || '',
      description: item.description || '',
      price: item.price ?? 0,
      duration: item.duration ?? 60,
      isActive: item.isActive !== false,
      branchIds: (item.branches || []).map((b) => b.branchId || b.branch?.id).filter(Boolean),
    });
    setModalOpen(true);
  };

  const offerings = data?.data || [];
  const sessions = sessionsData?.data || [];
  const offeringsMeta = data?.meta || {};
  const sessionsMeta = sessionsData?.meta || {};
  const offeringsTotalPages = Math.max(1, Math.ceil((offeringsMeta.total || 0) / pageSize));
  const sessionsTotalPages = Math.max(1, Math.ceil((sessionsMeta.total || 0) / pageSize));

  const Pagination = ({ page: current, totalPages, onChange }) => (
    <div className="flex items-center justify-between px-8 py-4 border-t border-slate-100">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        Page {current} / {totalPages}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={current <= 1}
          onClick={() => onChange(current - 1)}
          className="p-2 rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          disabled={current >= totalPages}
          onClick={() => onChange(current + 1)}
          className="p-2 rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen font-inter">
      <PageHeader
        title={title}
        subtitle={subtitle}
        breadcrumbs={[{ label: title }]}
        actions={
          tab === 'offerings' ? (
            <button
              onClick={openCreate}
              className="btn-primary !rounded-2xl flex items-center gap-2 shadow-lg shadow-brand-green/20"
            >
              <Plus className="w-5 h-5" /> New Offering
            </button>
          ) : null
        }
      />

      <div className="flex gap-2">
        {['offerings', 'sessions'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
              tab === t
                ? 'bg-brand-green text-white shadow-lg shadow-brand-green/20'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'offerings' && (
        <>
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search offerings..."
              className="w-full h-12 pl-11 pr-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-green/20"
            />
          </div>

          <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
            {isLoading ? (
              <div className="py-32 flex justify-center"><LoadingSpinner /></div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="table-header !px-8">Offering</th>
                        <th className="table-header text-center">Duration</th>
                        <th className="table-header text-center">Price</th>
                        <th className="table-header text-center">Capacity</th>
                        <th className="table-header text-center">Status</th>
                        <th className="table-header text-right !px-8">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {offerings.map((item) => (
                        <tr key={item.id} className="table-row group">
                          <td className="table-cell !px-8">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-green/10 group-hover:text-brand-green">
                                <Icon className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-black text-slate-900">{item.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold truncate max-w-[240px]">
                                  {item.description || 'No description'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="table-cell text-center">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600">
                              <Clock className="w-3.5 h-3.5" /> {item.duration}m
                            </span>
                          </td>
                          <td className="table-cell text-center">
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600">
                              <DollarSign className="w-3.5 h-3.5" /> {item.price}
                            </span>
                          </td>
                          <td className="table-cell text-center text-xs font-bold text-slate-500">
                            {item.capacity ?? 1} ({staffLabel})
                          </td>
                          <td className="table-cell text-center">
                            <StatusBadge status={item.isActive ? 'ACTIVE' : 'INACTIVE'} />
                          </td>
                          <td className="table-cell text-right !px-8">
                            <Dropdown
                              trigger={<MoreHorizontal className="w-5 h-5 text-slate-400" />}
                              items={[
                                { label: 'Edit', icon: Edit2, onClick: () => openEdit(item) },
                                {
                                  label: item.isActive ? 'Deactivate' : 'Activate',
                                  icon: Ban,
                                  onClick: () => toggleMutation.mutate({ id: item.id, isActive: item.isActive }),
                                },
                                {
                                  label: 'Delete',
                                  icon: Trash2,
                                  danger: true,
                                  onClick: () => {
                                    if (
                                      confirm(
                                        `Deactivate "${item.name}"? Members will no longer see this offering.`
                                      )
                                    ) {
                                      deleteMutation.mutate(item.id);
                                    }
                                  },
                                },
                              ]}
                            />
                          </td>
                        </tr>
                      ))}
                      {!offerings.length && (
                        <tr>
                          <td colSpan={6} className="py-16 text-center text-sm text-slate-400 font-bold">
                            No offerings yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <Pagination page={page} totalPages={offeringsTotalPages} onChange={setPage} />
              </>
            )}
          </div>
        </>
      )}

      {tab === 'sessions' && (
        <>
          <div className="flex gap-3">
            <select
              value={sessionStatus}
              onChange={(e) => {
                setSessionStatus(e.target.value);
                setSessionPage(1);
              }}
              className="h-12 px-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700"
            >
              <option value="">All statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
            {sessionsLoading ? (
              <div className="py-32 flex justify-center"><LoadingSpinner /></div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="table-header !px-8">Member</th>
                        <th className="table-header">{staffLabel}</th>
                        <th className="table-header">Service</th>
                        <th className="table-header">Date / Time</th>
                        <th className="table-header text-center">Status</th>
                        <th className="table-header text-right !px-8">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((s) => {
                        const staff = s.therapist || s.trainer;
                        return (
                          <tr key={s.id} className="table-row">
                            <td className="table-cell !px-8 font-bold text-slate-800">
                              {s.member ? `${s.member.firstName} ${s.member.lastName}` : '—'}
                            </td>
                            <td className="table-cell text-sm text-slate-600">
                              {staff ? `${staff.firstName} ${staff.lastName}` : '—'}
                            </td>
                            <td className="table-cell text-sm text-slate-600">{s.service?.name || '—'}</td>
                            <td className="table-cell text-sm text-slate-600">
                              {new Date(s.bookingDate).toLocaleDateString()} · {s.startTime}-{s.endTime}
                            </td>
                            <td className="table-cell text-center">
                              <StatusBadge status={s.status} />
                            </td>
                            <td className="table-cell text-right !px-8">
                              {s.status !== 'CANCELLED' && s.status !== 'COMPLETED' && (
                                <button
                                  className="text-xs font-black uppercase tracking-widest text-red-500 hover:text-red-600"
                                  onClick={() => {
                                    if (confirm('Cancel this session? This cannot be undone from here.')) {
                                      cancelSessionMutation.mutate(s.id);
                                    }
                                  }}
                                >
                                  Cancel
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {!sessions.length && (
                        <tr>
                          <td colSpan={6} className="py-16 text-center text-sm text-slate-400 font-bold">
                            No sessions found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <Pagination page={sessionPage} totalPages={sessionsTotalPages} onChange={setSessionPage} />
              </>
            )}
          </div>
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        title={editing ? `Edit ${title}` : `New ${title} Offering`}
        size="lg"
      >
        <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="p-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Name</label>
              <input {...register('name', { required: true })} className="input mt-1" />
              {errors.name && <p className="text-xs text-red-500 mt-1">Required</p>}
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Name (AR)</label>
              <input {...register('nameAr')} className="input mt-1" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</label>
              <select {...register('categoryId', { required: true })} className="input mt-1">
                <option value="">Select category</option>
                {(categories || []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration (min)</label>
              <input type="number" {...register('duration')} className="input mt-1" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Price</label>
              <input type="number" step="0.01" {...register('price')} className="input mt-1" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</label>
              <select {...register('isActive')} className="input mt-1">
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
            <textarea {...register('description')} rows={3} className="input mt-1" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">
              Branches
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {(branches || []).map((b) => (
                <label key={b.id} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input type="checkbox" value={b.id} {...register('branchIds')} />
                  {b.name}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary !rounded-2xl" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary !rounded-2xl" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
