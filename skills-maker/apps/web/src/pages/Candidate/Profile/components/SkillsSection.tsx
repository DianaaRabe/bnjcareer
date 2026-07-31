import { ChipInput } from './ChipInput'
import { MAX_IMPROVEMENTS, MAX_SKILLS, MAX_STRENGTHS } from '../constants'

type SkillsSectionProps = {
  strengths: string[]
  onAddStrength: (v: string) => void
  onRemoveStrength: (i: number) => void
  improvements: string[]
  onAddImprovement: (v: string) => void
  onRemoveImprovement: (i: number) => void
  skills: string[]
  onAddSkill: (v: string) => void
  onRemoveSkill: (i: number) => void
}

export const SkillsSection = ({
  strengths,
  onAddStrength,
  onRemoveStrength,
  improvements,
  onAddImprovement,
  onRemoveImprovement,
  skills,
  onAddSkill,
  onRemoveSkill,
}: SkillsSectionProps) => (
  <div className="flex flex-col gap-5">
    <ChipInput
      labelId="candidate.profile.skills.strengths.label"
      hintId="candidate.profile.skills.strengths.hint"
      values={strengths}
      max={MAX_STRENGTHS}
      onAdd={onAddStrength}
      onRemove={onRemoveStrength}
    />
    <ChipInput
      labelId="candidate.profile.skills.improvements.label"
      hintId="candidate.profile.skills.improvements.hint"
      values={improvements}
      max={MAX_IMPROVEMENTS}
      onAdd={onAddImprovement}
      onRemove={onRemoveImprovement}
    />
    <ChipInput
      labelId="candidate.profile.skills.tools.label"
      hintId="candidate.profile.skills.tools.hint"
      values={skills}
      max={MAX_SKILLS}
      placeholderId="candidate.profile.skills.tools.placeholder"
      onAdd={onAddSkill}
      onRemove={onRemoveSkill}
    />
  </div>
)
