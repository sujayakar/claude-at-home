import { expect, test } from 'bun:test';
import { cn } from './utils';

test('cn merges class names', () => {
  expect(cn('foo', 'bar')).toBe('foo bar');
});