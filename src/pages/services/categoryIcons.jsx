import { 
  Dumbbell, Waves, Bike, Footprints, Trophy, Activity, Apple, Timer, Heart, Flame, Shield, Scale, Folder, Sparkles, Award
} from 'lucide-react';

export function getCategoryIcon(iconName) {
  switch (iconName) {
    case 'dumbbell':
    case 'dumbbell-heavy':
    case 'kettlebell':
      return Dumbbell;
    case 'swimming':
      return Waves;
    case 'bicycle':
      return Bike;
    case 'run':
    case 'sneaker':
      return Footprints;
    case 'yoga':
      return Sparkles;
    case 'boxing':
    case 'shield':
      return Shield;
    case 'soccer':
    case 'tennis':
    case 'basketball':
    case 'volleyball':
    case 'gymnastics':
      return Award;
    case 'activity':
      return Activity;
    case 'massage':
      return Heart;
    case 'timer':
      return Timer;
    case 'apple':
      return Apple;
    case 'scale':
      return Scale;
    case 'trophy':
      return Trophy;
    case 'flame':
      return Flame;
    default:
      return Folder;
  }
}
