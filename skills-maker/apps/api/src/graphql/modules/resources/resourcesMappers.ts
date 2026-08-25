import type { Resource } from '@prisma/client'

export type GraphQLResource = {
  id: string
  title: string
  description: string | null
  type: Resource['type']
  category: Resource['category']
  url: string | null
  sizeBytes: number | null
  durationMinutes: number | null
  access: Resource['access']
  priceCents: number | null
}

/**
 * Drops the catalog-management fields, and withholds the url of anything not free:
 * a locked resource must not leak its file to whoever reads the response.
 */
export function toGraphQLResource(resource: Resource): GraphQLResource {
  const isLocked = resource.access !== 'FREE'

  return {
    id: resource.id,
    title: resource.title,
    description: resource.description,
    type: resource.type,
    category: resource.category,
    url: isLocked ? null : resource.url,
    sizeBytes: resource.sizeBytes,
    durationMinutes: resource.durationMinutes,
    access: resource.access,
    priceCents: resource.access === 'PAID' ? resource.priceCents : null,
  }
}
