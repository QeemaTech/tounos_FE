import { serviceCategoriesApi } from '../../api/endpoints';
import CrudListPage from '../CrudListPage';
import StatusBadge from '../../components/ui/StatusBadge';

const columns = [
  { key: 'name', label: 'Category Name' },
  { key: 'nameAr', label: 'Name (Arabic)' },
  { key: 'isActive', label: 'Status', render: (r) => <StatusBadge status={r.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
  { key: 'createdAt', label: 'Created', render: (r) => new Date(r.createdAt).toLocaleDateString() },
];

const formFields = [
  { name: 'name', label: 'Category Name', required: true },
  { name: 'nameAr', label: 'Name (Arabic)' },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'isActive', label: 'Active', type: 'select', options: [
    { value: true, label: 'Active' }, { value: false, label: 'Inactive' },
  ] },
];

const detailSections = (d) => [
  {
    title: 'Category Information',
    fields: [
      { label: 'Name', value: d.name },
      { label: 'Name (Arabic)', value: d.nameAr },
      { label: 'Active', value: d.isActive, type: 'boolean' },
      { label: 'Description', value: d.description, fullWidth: true },
    ],
  },
];

export default function ServiceCategoriesPage() {
  return (
    <CrudListPage
      title="Service Categories"
      queryKey="service-categories"
      apiList={serviceCategoriesApi.list}
      apiGetById={serviceCategoriesApi.getById}
      apiCreate={serviceCategoriesApi.create}
      apiUpdate={serviceCategoriesApi.update}
      apiDelete={serviceCategoriesApi.remove}
      columns={columns}
      formFields={formFields}
      detailSections={detailSections}
      breadcrumbs={[{ label: 'Services', to: '/services' }, { label: 'Categories' }]}
    />
  );
}
