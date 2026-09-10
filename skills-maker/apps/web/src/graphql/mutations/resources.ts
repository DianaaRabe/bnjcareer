import { graphql } from '@/gql'

export const CREATE_RESOURCE_MUTATION = graphql(`
  mutation CreateResource($input: CreateResourceInput!) {
    createResource(input: $input) {
      id
      title
      type
      category
      access
      published
    }
  }
`)

export const UPDATE_RESOURCE_MUTATION = graphql(`
  mutation UpdateResource($id: ID!, $input: UpdateResourceInput!) {
    updateResource(id: $id, input: $input) {
      id
      title
      description
      type
      category
      url
      sizeBytes
      durationMinutes
      access
      priceCents
      published
    }
  }
`)

export const DELETE_RESOURCE_MUTATION = graphql(`
  mutation DeleteResource($id: ID!) {
    deleteResource(id: $id)
  }
`)
