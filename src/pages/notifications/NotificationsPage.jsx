import { notificationsApi } from '../../api/endpoints';
import CrudListPage from '../CrudListPage';
import StatusBadge from '../../components/ui/StatusBadge';

const columns = [
  { key: 'title', label: 'Title' },
  { key: 'member', label: 'Recipient', render: (r) => r.member ? `${r.member.firstName} ${r.member.lastName}` : 'All' },
  { key: 'type', label: 'Type', render: (r) => <span className="badge-blue">{r.type?.replace(/_/g, ' ')}</span> },
  { key: 'isRead', label: 'Read', render: (r) => r.isRead ? <span className="text-green-600">Read</span> : <span className="text-gray-400">Unread</span> },
  { key: 'createdAt', label: 'Sent', render: (r) => new Date(r.createdAt).toLocaleString() },
];

const formFields = [
  { name: 'title', label: 'Title', required: true },
  { name: 'body', label: 'Message', type: 'textarea', required: true },
  { name: 'memberId', label: 'Member ID (leave empty for all)' },
  { name: 'type', label: 'Type', type: 'select', options: [
    { value: 'GENERAL', label: 'General' }, { value: 'BOOKING', label: 'Booking' },
    { value: 'PAYMENT', label: 'Payment' }, { value: 'PROMOTION', label: 'Promotion' },
    { value: 'REMINDER', label: 'Reminder' },
  ] },
];

const detailSections = (d) => [
  {
    title: 'Notification',
    fields: [
      { label: 'Title', value: d.title },
      { label: 'Type', value: d.type?.replace(/_/g, ' '), type: 'badge' },
      { label: 'Read', value: d.isRead, type: 'boolean' },
      { label: 'Sent', value: d.createdAt, type: 'datetime' },
    ],
  },
  {
    title: 'Content',
    fields: [
      { label: 'Message', value: d.body, fullWidth: true },
    ],
  },
  ...(d.member ? [{
    title: 'Recipient',
    fields: [
      { label: 'Name', value: `${d.member.firstName} ${d.member.lastName}` },
      { label: 'Email', value: d.member.email },
    ],
  }] : []),
];

export default function NotificationsPage() {
  return (
    <CrudListPage
      title="Notifications"
      queryKey="notifications"
      apiList={notificationsApi.list}
      apiGetById={notificationsApi.getById}
      apiCreate={notificationsApi.create}
      apiDelete={notificationsApi.remove}
      columns={columns}
      formFields={formFields}
      detailSections={detailSections}
      breadcrumbs={[{ label: 'Notifications' }]}
    />
  );
}
