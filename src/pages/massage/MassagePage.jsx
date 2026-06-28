import { massageApi } from '../../api/endpoints';
import CrudListPage from '../CrudListPage';
import StatusBadge from '../../components/ui/StatusBadge';

const columns = [
  { key: 'member', label: 'Member', render: (r) => r.member ? `${r.member.firstName} ${r.member.lastName}` : '-' },
  { key: 'therapist', label: 'Therapist', render: (r) => r.therapist ? `${r.therapist.firstName} ${r.therapist.lastName}` : '-' },
  { key: 'service', label: 'Service', render: (r) => r.service?.name || '-' },
  { key: 'branch', label: 'Branch', render: (r) => r.branch?.name || '-' },
  { key: 'sessionDate', label: 'Date', render: (r) => new Date(r.sessionDate || r.bookingDate || r.createdAt).toLocaleDateString() },
  { key: 'startTime', label: 'Time', render: (r) => r.startTime ? `${r.startTime} - ${r.endTime}` : '-' },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
];

const formFields = [
  { name: 'memberId', label: 'Member ID', required: true },
  { name: 'therapistId', label: 'Therapist ID', required: true },
  { name: 'serviceId', label: 'Service ID' },
  { name: 'branchId', label: 'Branch ID' },
  { name: 'sessionDate', label: 'Session Date', type: 'date', required: true },
  { name: 'startTime', label: 'Start Time', required: true, placeholder: '09:00' },
  { name: 'endTime', label: 'End Time', required: true, placeholder: '10:00' },
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'PENDING', label: 'Pending' }, { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'COMPLETED', label: 'Completed' }, { value: 'CANCELLED', label: 'Cancelled' },
  ] },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

const detailSections = (d) => [
  {
    title: 'Session Details',
    fields: [
      { label: 'Status', value: d.status, type: 'status' },
      { label: 'Date', value: d.sessionDate || d.bookingDate, type: 'date' },
      { label: 'Time', value: d.startTime ? `${d.startTime} - ${d.endTime}` : null },
      { label: 'Service', value: d.service?.name },
      { label: 'Branch', value: d.branch?.name },
    ],
  },
  {
    title: 'Member',
    fields: [
      { label: 'Name', value: d.member ? `${d.member.firstName} ${d.member.lastName}` : null },
      { label: 'Email', value: d.member?.email },
    ],
  },
  {
    title: 'Therapist',
    fields: [
      { label: 'Name', value: d.therapist ? `${d.therapist.firstName} ${d.therapist.lastName}` : null },
      { label: 'Speciality', value: d.therapist?.speciality },
    ],
  },
  ...(d.notes ? [{ title: 'Notes', fields: [{ label: 'Notes', value: d.notes, fullWidth: true }] }] : []),
];

export default function MassagePage() {
  return (
    <CrudListPage
      title="Massage Sessions"
      queryKey="massage"
      apiList={massageApi.list}
      apiGetById={massageApi.getById}
      apiCreate={massageApi.create}
      apiUpdate={massageApi.update}
      apiDelete={massageApi.remove}
      columns={columns}
      formFields={formFields}
      detailSections={detailSections}
      breadcrumbs={[{ label: 'Massage Sessions' }]}
    />
  );
}
