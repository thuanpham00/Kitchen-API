import { DishStatusValues } from '@/constants/type'
import { BaseQuery, PaginationRes } from '@/schemaValidations/util.schema'
import z from 'zod'

export const DishQuery = BaseQuery.and(
  z.object({
    name: z.string().trim().max(256).optional(),
    categoryId: z.string().optional(),
    pagination: z.string().optional()
  })
)

export type DishQueryType = z.TypeOf<typeof DishQuery>

export const CreateDishBody = z.object({
  name: z.string().min(1).max(256),
  price: z.coerce.number().positive(),
  description: z.string().max(10000),
  image: z.string().url(),
  status: z.enum(DishStatusValues).optional(),
  categoryId: z.string()
})

export type CreateDishBodyType = z.TypeOf<typeof CreateDishBody>

export const UpdateDishBody = CreateDishBody.extend({
  categoryId: z.string().optional()
})
export type UpdateDishBodyType = z.TypeOf<typeof UpdateDishBody>

export const DishSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.coerce.number(),
  description: z.string(),
  image: z.string(),
  status: z.enum(DishStatusValues),
  categoryId: z.number(),
  category: z.object({
    id: z.number(),
    name: z.string()
  }),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const DishRes = z.object({
  data: DishSchema,
  message: z.string()
})

export type DishResType = z.TypeOf<typeof DishRes>

export const DishListRes = z.object({
  data: z.array(DishSchema),
  message: z.string(),
  pagination: PaginationRes.nullable()
})

export type DishListResType = z.TypeOf<typeof DishListRes>

export const DishParams = z.object({
  id: z.coerce.number()
})
export type DishParamsType = z.TypeOf<typeof DishParams>

export const DishListWithPaginationQuery = z.object({
  page: z.coerce.number().positive().lte(10000).default(1),
  limit: z.coerce.number().positive().lte(10000).default(10)
})

export type DishListWithPaginationQueryType = z.TypeOf<typeof DishListWithPaginationQuery>

export const DishListWithPaginationRes = z.object({
  data: z.object({
    totalItem: z.number(),
    totalPage: z.number(),
    page: z.number(),
    limit: z.number(),
    items: z.array(DishSchema)
  }),
  message: z.string()
})

export type DishListWithPaginationResType = z.TypeOf<typeof DishListWithPaginationRes>
