import type { Story } from '@/types/database'
import { TEACHER_STUDENT_STORIES } from './stories/teacher_student'
import { MAID_STORIES } from './stories/maid'
import { TRAVEL_STORIES } from './stories/travel'
import { OUTDOOR_STORIES } from './stories/outdoor'
import { OFFICE_STORIES } from './stories/office'
import { ROMANCE_STORIES } from './stories/romance'
import { EROTICA_STORIES } from './stories/erotica'
import { FANTASY_STORIES } from './stories/fantasy'
import { TABOO_STORIES } from './stories/taboo'

import { EPIC_SAGAS } from './stories/epics'

// Master Aggregated Stories Library
export const MASTER_STORIES: Story[] = [
  ...EPIC_SAGAS,
  ...TEACHER_STUDENT_STORIES,
  ...MAID_STORIES,
  ...TRAVEL_STORIES,
  ...OUTDOOR_STORIES,
  ...OFFICE_STORIES,
  ...ROMANCE_STORIES,
  ...EROTICA_STORIES,
  ...FANTASY_STORIES,
  ...TABOO_STORIES,
]

// O(1) Fast Lookup Map by Story ID
export const MASTER_STORIES_MAP: Record<string, Story> = MASTER_STORIES.reduce(
  (acc, story) => {
    acc[story.id] = story
    return acc
  },
  {} as Record<string, Story>
)
