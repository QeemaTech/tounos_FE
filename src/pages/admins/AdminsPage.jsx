import { useQuery } from '@tanstack/react-query';
import { adminsApi, rolesApi } from '../../api/endpoints';
import CrudListPage from '../CrudListPage';
import StatusBadge from '../../components/ui/StatusBadge';
import { useBranchScope } from '../../hooks/useBranchScope';
import { Navigate } from 'react-router-dom';

const columns = [
  { key: 'name', label: 'Name', render: (r) => `${r.firstName} ${r.lastName}` },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role', render: (r) => <span className="badge-blue">{r.role?.displayName || r.role?.name || '-'}</span> },
  { key: 'branches', label: 'Branches', render: (r) => (
    <div className="flex flex-wrap gap-1">
      {r.branches?.length > 0 ? r.branches.map(b => (
        <span key={b.branch.id} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium">
          {b.branch.name}
        </span>
      )) : <span className="text-gray-400 italic text-[10px]">All Branches</span>}
    </div>
  )},
  { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
];

const getFormFields = (branches = [], roles = []) => [
  { name: 'firstName', label: 'First Name', required: true },
  { name: 'lastName', label: 'Last Name', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'password', label: 'Password', type: 'password', placeholder: 'Leave blank to keep current' },
  { 
    name: 'roleId', 
    label: 'Role', 
    type: 'select', 
    required: true,
    options: roles.map(r => ({ value: r.id, label: r.displayName || r.name }))
  },
  {
    name: 'branchIds',
    label: 'Assigned Branches (Optional for Super Admin)',
    type: 'multi-select',
    options: branches.map(b => ({ value: b.id, label: b.name }))
  },
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'ACTIVE', label: 'Active' }, { value: 'SUSPENDED', label: 'Suspended' },
  ] },
];

const detailSections = (d) => [
  {
    title: 'Admin Information',
    fields: [
      { label: 'Full Name', value: `${d.firstName} ${d.lastName}` },
      { label: 'Email', value: d.email },
      { label: 'Status', value: d.status, type: 'status' },
      { label: 'Role', value: d.role?.displayName || d.role?.name },
      { 
        label: 'Branches', 
        value: d.branches?.length > 0 ? d.branches.map(b => b.branch.name).join(', ') : 'All Branches' 
      },
      { label: 'Last Login', value: d.lastLoginAt, type: 'datetime' },
      { label: 'Created', value: d.createdAt, type: 'datetime' },
    ],
  },
];

export default function AdminsPage() {
  const { branches, isBranchLocked, isSuperAdmin, defaultBranchId } = useBranchScope();

  const { data: roles } = useQuery({
    queryKey: ['roles', 'all'],
    queryFn: () => rolesApi.list({ pageSize: 100 }).then(r => r.data.data)
  });

  // Transform backend data for the form (especially the branches -> branchIds mapping)
  const transformInitialData = (data) => {
    if (!data) return null;
    return {
      ...data,
      branchIds: data.branches?.map(b => b.branchId) || []
    };
  };

  return (
    <CrudListPage
      title="Admin Users"
      queryKey="admins"
      // Branch admins only see admins from their branch via query params
      apiList={(params) => adminsApi.list({ ...params, branchId: isBranchLocked ? defaultBranchId : params?.branchId })}
      apiGetById={adminsApi.getById}
      // Only super admins can create/edit/delete admin users
      apiCreate={isSuperAdmin ? adminsApi.create : undefined}
      apiUpdate={isSuperAdmin ? adminsApi.update : undefined}
      apiDelete={isSuperAdmin ? adminsApi.remove : undefined}
      columns={columns}
      formFields={getFormFields(branches || [], roles || [])}
      detailSections={detailSections}
      breadcrumbs={[{ label: 'Admin Users' }]}
      transformInitialData={transformInitialData}
    />
  );
}
