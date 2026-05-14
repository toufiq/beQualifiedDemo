import type { BoundingBox } from '@playwright/test';

export const isRightAligned = (reference: BoundingBox | null, target: BoundingBox | null, tolerance = 10): boolean => {
  if (!reference || !target) return false;
  const referenceRight = reference.x + reference.width;
  const targetRight = target.x + target.width;
  return Math.abs(referenceRight - targetRight) <= tolerance;
};
