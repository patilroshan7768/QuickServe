import { Bug, Droplets, Paintbrush, Sparkles, Wrench, Zap } from 'lucide-react';

export const CATEGORIES = [
  { name: 'Cleaning', icon: Sparkles },
  { name: 'Plumbing', icon: Droplets },
  { name: 'Electrical', icon: Zap },
  { name: 'Appliance Repair', icon: Wrench },
  { name: 'Painting', icon: Paintbrush },
  { name: 'Pest Control', icon: Bug },
];

export function categoryIcon(name) {
  return CATEGORIES.find((c) => c.name.toLowerCase() === (name || '').toLowerCase())?.icon || Wrench;
}

export const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00',
];

export const BOOKING_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'];
