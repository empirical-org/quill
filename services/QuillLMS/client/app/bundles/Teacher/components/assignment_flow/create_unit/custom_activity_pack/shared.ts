import { Activity } from './interfaces'

const RESULTS_PER_PAGE = 20

export const calculateNumberOfPages = (activities: Activity[]) => Math.ceil(activities.length / RESULTS_PER_PAGE)

export const lowerBound = (currentPage: number): number => (currentPage - 1) * RESULTS_PER_PAGE;

export const upperBound = (currentPage: number): number => currentPage * RESULTS_PER_PAGE;

export const activityClassificationGroupings = [
  {
    group: 'Independent Practice',
    keys: ['connect', 'sentence', 'passage']
  },
  {
    group: 'Whole Class Instruction',
    keys: ['lessons']
  },
  {
    group: 'Diagnostics',
    keys: ['diagnostic']
  }
]

export const getNumberFromString = (string) => {
  const numberMatch = string.match(/\d+/g)
  if (numberMatch) { return Number(numberMatch[0]) }

  return null
}

export const ACTIVITY_CLASSIFICATION_FILTERS = 'activityClassificationFilters'

export const ACTIVITY_CATEGORY_FILTERS = 'activityCategoryFilters'

function filterBySearch(search: string, activity: Activity) {
  const stringActivity = Object.values(activity).join(' ').toLowerCase();
  return stringActivity.includes(search.toLowerCase())
}

function filterByActivityClassification(activityClassificationFilters: string[], activity: Activity) {
  if (!activityClassificationFilters.length) { return true }
  return activityClassificationFilters.includes(activity.activity_classification.key)
}

function filterByActivityCategory(activityCategoryFilters: number[], activity: Activity) {
  if (!activityCategoryFilters.length) { return true }
  return activityCategoryFilters.includes(activity.activity_category.id)
}

function filterByGradeLevel(gradeLevelFilters: number[], activity: Activity) {
  if (!gradeLevelFilters.length) { return true }
  const numberFromStandardLevel = getNumberFromString(activity.standard_level_name)
  return gradeLevelFilters.includes(numberFromStandardLevel)
}

export const filters = {
  search: filterBySearch,
  [ACTIVITY_CLASSIFICATION_FILTERS]: filterByActivityClassification,
  gradeLevelFilters: filterByGradeLevel,
  [ACTIVITY_CATEGORY_FILTERS]: filterByActivityCategory
}

const conceptSort = (activities) => activities.sort((a, b) => {
  if (!a.activity_category_name) { return 1 }
  if (!b.activity_category_name) { return -1 }
  return a.activity_category_name.localeCompare(b.activity_category_name)
})

const ccssAscendingSort = (activities) => activities.sort((a, b) => {
  const numberMatchA = getNumberFromString(a.standard_level_name)
  const numberMatchB = getNumberFromString(b.standard_level_name)

  if (!numberMatchA) { return 1 }
  if (!numberMatchB) { return -1 }

  return numberMatchA - numberMatchB
})

const ccssDescendingSort = (activities) => activities.sort((a, b) => {
  const numberMatchA = getNumberFromString(a.standard_level_name)
  const numberMatchB = getNumberFromString(b.standard_level_name)

  if (!numberMatchA) { return 1 }
  if (!numberMatchB) { return -1 }

  return numberMatchB - numberMatchA
})

export const DEFAULT = 'default'
const CCSS_ASCENDING = 'ccss-asc'
const CCSS_DESCENDING = 'ccss-desc'
const CONCEPT = 'concept'

export const sortFunctions = {
  [DEFAULT]: (activities) => activities,
  [CCSS_ASCENDING]: ccssAscendingSort,
  [CCSS_DESCENDING]: ccssDescendingSort,
  [CONCEPT]: conceptSort
}

export const sortOptions = [
  {
    label: 'Default',
    key: DEFAULT,
    value: DEFAULT
  },
  {
    label: 'CCSS Grade Level (Low to High)',
    key: CCSS_ASCENDING,
    value: CCSS_ASCENDING
  },
  {
    label: 'CCSS Grade Level (High to Low)',
    key: CCSS_DESCENDING,
    value: CCSS_DESCENDING
  },
  {
    label: 'Concept',
    key: CONCEPT,
    value: CONCEPT
  }
]
