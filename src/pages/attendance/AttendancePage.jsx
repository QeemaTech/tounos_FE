import { attendanceApi } from '../../api/endpoints';
import CrudListPage from '../CrudListPage';
import StatusBadge from '../../components/ui/StatusBadge';

const columns = [
  { key: 'member', label: 'Member', render: (r) => r.member ? `${r.member.firstName} ${r.member.lastName}` : '-' },
  { key: 'membershipNo', label: 'Membership #', render: (r) => r.member?.membershipNo || '-' },
  { key: 'checkInTime', label: 'Check-in', render: (r) => new Date(r.checkInTime).toLocaleString() },
  { key: 'method', label: 'Method', render: (r) => <span className="badge-blue">{r.method}</span> },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  { key: 'branch', label: 'Branch', render: (r) => r.branch?.name || '-' },
];

const formFields = [
  { name: 'memberId', label: 'Member ID', required: true },
  { name: 'bookingId', label: 'Booking ID' },
  { name: 'checkInTime', label: 'Check-in Time', type: 'datetime-local' },
  { name: 'method', label: 'Method', type: 'select', options: [
    { value: 'QR_CODE', label: 'QR Code' }, { value: 'MANUAL', label: 'Manual' },
  ] },
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'CHECKED_IN', label: 'Checked In' }, { value: 'NO_SHOW', label: 'No Show' },
  ] },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

const detailSections = (d) => [
  {
    title: 'Check-in Information',
    fields: [
      { label: 'Check-in Time', value: d.checkInTime, type: 'datetime' },
      { label: 'Method', value: d.method, type: 'badge' },
      { label: 'Status', value: d.status, type: 'status' },
      { label: 'Session Deducted', value: d.sessionDeducted, type: 'boolean' },
    ],
  },
  {
    title: 'Member',
    fields: [
      { label: 'Name', value: d.member ? `${d.member.firstName} ${d.member.lastName}` : null },
      { label: 'Membership No.', value: d.member?.membershipNo },
    ],
  },
  ...(d.booking ? [{
    title: 'Linked Booking',
    fields: [
      { label: 'Type', value: d.booking.bookingType?.replace(/_/g, ' '), type: 'badge' },
      { label: 'Date', value: d.booking.bookingDate, type: 'date' },
      { label: 'Service', value: d.booking.service?.name },
    ],
  }] : []),
  ...(d.notes ? [{ title: 'Notes', fields: [{ label: 'Notes', value: d.notes, fullWidth: true }] }] : []),
];

export default function AttendancePage() {
  return (
    <CrudListPage
      title="Attendance"
      queryKey="attendance"
      apiList={attendanceApi.list}
      apiGetById={attendanceApi.getById}
      apiCreate={attendanceApi.create}
      apiUpdate={attendanceApi.update}
      columns={columns}
      formFields={formFields}
      detailSections={detailSections}
      breadcrumbs={[{ label: 'Attendance' }]}
      extraFilters={(filters, setFilters) => (
        <select className="input w-40" value={filters.method || ''} onChange={(e) => setFilters({ ...filters, method: e.target.value || undefined })}>
          <option value="">All Methods</option>
          <option value="QR_CODE">QR Code</option>
          <option value="MANUAL">Manual</option>
        </select>
      )}
    />
  );
}
