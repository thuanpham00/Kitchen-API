import prisma from '@/database'
import {
  CreateDishCategoryBodyType,
  DishCategoryQueryType,
  UpdateDishCategoryBodyType
} from '@/schemaValidations/dishCategory.schema'

export const getDishCategoryList = async ({ page, limit, name }: DishCategoryQueryType) => {
  const skip = (page - 1) * limit

  const whereCondition = name
    ? { name: { contains: name } } // ← Bỏ mode: 'insensitive'
    : {}

  const [categories, total] = await Promise.all([
    prisma.dishCategory.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { dishes: true }
        }
      },
      where: whereCondition // ← Dùng chung
    }),
    prisma.dishCategory.count({
      where: whereCondition // ← Đếm theo điều kiện
    })
  ])

  return {
    data: categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      countDish: cat._count.dishes, // ← Map sang countDish
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

export const getListNameDishCategory = async () => {
  const categories = await prisma.dishCategory.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'desc' }
  })
  return categories
}

export const createDishCategory = async (data: CreateDishCategoryBodyType) => {
  const category = await prisma.dishCategory.create({
    data,
    include: {
      _count: {
        select: { dishes: true }
      }
    }
  })

  return {
    id: category.id,
    name: category.name,
    description: category.description,
    countDish: category._count.dishes,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt
  }
}

export const getDishCategoryDetail = (id: number) => {
  return prisma.dishCategory.findUniqueOrThrow({
    where: {
      id
    }
  })
}

export const updateDishCategory = (id: number, data: UpdateDishCategoryBodyType) => {
  return prisma.dishCategory.update({
    where: {
      id
    },
    data
  })
}

export const deleteDishCategory = async (id: number) => {
  // Kiểm tra danh mục có món ăn không
  const dishCount = await prisma.dish.count({
    where: {
      categoryId: id
    }
  })

  if (dishCount > 0) {
    throw new Error(`Không thể xóa danh mục này vì còn ${dishCount} món ăn đang thuộc danh mục`)
  }

  return prisma.dishCategory.delete({
    where: {
      id
    }
  })
}
