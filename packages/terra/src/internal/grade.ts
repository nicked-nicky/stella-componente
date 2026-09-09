import type { Grade } from '../types/types';

export function resolveGrade(
  explicit: Grade | undefined,
  fallback: Grade
): Grade {
  return explicit ?? fallback;
}

export function nextGrade(grade: Grade): Grade {
  switch (grade) {
    case 'global':
      return 'default';
    case 'default':
    case 'elevated':
      return 'elevated';
  }
}

export function resolveSurfaceGrade(
  explicit: Grade | undefined,
  parentGrade: Grade | undefined,
  rootFallback: Grade
): Grade {
  if (explicit !== undefined) return explicit;
  return parentGrade === undefined ? rootFallback : nextGrade(parentGrade);
}

export function gradeAttrs(grade: Grade): { 'data-stella-grade': Grade } {
  return { 'data-stella-grade': grade };
}
