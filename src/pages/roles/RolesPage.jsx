import { rolesApi } from '../../api/endpoints';
import CrudListPage from '../CrudListPage';

const columns = [
  { key: 'name', label: 'Role Key' },
  { key: 'displayName', label: 'Display Name' },
  { key: 'description', label: 'Description' },
  { key: 'permissions', label: 'Permissions', render: (r) => <span className="text-sm text-gray-500">{r.permissions?.length || 0} permissions</span> },
  { key: 'createdAt', label: 'Created', render: (r) => new Date(r.createdAt).toLocaleDateString() },
];

const formFields = [
  { name: 'name', label: 'Role Key', required: true, placeholder: 'e.g. branch_admin' },
  { name: 'displayName', label: 'Display Name', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
];

const detailSections = (d) => [
  {
    title: 'Role Information',
    fields: [
      { label: 'Key', value: d.name },
      { label: 'Display Name', value: d.displayName },
      { label: 'Description', value: d.description, fullWidth: true },
      { label: 'Created', value: d.createdAt, type: 'datetime' },
    ],
  },
  ...(d.permissions?.length ? [{
    title: `Permissions (${d.permissions.length})`,
    fields: d.permissions.map((p) => ({
      label: p.module || 'General',
      value: p.action || p.name,
    })),
  }] : []),
];

export default function RolesPage() {
  return (
    <CrudListPage
      title="Roles & Permissions"
      queryKey="roles"
      apiList={rolesApi.list}
      apiGetById={rolesApi.getById}
      apiCreate={rolesApi.create}
      apiUpdate={rolesApi.update}
      apiDelete={rolesApi.remove}
      columns={columns}
      formFields={formFields}
      detailSections={detailSections}
      breadcrumbs={[{ label: 'Roles & Permissions' }]}
    />
  );
}
