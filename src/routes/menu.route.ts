import { createDishCategory, deleteDishCategory, updateDishCategory } from '@/controllers/dishCategory.controller'
import {
  addMenuItemToMenu,
  getMenuDetail,
  getMenuItemFromMenu,
  getMenuList,
  updateMenu
} from '@/controllers/menu.controller'
import { pauseApiHook, requireEmployeeHook, requireLoginedHook, requireOwnerHook } from '@/hooks/auth.hooks'
import {
  CreateDishCategoryBody,
  CreateDishCategoryBodyType,
  DishCategoryParams,
  DishCategoryParamsType,
  DishCategoryRes,
  DishCategoryResType,
  UpdateDishCategoryBody,
  UpdateDishCategoryBodyType
} from '@/schemaValidations/dishCategory.schema'
import {
  AddDishToMenu,
  AddDishToMenuType,
  MenuItemListRes,
  MenuItemListResType,
  MenuItemRes,
  MenuItemResType,
  MenuListRes,
  MenuListResType,
  MenuParams,
  MenuParamsType,
  MenuQuery,
  MenuQueryType,
  MenuRes,
  MenuResType,
  UpdateMenuBody,
  UpdateMenuBodyType
} from '@/schemaValidations/menu.schema'
import { FastifyInstance, FastifyPluginOptions } from 'fastify'

export default async function menusRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  fastify.get<{
    Reply: MenuListResType
    Querystring: MenuQueryType
  }>(
    '/',
    {
      schema: {
        response: {
          200: MenuListRes
        },
        querystring: MenuQuery
      }
    },
    async (request, reply) => {
      const { data, pagination } = await getMenuList({
        page: request.query.page || 1,
        limit: request.query.limit || 5,
        name: request.query.name
      })
      reply.send({
        data: data as MenuListResType['data'],
        pagination: pagination,
        message: 'Lấy danh sách menu thành công!'
      })
    }
  ),
    fastify.get<{
      Params: MenuParamsType
      Reply: MenuResType
    }>(
      '/:id',
      {
        schema: {
          params: MenuParams,
          response: {
            200: MenuRes
          }
        }
      },
      async (request, reply) => {
        const dish = await getMenuDetail(request.params.id)
        reply.send({
          data: dish as MenuResType['data'],
          message: 'Lấy thông tin menu thành công!'
        })
      }
    )

  fastify.post<{
    Body: CreateDishCategoryBodyType
    Reply: DishCategoryResType
  }>(
    '',
    {
      schema: {
        body: CreateDishCategoryBody,
        response: {
          200: DishCategoryRes
        }
      },
      preValidation: fastify.auth([requireLoginedHook, pauseApiHook, [requireOwnerHook, requireEmployeeHook]], {
        relation: 'and'
      })
    },
    async (request, reply) => {
      const dishCategory = await createDishCategory(request.body)
      reply.send({
        data: dishCategory as DishCategoryResType['data'],
        message: 'Tạo danh mục món ăn thành công!'
      })
    }
  )

  fastify.put<{
    Params: MenuParamsType
    Body: UpdateMenuBodyType
    Reply: MenuResType
  }>(
    '/:id',
    {
      schema: {
        params: MenuParams,
        body: UpdateMenuBody,
        response: {
          200: MenuRes
        }
      },

      preValidation: fastify.auth([requireLoginedHook, pauseApiHook, [requireOwnerHook, requireEmployeeHook]], {
        relation: 'and'
      })
    },
    async (request, reply) => {
      const menu = await updateMenu(request.params.id, request.body)
      reply.send({
        data: menu as MenuResType['data'],
        message: 'Cập nhật menu thành công!'
      })
    }
  )

  fastify.delete<{
    Params: DishCategoryParamsType
    Reply: DishCategoryResType
  }>(
    '/:id',
    {
      schema: {
        params: DishCategoryParams,
        response: {
          200: DishCategoryRes
        }
      },
      preValidation: fastify.auth([requireLoginedHook, pauseApiHook, [requireOwnerHook, requireEmployeeHook]], {
        relation: 'and'
      })
    },
    async (request, reply) => {
      const result = await deleteDishCategory(request.params.id)
      reply.send({
        message: 'Xóa danh mục món ăn thành công!',
        data: result as DishCategoryResType['data']
      })
    }
  )

  fastify.get<{
    Params: MenuParamsType
    Reply: MenuItemListResType
  }>(
    '/:id/items',
    {
      schema: {
        params: MenuParams,
        response: {
          200: MenuItemListRes
        }
      }
    },
    async (request, reply) => {
      const menuItemList = await getMenuItemFromMenu(request.params.id)
      reply.send({
        data: menuItemList as MenuItemListResType['data'],
        message: 'Lấy danh sách món ăn menu thành công!'
      })
    }
  )

  fastify.post<{
    Body: AddDishToMenuType
    Reply: MenuItemResType
  }>(
    '/add-menu-item',
    {
      schema: {
        body: AddDishToMenu,
        response: {
          200: MenuItemRes
        }
      }
    },
    async (request, reply) => {
      const menuItemList = await addMenuItemToMenu(request.body)
      reply.send({
        data: menuItemList as MenuItemResType['data'],
        message: 'Thêm món ăn vào menu thành công!'
      })
    }
  )
}
