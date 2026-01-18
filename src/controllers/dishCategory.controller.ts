import prisma from '@/database'
import { DishCategoryQueryType } from '@/schemaValidations/dishCategory.schema'

export const getDishCategoryList = async ({ page, limit, name }: DishCategoryQueryType) => {
  const skip = (page - 1) * limit

  const whereCondition = name
    ? { name: { contains: name } } // ← Bỏ mode: 'insensitive'
    : {}

  const [categories, total] = await Promise.all([
    prisma.dishCategory.findMany({
      orderBy: { id: 'asc' },
      include: {
        _count: {
          select: { dishes: true }
        }
      },
      where: whereCondition // ← Dùng chung
    }),
    prisma.dish.count({
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
