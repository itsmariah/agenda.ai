import { BADGE_TONE_CLASSES, type BadgeTone } from './Badge';

export const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
  COMPLETED: 'Concluído',
  NO_SHOW: 'Não compareceu',
};

export const STATUS_TONES: Record<string, BadgeTone> = {
  PENDING: 'yellow',
  CONFIRMED: 'blue',
  CANCELLED: 'red',
  COMPLETED: 'green',
  NO_SHOW: 'gray',
};

export function statusClasses(status: string): string {
  return BADGE_TONE_CLASSES[STATUS_TONES[status] ?? 'gray'];
}
