import { graphql } from '@/gql'

export const CREATE_TRAINING_MUTATION = graphql(`
  mutation CreateTraining($input: CreateTrainingInput!) {
    createTraining(input: $input) {
      id
      title
      category
      level
      durationDays
      published
    }
  }
`)

export const UPDATE_TRAINING_MUTATION = graphql(`
  mutation UpdateTraining($id: ID!, $input: UpdateTrainingInput!) {
    updateTraining(id: $id, input: $input) {
      id
      title
      description
      category
      level
      priceCents
      durationDays
      instructor
      certificate
      published
    }
  }
`)

export const DELETE_TRAINING_MUTATION = graphql(`
  mutation DeleteTraining($id: ID!) {
    deleteTraining(id: $id)
  }
`)

export const ADD_TRAINING_MODULE_MUTATION = graphql(`
  mutation AddTrainingModule($trainingId: ID!, $input: TrainingModuleInput!) {
    addTrainingModule(trainingId: $trainingId, input: $input) {
      id
      position
      title
      summary
      durationMinutes
    }
  }
`)

export const UPDATE_TRAINING_MODULE_MUTATION = graphql(`
  mutation UpdateTrainingModule($id: ID!, $input: TrainingModuleInput!) {
    updateTrainingModule(id: $id, input: $input) {
      id
      position
      title
      summary
      durationMinutes
    }
  }
`)

export const REMOVE_TRAINING_MODULE_MUTATION = graphql(`
  mutation RemoveTrainingModule($id: ID!) {
    removeTrainingModule(id: $id)
  }
`)
