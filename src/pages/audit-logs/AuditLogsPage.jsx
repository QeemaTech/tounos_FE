import { auditLogsApi } from '../../api/endpoints';
import CrudListPage from '../CrudListPage';

const columns = [
  { key: 'admin', label: 'Admin', render: (r) => r.admin ? `${r.admin.firstName} ${r.admin.lastName}` : 'System' },
  { key: 'action', label: 'Action', render: (r) => <span className="badge-blue">{r.action}</span> },
  { key: 'module', label: 'Module' },
  { key: 'description', label: 'Description' },
  { key: 'ipAddress', label: 'IP Address' },
  { key: 'createdAt', label: 'Date', render: (r) => new Date(r.createdAt).toLocaleString() },
];

const detailSections = (d) => [
  {
    title: 'Activity Details',
    fields: [
      { label: 'Action', value: d.action, type: 'badge' },
      { label: 'Module', value: d.module },
      { label: 'Description', value: d.description, fullWidth: true },
      { label: 'Date', value: d.createdAt, type: 'datetime' },
    ],
  },
  {
    title: 'Admin',
    fields: [
      { label: 'Name', value: d.admin ? `${d.admin.firstName} ${d.admin.lastName}` : 'System' },
      { label: 'Email', value: d.admin?.email },
    ],
  },
  {
    title: 'Technical Info',
    fields: [
      { label: 'IP Address', value: d.ipAddress },
      { label: 'User Agent', value: d.userAgent, fullWidth: true },
    ],
  },
  ...(d.oldData || d.newData ? [{
    title: 'Changes',
    fields: [
      ...(d.oldData ? [{ label: 'Previous Data', value: typeof d.oldData === 'object' ? JSON.stringify(d.oldData, null, 2) : d.oldData, fullWidth: true }] : []),
      ...(d.newData ? [{ label: 'New Data', value: typeof d.newData === 'object' ? JSON.stringify(d.newData, null, 2) : d.newData, fullWidth: true }] : []),
    ],
  }] : []),
];

export default function AuditLogsPage() {
  return (
    <CrudListPage
      title="Audit Logs"
      queryKey="audit-logs"
      apiList={auditLogsApi.list}
      apiGetById={auditLogsApi.getById}
      columns={columns}
      detailSections={detailSections}
      breadcrumbs={[{ label: 'Audit Logs' }]}
      extraFilters={(filters, setFilters) => (
        <select className="input w-40" value={filters.action || ''} onChange={(e) => setFilters({ ...filters, action: e.target.value || undefined })}>
          <option value="">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="LOGIN">Login</option>
          <option value="LOGOUT">Logout</option>
        </select>
      )}
    />
  );
}
