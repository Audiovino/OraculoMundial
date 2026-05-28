/** Edificios / zonas para agrupar ligas — solo etiqueta de juego, sin vínculo comercial */
export const PUERTO_MADERO_BUILDINGS = [
  'Puerto Madero - Dique 1',
  'Puerto Madero - Dique 2',
  'Puerto Madero - Dique 3',
  'Puerto Madero - Dique 4',
  'Palermo Nuevo',
  'Las Cañitas',
  'Recoleta - Av. Alvear',
  'Belgrano R',
  'Otro (especificar en nombre de liga)',
] as const;

export type UserRole = 'intendente' | 'encargado' | 'vecino' | 'otro';

export const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: 'intendente', label: 'Intendente / Administración del edificio' },
  { value: 'encargado', label: 'Encargado / Personal del edificio' },
  { value: 'vecino', label: 'Vecino / Residente' },
  { value: 'otro', label: 'Otro' },
];
