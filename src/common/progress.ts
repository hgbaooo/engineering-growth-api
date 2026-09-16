export const TOPIC_STATUSES = ['NOT_STARTED', 'LEARNING', 'PRACTICING', 'APPLIED'] as const;
export type TopicStatusValue = (typeof TOPIC_STATUSES)[number];

export type Progress = {
  totalTopics: number;
  appliedTopics: number;
  percentage: number;
  statusCounts: Record<TopicStatusValue, number>;
};

export function calculateProgress(topics: readonly { status: TopicStatusValue }[]): Progress {
  const statusCounts: Record<TopicStatusValue, number> = {
    NOT_STARTED: 0,
    LEARNING: 0,
    PRACTICING: 0,
    APPLIED: 0
  };
  for (const topic of topics) statusCounts[topic.status] += 1;
  const totalTopics = topics.length;
  const appliedTopics = statusCounts.APPLIED;
  return {
    totalTopics,
    appliedTopics,
    percentage: totalTopics === 0 ? 0 : Math.round((appliedTopics / totalTopics) * 100),
    statusCounts
  };
}
