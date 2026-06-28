import StatusBadge from './StatusBadge';

const formatValue = (value, type) => {
  if (value === null || value === undefined || value === '') return <span className="text-gray-400">-</span>;
  if (type === 'status') return <StatusBadge status={value} />;
  if (type === 'date') return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  if (type === 'datetime') return new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  if (type === 'currency') return `${Number(value).toLocaleString()} SAR`;
  if (type === 'boolean') return value ? <span className="badge-green">Yes</span> : <span className="badge-red">No</span>;
  if (type === 'badge') return <span className="badge-blue">{value}</span>;
  if (type === 'percentage') return `${value}%`;
  if (type === 'number') return Number(value).toLocaleString();
  return String(value);
};

export default function DetailPanel({ sections }) {
  return (
    <div className="space-y-6">
      {sections.map((section, si) => (
        <div key={si}>
          {section.title && (
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100">
              {section.title}
            </h4>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {section.fields.map((field, fi) => (
              <div key={fi} className={field.fullWidth ? 'sm:col-span-2' : ''}>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{field.label}</dt>
                <dd className="mt-0.5 text-sm text-gray-900">{formatValue(field.value, field.type)}</dd>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export { formatValue };
