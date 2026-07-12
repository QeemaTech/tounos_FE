import { Dumbbell } from 'lucide-react';
import { privateTrainingApi } from '../../api/endpoints';
import SpecialtyServicePage from '../_shared/SpecialtyServicePage';

export default function PrivateTrainingPage() {
  return (
    <SpecialtyServicePage
      title="Private Training"
      subtitle="Manage private training offerings, trainers, and booked sessions"
      queryKey="private-training"
      api={privateTrainingApi}
      staffLabel="Trainer"
      icon={Dumbbell}
    />
  );
}
