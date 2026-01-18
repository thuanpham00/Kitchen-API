import { getDishCategoryList } from '@/controllers/dishCategory.controller'
import { requireEmployeeHook, requireLoginedHook, requireOwnerHook } from '@/hooks/auth.hooks'
import {
  DishCategoryListRes,
  DishCategoryListResType,
  DishCategoryQuery,
  DishCategoryQueryType,
  DishCategoryRes,
  DishCategoryResType
} from '@/schemaValidations/dishCategory.schema'
import { FastifyInstance, FastifyPluginOptions } from 'fastify'

export default async function categoryRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.addHook(
    'preValidation',
    fastify.auth([requireLoginedHook, [requireOwnerHook, requireEmployeeHook]], {
      relation: 'and' // yêu cầu login và (owner hoặc employee)
    })
  )
  fastify.get<{
    Reply: DishCategoryListResType
    Querystring: DishCategoryQueryType
  }>(
    '/',
    {
      schema: {
        response: {
          200: DishCategoryListRes
        },
        querystring: DishCategoryQuery
      }
    },
    async (request, reply) => {
      const { data, pagination } = await getDishCategoryList({
        page: request.query.page || 1,
        limit: request.query.limit || 5,
        name: request.query.name
      })
      reply.send({
        data: data as DishCategoryListResType['data'],
        pagination: pagination,
        message: 'Lấy danh sách danh mục món ăn thành công!'
      })
    }
  )
}
