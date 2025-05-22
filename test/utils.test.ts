import { describe, test, expect } from 'vitest';
import { cn } from '../src/lib/utils';

describe('cn utility', () => {
  test('merges class names and removes duplicates', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
  });

  test('handles conditional classes', () => {
    expect(cn('text-sm', false && 'hidden')).toBe('text-sm');
  });
});