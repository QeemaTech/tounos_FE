import { Heart } from 'lucide-react';
import { massageApi } from '../../api/endpoints';
import SpecialtyServicePage from '../_shared/SpecialtyServicePage';

export default function MassagePage() {
  return (
    <SpecialtyServicePage
      title="Massage"
      subtitle="Manage massage offerings, therapists capacity (1:1), and booked sessions"
      queryKey="massage"
      api={massageApi}
      staffLabel="Therapist"
      icon={Heart}
    />
  );
}
