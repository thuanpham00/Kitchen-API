import prisma from '@/database'
import { CreateDishBodyType, DishQueryType, UpdateDishBodyType } from '@/schemaValidations/dish.schema'

export const getDishList = async ({ page, limit, name }: DishQueryType) => {
  const skip = (page - 1) * limit

  const whereCondition = name
    ? { name: { contains: name } } // ← Bỏ mode: 'insensitive'
    : {}

  const [dishes, total] = await Promise.all([
    prisma.dish.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true
      },
      where: whereCondition // ← Dùng chung
    }),
    prisma.dish.count({
      where: whereCondition // ← Đếm theo điều kiện
    })
  ])

  return {
    data: dishes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

export const getDishListWithPagination = async (page: number, limit: number) => {
  const data = await prisma.dish.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    skip: (page - 1) * limit,
    take: limit
  })
  const totalItem = await prisma.dish.count()
  const totalPage = Math.ceil(totalItem / limit)
  return {
    items: data,
    totalItem,
    page,
    limit,
    totalPage
  }
}

export const getDishDetail = (id: number) => {
  return prisma.dish.findUniqueOrThrow({
    where: {
      id
    }
  })
}

export const createDish = (data: CreateDishBodyType) => {
  return prisma.dish.create({
    data
  })
}

export const updateDish = (id: number, data: UpdateDishBodyType) => {
  return prisma.dish.update({
    where: {
      id
    },
    data
  })
}

export const deleteDish = (id: number) => {
  return prisma.dish.delete({
    where: {
      id
    }
  })
}
