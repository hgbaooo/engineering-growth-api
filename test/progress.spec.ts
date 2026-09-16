import { describe, expect, it } from 'vitest';
import { calculateProgress } from '../src/common/progress';

describe('calculateProgress', () => {
  it('returns zero completion for an empty roadmap', () => {
    expect(calculateProgress([])).toEqual({ totalTopics: 0, appliedTopics: 0, percentage: 0, statusCounts: { NOT_STARTED: 0, LEARNING: 0, PRACTICING: 0, APPLIED: 0 } });
  });
  it('counts every status and treats only applied topics as complete', () => {
    expect(calculateProgress([{ status: 'NOT_STARTED' }, { status: 'LEARNING' }, { status: 'PRACTICING' }, { status: 'APPLIED' }, { status: 'APPLIED' }])).toEqual({ totalTopics: 5, appliedTopics: 2, percentage: 40, statusCounts: { NOT_STARTED: 1, LEARNING: 1, PRACTICING: 1, APPLIED: 2 } });
  });
});
