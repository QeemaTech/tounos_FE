import { schedulesApi } from '../../api/endpoints';
import CrudListPage from '../CrudListPage';
import StatusBadge from '../../components/ui/StatusBadge';

const columns = [
  { key: 'class', label: 'Class', render: (r) => r.groupClass?.name || '-' },
  { key: 'dayOfWeek', label: 'Day' },
  { key: 'startTime', label: 'Start Time' },
  { key: 'endTime', label: 'End Time' },
  { key: 'capacity', label: 'Capacity' },
  { key: 'branch', label: 'Branch', render: (r) => r.groupClass?.branch?.name || '-' },
  { key: 'isActive', label: 'Status', render: (r) => <StatusBadge status={r.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
];

const formFields = [
  { name: 'groupClassId', label: 'Group Class ID', required: true },
  { name: 'dayOfWeek', label: 'Day of Week', type: 'select', required: true, options: [
    { value: 'SUNDAY', label: 'Sunday' }, { value: 'MONDAY', label: 'Monday' },
    { value: 'TUESDAY', label: 'Tuesday' }, { value: 'WEDNESDAY', label: 'Wednesday' },
    { value: 'THURSDAY', label: 'Thursday' }, { value: 'FRIDAY', label: 'Friday' },
    { value: 'SATURDAY', label: 'Saturday' },
  ] },
  { name: 'startTime', label: 'Start Time', required: true, placeholder: '09:00' },
  { name: 'endTime', label: 'End Time', required: true, placeholder: '10:00' },
  { name: 'capacity', label: 'Capacity', type: 'number' },
  { name: 'isActive', label: 'Active', type: 'select', options: [
    { value: true, label: 'Active' }, { value: false, label: 'Inactive' },
  ] },
];

const detailSections = (d) => [
  {
    title: 'Schedule Details',
    fields: [
      { label: 'Class', value: d.groupClass?.name },
      { label: 'Day', value: d.dayOfWeek },
      { label: 'Start Time', value: d.startTime },
      { label: 'End Time', value: d.endTime },
      { label: 'Capacity', value: d.capacity, type: 'number' },
      { label: 'Active', value: d.isActive, type: 'boolean' },
    ],
  },
  ...(d.groupClass ? [{
    title: 'Class Info',
    fields: [
      { label: 'Branch', value: d.groupClass.branch?.name },
      { label: 'Trainer', value: d.groupClass.trainer ? `${d.groupClass.trainer.firstName} ${d.groupClass.trainer.lastName}` : null },
      { label: 'Level', value: d.groupClass.level, type: 'badge' },
    ],
  }] : []),
];

export default function SchedulesPage() {
  return (
    <CrudListPage
      title="Class Schedules"
      queryKey="schedules"
      apiList={schedulesApi.list}
      apiGetById={schedulesApi.getById}
      apiCreate={schedulesApi.create}
      apiUpdate={schedulesApi.update}
      apiDelete={schedulesApi.remove}
      columns={columns}
      formFields={formFields}
      detailSections={detailSections}
      breadcrumbs={[{ label: 'Class Schedules' }]}
      extraFilters={(filters, setFilters) => (
        <select className="input w-40" value={filters.dayOfWeek || ''} onChange={(e) => setFilters({ ...filters, dayOfWeek: e.target.value || undefined })}>
          <option value="">All Days</option>
          <option value="SUNDAY">Sunday</option>
          <option value="MONDAY">Monday</option>
          <option value="TUESDAY">Tuesday</option>
          <option value="WEDNESDAY">Wednesday</option>
          <option value="THURSDAY">Thursday</option>
          <option value="FRIDAY">Friday</option>
          <option value="SATURDAY">Saturday</option>
        </select>
      )}
    />
  );
}
