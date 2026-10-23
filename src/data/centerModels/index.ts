import type { CenterModel } from './types';
import { sugarland } from './sugarland';

/** Only centers with a model file get "Step inside" entry points. */
export const centerModels: Record<string, CenterModel> = { sugarland };

export function getCenterModel(centerId: string | null | undefined): CenterModel | null {
  return centerId ? centerModels[centerId] ?? null : null;
}
export function getCenterModelBySlug(slug: string): CenterModel | null {
  return Object.values(centerModels).find((m) => m.slug === slug) ?? null;
}
export function hasCenterModel(centerId: string | null | undefined) {
  return Boolean(centerId && centerModels[centerId]);
}
export function insideHref(model: CenterModel, roomId?: string) {
  return `/locations/${model.slug}/inside${roomId ? `#room-${roomId}` : ''}`;
}
export type { CenterModel, Room, PathStage, RoomModule } from './types';
