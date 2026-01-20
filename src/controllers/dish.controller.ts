import prisma from '@/database'
import { CreateDishBodyType, DishQueryType, UpdateDishBodyType } from '@/schemaValidations/dish.schema'

export const getDishList = async ({ page, limit, name, categoryId, pagination }: DishQueryType) => {
  console.log(pagination)
  if (pagination === 'false') {
    const dishes = await prisma.dish.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        category: true
      }
    })
    return {
      data: dishes,
      pagination: null
    }
  }

  const skip = (page - 1) * limit

  const whereCondition = name
    ? { name: { contains: name } } // ← Bỏ mode: 'insensitive'
    : {}

  const whereCategoryId = categoryId
    ? {
        categoryId: Number(categoryId)
      }
    : {}

  const [dishes, total] = await Promise.all([
    prisma.dish.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true
      },
      where: {
        ...whereCondition,
        ...whereCategoryId
      }
    }),
    prisma.dish.count({
      where: {
        ...whereCondition,
        ...whereCategoryId
      }
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
    },
    include: {
      category: true
    }
  })
}

export const createDish = (data: CreateDishBodyType) => {
  return prisma.dish.create({
    data: {
      name: data.name,
      price: data.price,
      description: data.description,
      image: data.image,
      status: data.status,
      categoryId: Number(data.categoryId)
    },
    include: {
      category: true
    }
  })
}

export const updateDish = (id: number, data: UpdateDishBodyType) => {
  return prisma.dish.update({
    where: {
      id
    },
    data: {
      ...data,
      categoryId: data.categoryId ? Number(data.categoryId) : undefined
    },
    include: {
      category: true
    }
  })
}

export const deleteDish = (id: number) => {
  return prisma.dish.delete({
    where: {
      id
    },
    include: {
      category: true
    }
  })
}
