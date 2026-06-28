import { privateTrainingApi } from '../../api/endpoints';
import CrudListPage from '../CrudListPage';
import StatusBadge from '../../components/ui/StatusBadge';

const columns = [
  { key: 'member', label: 'Member', render: (r) => r.member ? `${r.member.firstName} ${r.member.lastName}` : '-' },
  { key: 'trainer', label: 'Trainer', render: (r) => r.trainer ? `${r.trainer.firstName} ${r.trainer.lastName}` : '-' },
  { key: 'service', label: 'Service', render: (r) => r.service?.name || '-' },
  { key: 'branch', label: 'Branch', render: (r) => r.branch?.name || '-' },
  { key: 'sessionDate', label: 'Date', render: (r) => new Date(r.sessionDate || r.bookingDate || r.createdAt).toLocaleDateString() },
  { key: 'startTime', label: 'Time', render: (r) => r.startTime ? `${r.startTime} - ${r.endTime}` : '-' },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
];

const formFields = [
  { name: 'memberId', label: 'Member ID', required: true },
  { name: 'trainerId', label: 'Trainer ID', required: true },
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
    title: 'Trainer',
    fields: [
      { label: 'Name', value: d.trainer ? `${d.trainer.firstName} ${d.trainer.lastName}` : null },
      { label: 'Speciality', value: d.trainer?.speciality },
    ],
  },
  ...(d.notes ? [{ title: 'Notes', fields: [{ label: 'Notes', value: d.notes, fullWidth: true }] }] : []),
];

export default function PrivateTrainingPage() {
  return (
    <CrudListPage
      title="Private Training"
      queryKey="private-training"
      apiList={privateTrainingApi.list}
      apiGetById={privateTrainingApi.getById}
      apiCreate={privateTrainingApi.create}
      apiUpdate={privateTrainingApi.update}
      apiDelete={privateTrainingApi.remove}
      columns={columns}
      formFields={formFields}
      detailSections={detailSections}
      breadcrumbs={[{ label: 'Private Training' }]}
    />
  );
}
