import { offersApi } from '../../api/endpoints';
import CrudListPage from '../CrudListPage';
import StatusBadge from '../../components/ui/StatusBadge';

const columns = [
  { key: 'title', label: 'Title' },
  { key: 'code', label: 'Code' },
  { key: 'discount', label: 'Discount', render: (r) => `${r.discount}%` },
  { key: 'startDate', label: 'Start', render: (r) => new Date(r.startDate).toLocaleDateString() },
  { key: 'endDate', label: 'End', render: (r) => new Date(r.endDate).toLocaleDateString() },
  { key: 'isActive', label: 'Status', render: (r) => <StatusBadge status={r.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
];

const formFields = [
  { name: 'title', label: 'Title', required: true },
  { name: 'titleAr', label: 'Title (Arabic)' },
  { name: 'code', label: 'Promo Code' },
  { name: 'discount', label: 'Discount %', type: 'number', required: true },
  { name: 'startDate', label: 'Start Date', type: 'date', required: true },
  { name: 'endDate', label: 'End Date', type: 'date', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'isActive', label: 'Active', type: 'select', options: [
    { value: true, label: 'Active' }, { value: false, label: 'Inactive' },
  ] },
];

const detailSections = (d) => [
  {
    title: 'Offer Details',
    fields: [
      { label: 'Title', value: d.title },
      { label: 'Title (Arabic)', value: d.titleAr },
      { label: 'Promo Code', value: d.code, type: 'badge' },
      { label: 'Discount', value: d.discount, type: 'percentage' },
      { label: 'Active', value: d.isActive, type: 'boolean' },
    ],
  },
  {
    title: 'Period',
    fields: [
      { label: 'Start Date', value: d.startDate, type: 'date' },
      { label: 'End Date', value: d.endDate, type: 'date' },
    ],
  },
  ...(d.description ? [{ title: 'Description', fields: [{ label: 'Description', value: d.description, fullWidth: true }] }] : []),
];

export default function OffersPage() {
  return (
    <CrudListPage
      title="Offers & Promotions"
      queryKey="offers"
      apiList={offersApi.list}
      apiGetById={offersApi.getById}
      apiCreate={offersApi.create}
      apiUpdate={offersApi.update}
      apiDelete={offersApi.remove}
      columns={columns}
      formFields={formFields}
      detailSections={detailSections}
      breadcrumbs={[{ label: 'Offers' }]}
    />
  );
}
