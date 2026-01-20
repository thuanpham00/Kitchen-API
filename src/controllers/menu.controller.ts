import { DishStatus } from '@/constants/type'
import prisma from '@/database'
import { AddDishToMenuType, MenuQueryType, UpdateMenuBodyType } from '@/schemaValidations/menu.schema'

export const getMenuList = async ({ page, limit, name }: MenuQueryType) => {
  const skip = (page - 1) * limit

  const whereCondition = name
    ? { name: { contains: name } } // ← Bỏ mode: 'insensitive'
    : {}

  const [menus, total] = await Promise.all([
    prisma.menu.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { menuItems: true }
        }
      },
      where: whereCondition // ← Dùng chung
    }),
    prisma.menu.count({
      where: whereCondition // ← Đếm theo điều kiện
    })
  ])

  return {
    data: menus.map((menu) => ({
      id: menu.id,
      name: menu.name,
      description: menu.description,
      version: menu.version,
      isActive: menu.isActive,
      createdAt: menu.createdAt,
      updatedAt: menu.updatedAt,
      countMenuItems: menu._count.menuItems
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }
}

// export const getListNameDishCategory = async () => {
//   const categories = await prisma.dishCategory.findMany({
//     select: { id: true, name: true },
//     orderBy: { name: 'desc' }
//   })
//   return categories
// }

// export const createDishCategory = async (data: CreateDishCategoryBodyType) => {
//   const category = await prisma.dishCategory.create({
//     data,
//     include: {
//       _count: {
//         select: { dishes: true }
//       }
//     }
//   })

//   return {
//     id: category.id,
//     name: category.name,
//     description: category.description,
//     countDish: category._count.dishes,
//     createdAt: category.createdAt,
//     updatedAt: category.updatedAt
//   }
// }

export const getMenuDetail = (id: number) => {
  return prisma.menu.findUniqueOrThrow({
    where: {
      id
    }
  })
}

export const updateMenu = (id: number, data: UpdateMenuBodyType) => {
  // nếu có 1 menu nào đó đang có isActive = true thì throw lỗi không cho cập nhật và ngược lại thì cho cập nhật
  if (data.isActive === true) {
    return prisma.$transaction(async (prisma) => {
      const activeMenu = await prisma.menu.findFirst({
        where: {
          isActive: true,
          id: { not: id } // ← Loại trừ menu hiện tại
        }
      })
      if (activeMenu) {
        throw new Error(
          'Đã có menu khác đang được kích hoạt. Vui lòng tắt kích hoạt menu đó trước khi kích hoạt menu này.'
        )
      }
      return prisma.menu.update({
        where: {
          id
        },
        data
      })
    })
  }

  return prisma.menu.update({
    where: {
      id
    },
    data
  })
}

// export const deleteDishCategory = async (id: number) => {
//   // Kiểm tra danh mục có món ăn không
//   const dishCount = await prisma.dish.count({
//     where: {
//       categoryId: id
//     }
//   })

//   if (dishCount > 0) {
//     throw new Error(`Không thể xóa danh mục này vì còn ${dishCount} món ăn đang thuộc danh mục`)
//   }

//   return prisma.dishCategory.delete({
//     where: {
//       id
//     }
//   })
// }

export const getMenuItemFromMenu = async (menuId: number) => {
  const list = await prisma.menuItem.findMany({
    where: {
      menuId
    },
    include: {
      dish: {
        include: {
          category: true
        }
      }
    }
  })
  return {
    itemList: list,
    menu: await getMenuDetail(menuId)
  }
}

export const addMenuItemToMenu = async (data: AddDishToMenuType) => {
  const findDish = await prisma.dish.findFirst({
    where: {
      id: data.dishId
    }
  })

  if (!findDish || findDish.status === DishStatus.Hidden) {
    throw new Error('Món ăn không tồn tại!')
  }

  if (data.price <= findDish?.price) {
    throw new Error('Giá món ăn trong menu phải cao hơn giá gốc của món ăn!')
  }

  const checkDishExistInMenu = await prisma.menuItem.findFirst({
    where: {
      dishId: data.dishId,
      menuId: data.menuId
    }
  })

  if (checkDishExistInMenu) {
    throw new Error('Món ăn đã tồn tại trong menu!')
  }

  return prisma.menuItem.create({
    data,
    include: {
      dish: {
        include: {
          category: true
        }
      }
    }
  })
}
