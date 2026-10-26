import { Target } from 'lucide-react'

import { SectionHeader } from '@/components/common/SectionHeader/SectionHeader'
import { GoalRow } from './GoalRow'
import type { Goal } from '../useCoaching'

type GoalListProps = {
  goals: Goal[]
}

export const GoalList = ({ goals }: GoalListProps) => (
  <section className="flex flex-col pt-5">
    <SectionHeader icon={Target} titleId="candidate.coaching.goals.title" className="mb-3.5" />

    <ul className="flex flex-col">
      {goals.map((goal, index) => (
        <GoalRow key={goal.key} goal={goal} isLast={index === goals.length - 1} />
      ))}
    </ul>
  </section>
)
