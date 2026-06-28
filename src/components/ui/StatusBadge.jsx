export default function StatusBadge({ status }) {
  if (!status) return null;

  const s = status.toUpperCase();
  const map = {
    ACTIVE:     'badge-green',
    CONFIRMED:  'badge-green',
    PAID:       'badge-green',
    COMPLETED:  'badge-gray',
    CLOSED:     'badge-gray',
    PENDING:    'badge-yellow',
    WAITLISTED: 'badge-yellow',
    IN_PROGRESS:'badge-blue',
    CANCELLED:  'badge-red',
    SUSPENDED:  'badge-red',
    FAILED:     'badge-red',
    OPEN:       'badge-blue',
    RESOLVED:   'badge-green',
    LOW:        'badge-gray',
    MEDIUM:     'badge-yellow',
    HIGH:       'badge-red',
    URGENT:     'badge-red',
  };

  return <span className={map[s] || 'badge-gray'}>{status}</span>;
}
