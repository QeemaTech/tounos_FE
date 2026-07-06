import { promoCodesApi } from '../../api/endpoints';
import CrudListPage from '../CrudListPage';
import StatusBadge from '../../components/ui/StatusBadge';

const columns = [
  { key: 'code', label: 'Code', render: (r) => <span className="font-mono font-semibold text-brand-green">{r.code}</span> },
  { key: 'branch', label: 'Branch', render: (r) => <span className="font-medium text-gray-700">{r.branch?.name || 'global'}</span> },
  { key: 'discountType', label: 'Type', render: (r) => <span className="badge-blue">{r.discountType}</span> },
  { key: 'discountValue', label: 'Value', render: (r) => r.discountType === 'PERCENTAGE' ? `${r.discountValue}%` : `EGP ${r.discountValue}` },
  { key: 'usage', label: 'Usage', render: (r) => `${r.usesCount || 0} / ${r.maxUses || '∞'}` },
  { key: 'validity', label: 'Valid Until', render: (r) => r.validUntil ? new Date(r.validUntil).toLocaleDateString() : '—' },
  { key: 'isActive', label: 'Status', render: (r) => <StatusBadge status={r.isActive ? 'ACTIVE' : 'SUSPENDED'} /> },
];

const formFields = [
  { name: 'code', label: 'Promo Code', required: true },
  {
    name: 'discountType', label: 'Discount Type', type: 'select', required: true, options: [
      { value: 'PERCENTAGE', label: 'Percentage' },
      { value: 'FIXED_AMOUNT', label: 'Fixed Amount' },
    ]
  },
  { name: 'discountValue', label: 'Discount Value', type: 'number', required: true },
  { name: 'maxUses', label: 'Max Uses (empty = unlimited)', type: 'number' },
  { name: 'validFrom', label: 'Valid From', type: 'date', required: true },
  { name: 'validUntil', label: 'Valid Until', type: 'date', required: true },
];

export default function PromoCodesPage() {
  return (
    <CrudListPage
      title="Promo Codes"
      queryKey="promo-codes"
      apiList={promoCodesApi.list}
      apiGetById={promoCodesApi.getById}
      apiCreate={promoCodesApi.create}
      apiUpdate={promoCodesApi.update}
      apiDelete={promoCodesApi.remove}
      columns={columns}
      formFields={formFields}
      breadcrumbs={[{ label: 'Promo Codes' }]}
      searchPlaceholder="Search by code..."
    />
  );
}
