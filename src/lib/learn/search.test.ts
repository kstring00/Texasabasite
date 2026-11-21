import { describe, expect, it } from 'vitest';
import { filterModules, matchesSearch } from './search';

const m = { title: 'Understanding the ABCs of Behavior', summary: 'A simple way to describe one moment.', topics: ['ABC model', 'consequence'], categoryId: 'c1' };
const other = { title: 'Morning routines', summary: 'Visual schedules.', topics: ['routines'], categoryId: 'c2' };
const name = (id: string) => (id === 'c1' ? 'Understanding Behavior' : 'Routines & Daily Living');

describe('library search', () => {
  it('matches title, summary, topic labels and category name, ignoring case and punctuation', () => {
    for (const q of ['abcs', 'SIMPLE way', 'consequence', 'understanding behavior', "ABC's", '  ']) expect(matchesSearch(m, q, name('c1'))).toBe(true);
    expect(matchesSearch(m, 'routines', name('c1'))).toBe(false);
  });
  it('needs every word to match', () => {
    expect(matchesSearch(m, 'abc moment')).toBe(true);
    expect(matchesSearch(m, 'abc bedtime')).toBe(false);
  });
  it('combines search with the topic filter', () => {
    expect(filterModules([m, other], '', null, name)).toHaveLength(2);
    expect(filterModules([m, other], '', 'c2', name)).toEqual([other]);
    expect(filterModules([m, other], 'abc', 'c2', name)).toEqual([]);
    expect(filterModules([m, other], 'daily living', null, name)).toEqual([other]);
  });
});
