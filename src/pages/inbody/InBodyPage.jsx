import { inbodyApi } from '../../api/endpoints';
import CrudListPage from '../CrudListPage';

const columns = [
  { key: 'member', label: 'Member', render: (r) => r.member ? `${r.member.firstName} ${r.member.lastName}` : '-' },
  { key: 'reportDate', label: 'Date', render: (r) => new Date(r.reportDate).toLocaleDateString() },
  { key: 'weight', label: 'Weight (kg)' },
  { key: 'bodyFatPercentage', label: 'Body Fat %' },
  { key: 'muscleMass', label: 'Muscle (kg)' },
  { key: 'bmi', label: 'BMI' },
  { key: 'score', label: 'Score' },
];

const formFields = [
  { name: 'memberId', label: 'Member ID', required: true },
  { name: 'reportDate', label: 'Report Date', type: 'date', required: true },
  { name: 'weight', label: 'Weight (kg)', type: 'number' },
  { name: 'bodyFatPercentage', label: 'Body Fat %', type: 'number' },
  { name: 'muscleMass', label: 'Muscle Mass (kg)', type: 'number' },
  { name: 'skeletalMuscleMass', label: 'Skeletal Muscle (kg)', type: 'number' },
  { name: 'bmi', label: 'BMI', type: 'number' },
  { name: 'bmr', label: 'BMR', type: 'number' },
  { name: 'bodyWater', label: 'Body Water', type: 'number' },
  { name: 'protein', label: 'Protein', type: 'number' },
  { name: 'minerals', label: 'Minerals', type: 'number' },
  { name: 'visceralFat', label: 'Visceral Fat', type: 'number' },
  { name: 'score', label: 'Score', type: 'number' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

const detailSections = (d) => [
  {
    title: 'Report Info',
    fields: [
      { label: 'Member', value: d.member ? `${d.member.firstName} ${d.member.lastName}` : null },
      { label: 'Date', value: d.reportDate, type: 'date' },
      { label: 'Score', value: d.score, type: 'number' },
    ],
  },
  {
    title: 'Body Composition',
    fields: [
      { label: 'Weight (kg)', value: d.weight, type: 'number' },
      { label: 'Body Fat %', value: d.bodyFatPercentage, type: 'percentage' },
      { label: 'Muscle Mass (kg)', value: d.muscleMass, type: 'number' },
      { label: 'Skeletal Muscle (kg)', value: d.skeletalMuscleMass, type: 'number' },
      { label: 'BMI', value: d.bmi, type: 'number' },
      { label: 'BMR', value: d.bmr, type: 'number' },
    ],
  },
  {
    title: 'Additional Metrics',
    fields: [
      { label: 'Body Water', value: d.bodyWater, type: 'number' },
      { label: 'Protein', value: d.protein, type: 'number' },
      { label: 'Minerals', value: d.minerals, type: 'number' },
      { label: 'Visceral Fat', value: d.visceralFat, type: 'number' },
    ],
  },
  ...(d.notes ? [{ title: 'Notes', fields: [{ label: 'Notes', value: d.notes, fullWidth: true }] }] : []),
];

export default function InbodyPage() {
  return (
    <CrudListPage
      title="InBody Reports"
      queryKey="inbody"
      apiList={inbodyApi.list}
      apiGetById={inbodyApi.getById}
      apiCreate={inbodyApi.create}
      apiUpdate={inbodyApi.update}
      apiDelete={inbodyApi.remove}
      columns={columns}
      formFields={formFields}
      detailSections={detailSections}
      breadcrumbs={[{ label: 'InBody Reports' }]}
    />
  );
}
