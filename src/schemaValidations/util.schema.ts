import z from 'zod'

export const BaseQuery = z.object({
  page: z.coerce.number().min(1),
  limit: z.coerce.number().min(1).max(100)
})

export type BaseQueryType = z.TypeOf<typeof BaseQuery>

export const PaginationRes = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number()
})

export type PaginationResType = z.TypeOf<typeof PaginationRes>
