import { useState } from 'react';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useBranchScope } from '../hooks/useBranchScope';
import PageHeader from '../components/layout/PageHeader';
import DataTable from '../components/tables/DataTable';
import SearchBar from '../components/tables/SearchBar';
import Modal from '../components/ui/Modal';
import CrudForm from '../components/forms/CrudForm';
import DetailPanel from '../components/ui/DetailPanel';
import ConfirmDialog from '../components/ui/ConfirmDialog';

export default function CrudListPage({
  title,
  queryKey,
  apiList,
  apiGetById,
  apiCreate,
  apiUpdate,
  apiDelete,
  columns,
  formFields,
  breadcrumbs = [],
  searchPlaceholder,
  detailSections,
  detailRoute,
  extraFilters,
  transformInitialData,
}) {
  const { isSuperAdmin, defaultBranchId, branches, isBranchLocked } = useBranchScope();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(defaultBranchId ? { branchId: defaultBranchId } : {});

  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: [queryKey, { page, search, ...filters }],
    queryFn: () => apiList({ page, pageSize: 20, search, ...filters }).then((r) => r.data),
    keepPreviousData: true,
  });

  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: [queryKey, 'detail', viewItem?.id],
    queryFn: () => apiGetById ? apiGetById(viewItem.id).then((r) => r.data.data) : Promise.resolve(viewItem),
    enabled: !!viewItem && detailOpen,
  });

  const createMut = useMutation({
    mutationFn: (d) => apiCreate(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [queryKey] }); setModalOpen(false); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, d }) => apiUpdate(id, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [queryKey] }); setModalOpen(false); setEditItem(null); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => apiDelete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [queryKey] }); setDeleteOpen(false); setDeleteId(null); },
  });

  const handleSubmit = (formData) => {
    if (editItem) {
      updateMut.mutate({ id: editItem.id, d: formData });
    } else {
      const payload = defaultBranchId ? { branchId: defaultBranchId, ...formData } : formData;
      createMut.mutate(payload);
    }
  };

  const handleView = (row) => {
    if (detailRoute) {
      navigate(detailRoute(row));
    } else {
      setViewItem(row);
      setDetailOpen(true);
    }
  };

  const handleEdit = (row) => {
    setEditItem(transformInitialData ? transformInitialData(row) : row);
    setModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const allColumns = [
    ...columns,
    {
      key: '_actions',
      label: '',
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => handleView(row)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-indigo-600" title="View Details">
            <Eye className="w-4 h-4" />
          </button>
          {apiUpdate && formFields && (
            <button onClick={() => handleEdit(row)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-amber-600" title="Edit">
              <Pencil className="w-4 h-4" />
            </button>
          )}
          {apiDelete && (
            <button onClick={() => handleDeleteClick(row.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600" title="Delete">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={title}
        breadcrumbs={breadcrumbs}
        actions={
          apiCreate && formFields && (
            <button onClick={() => { setEditItem(null); setModalOpen(true); }} className="btn-primary">
              <Plus className="w-4 h-4" /> Add New
            </button>
          )
        }
      />

      <div className="card">
        <div className="p-4 border-b border-gray-200 flex flex-wrap items-center gap-3">
          <SearchBar onSearch={setSearch} placeholder={searchPlaceholder || `Search ${title.toLowerCase()}...`} />
          
          {isSuperAdmin && (
            <select 
              value={filters.branchId || ''} 
              onChange={e => setFilters({ ...filters, branchId: e.target.value || undefined, page: 1 })}
              className="input h-10 w-48 text-xs font-bold"
            >
              <option value="">All Branches</option>
              {branches?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          )}

          {extraFilters && extraFilters(filters, setFilters)}
        </div>
        <DataTable
          columns={allColumns}
          data={data?.data || []}
          meta={data?.meta}
          loading={isLoading}
          onPageChange={setPage}
          onRowClick={handleView}
        />
      </div>

      {/* Create / Edit Modal */}
      {formFields && (
        <Modal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setEditItem(null); }}
          title={editItem ? `Edit` : `Add New`}
          size="lg"
        >
          <CrudForm
            fields={formFields}
            initialData={editItem}
            onSubmit={handleSubmit}
            loading={createMut.isPending || updateMut.isPending}
          />
        </Modal>
      )}

      {/* Detail Modal */}
      <Modal open={detailOpen} onClose={() => { setDetailOpen(false); setViewItem(null); }} title="Details" size="xl">
        {detailLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
          </div>
        ) : detailData && detailSections ? (
          <DetailPanel sections={detailSections(detailData)} />
        ) : detailData ? (
          <DetailPanel sections={[{ fields: autoDetailFields(detailData) }]} />
        ) : null}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          {apiUpdate && formFields && viewItem && (
            <button onClick={() => { setDetailOpen(false); handleEdit(detailData || viewItem); }} className="btn-secondary">
              <Pencil className="w-4 h-4" /> Edit
            </button>
          )}
          <button onClick={() => { setDetailOpen(false); setViewItem(null); }} className="btn-secondary">Close</button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleteId(null); }}
        onConfirm={() => deleteMut.mutate(deleteId)}
        title="Delete Confirmation"
        message="Are you sure you want to delete this item? This action cannot be undone."
        loading={deleteMut.isPending}
      />
    </div>
  );
}

function autoDetailFields(data) {
  const labelMap = {
    id: null,
    password: null,
    refreshToken: null,
    resetToken: null,
    resetTokenExpiry: null,
    qrCode: null,
    deletedAt: null,
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone',
    status: 'Status',
    membershipNo: 'Membership No.',
    branchId: null,
    categoryId: null,
    serviceId: null,
    packageId: null,
    memberId: null,
    subscriptionId: null,
    trainerId: null,
    therapistId: null,
    scheduleId: null,
    roleId: null,
    createdAt: 'Created',
    updatedAt: 'Last Updated',
    isActive: 'Active',
    name: 'Name',
    nameAr: 'Name (Arabic)',
    description: 'Description',
    address: 'Address',
    city: 'City',
    gender: 'Gender',
    dateOfBirth: 'Date of Birth',
    startDate: 'Start Date',
    endDate: 'End Date',
    bookingDate: 'Booking Date',
    startTime: 'Start Time',
    endTime: 'End Time',
    bookingType: 'Booking Type',
    capacity: 'Capacity',
    duration: 'Duration (min)',
    price: 'Price (SAR)',
    amount: 'Amount (SAR)',
    method: 'Method',
    paidAt: 'Paid At',
    title: 'Title',
    body: 'Content',
    subject: 'Subject',
    priority: 'Priority',
    notes: 'Notes',
    bio: 'Bio',
    speciality: 'Speciality',
    level: 'Level',
    weight: 'Weight (kg)',
    bodyFatPercentage: 'Body Fat %',
    muscleMass: 'Muscle Mass (kg)',
    bmi: 'BMI',
    bmr: 'BMR',
    score: 'Score',
    discount: 'Discount %',
    code: 'Code',
    dayOfWeek: 'Day',
    openingTime: 'Opening Time',
    closingTime: 'Closing Time',
    groupClassRemaining: 'Group Classes Remaining',
    privateTrainingRemaining: 'Private Training Remaining',
    massageRemaining: 'Massage Sessions Remaining',
    durationDays: 'Duration (days)',
    groupClassQuota: 'Group Class Quota',
    privateTrainingQuota: 'Private Training Quota',
    massageQuota: 'Massage Quota',
    emergencyName: 'Emergency Contact Name',
    emergencyPhone: 'Emergency Contact Phone',
    sessionDeducted: 'Session Deducted',
    cancelReason: 'Cancel Reason',
    cancelledAt: 'Cancelled At',
    activatedAt: 'Activated At',
    checkInTime: 'Check-in Time',
    reportDate: 'Report Date',
    transactionRef: 'Transaction Ref',
  };

  const dateFields = ['createdAt', 'updatedAt', 'startDate', 'endDate', 'bookingDate', 'paidAt', 'cancelledAt', 'activatedAt', 'checkInTime', 'reportDate', 'dateOfBirth', 'closedAt'];
  const statusFields = ['status'];
  const boolFields = ['isActive', 'sessionDeducted', 'isRead'];

  const fields = [];

  for (const [key, value] of Object.entries(data)) {
    if (labelMap[key] === null) continue;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // nested object → show name or displayName
      if (value.name) fields.push({ label: labelMap[key] || humanize(key), value: value.name });
      else if (value.firstName) fields.push({ label: labelMap[key] || humanize(key), value: `${value.firstName} ${value.lastName}` });
      else if (value.displayName) fields.push({ label: labelMap[key] || humanize(key), value: value.displayName });
      continue;
    }
    if (Array.isArray(value)) continue;

    const label = labelMap[key] || humanize(key);
    let type = undefined;
    if (dateFields.includes(key)) type = 'datetime';
    else if (statusFields.includes(key)) type = 'status';
    else if (boolFields.includes(key)) type = 'boolean';
    else if (key === 'amount' || key === 'price') type = 'currency';
    else if (key === 'bookingType' || key === 'serviceType' || key === 'type') type = 'badge';

    fields.push({ label, value, type });
  }

  // Show nested objects more clearly
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      if (key === 'branch') fields.push({ label: 'Branch', value: value.name });
      if (key === 'member') fields.push({ label: 'Member', value: `${value.firstName} ${value.lastName}` });
      if (key === 'trainer') fields.push({ label: 'Trainer', value: `${value.firstName} ${value.lastName}` });
      if (key === 'therapist') fields.push({ label: 'Therapist', value: `${value.firstName} ${value.lastName}` });
      if (key === 'service') fields.push({ label: 'Service', value: value.name });
      if (key === 'category') fields.push({ label: 'Category', value: value.name });
      if (key === 'package') fields.push({ label: 'Package', value: value.name });
      if (key === 'role') fields.push({ label: 'Role', value: value.displayName || value.name });
      if (key === 'schedule') fields.push({ label: 'Schedule', value: value.dayOfWeek ? `${value.dayOfWeek} ${value.startTime}-${value.endTime}` : null });
    }
  }

  return fields;
}

function humanize(str) {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .replace(/_/g, ' ')
    .trim();
}
