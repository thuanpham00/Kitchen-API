const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const items = [
    {
      name: 'Thịt bò',
      description: 'Thịt bò tươi',
      allergenType: '',
      isVegetarian: false,
      isVegan: false,
      category: 'thit-ca',
      image: ''
    },
    {
      name: 'Thịt gà',
      description: 'Thịt ức gà',
      allergenType: '',
      isVegetarian: false,
      isVegan: false,
      category: 'thit-ca',
      image: ''
    },
    {
      name: 'Tôm',
      description: 'Tôm tươi',
      allergenType: 'shellfish',
      isVegetarian: false,
      isVegan: false,
      category: 'thit-ca',
      image: ''
    },
    {
      name: 'Cá hồi',
      description: 'Cá hồi nhập khẩu',
      allergenType: 'fish',
      isVegetarian: false,
      isVegan: false,
      category: 'thit-ca',
      image: ''
    },
    {
      name: 'Đậu hũ',
      description: 'Đậu hũ non',
      allergenType: '',
      isVegetarian: true,
      isVegan: true,
      category: 'khac',
      image: ''
    },
    {
      name: 'Rau muống',
      description: 'Rau muống tươi',
      allergenType: '',
      isVegetarian: true,
      isVegan: true,
      category: 'rau-cu',
      image: ''
    },
    {
      name: 'Cà chua',
      description: 'Cà chua đỏ',
      allergenType: '',
      isVegetarian: true,
      isVegan: true,
      category: 'rau-cu',
      image: ''
    },
    {
      name: 'Hành tây',
      description: 'Hành tây vàng',
      allergenType: '',
      isVegetarian: true,
      isVegan: true,
      category: 'rau-cu',
      image: ''
    },
    {
      name: 'Tỏi',
      description: 'Tỏi tươi',
      allergenType: '',
      isVegetarian: true,
      isVegan: true,
      category: 'gia-vi',
      image: ''
    },
    {
      name: 'Ớt hiểm',
      description: 'Ớt tươi',
      allergenType: '',
      isVegetarian: true,
      isVegan: true,
      category: 'gia-vi',
      image: ''
    },
    {
      name: 'Nấm rơm',
      description: 'Nấm tươi',
      allergenType: '',
      isVegetarian: true,
      isVegan: true,
      category: 'rau-cu',
      image: ''
    },
    {
      name: 'Trứng gà',
      description: 'Trứng gà ta',
      allergenType: 'egg',
      isVegetarian: false,
      isVegan: false,
      category: 'thit-ca',
      image: ''
    },
    {
      name: 'Sữa',
      description: 'Sữa tươi',
      allergenType: 'dairy',
      isVegetarian: true,
      isVegan: false,
      category: 'khac',
      image: ''
    },
    {
      name: 'Bơ',
      description: 'Bơ thực vật',
      allergenType: '',
      isVegetarian: true,
      isVegan: true,
      category: 'khac',
      image: ''
    },
    {
      name: 'Đường',
      description: 'Đường tinh luyện',
      allergenType: '',
      isVegetarian: true,
      isVegan: true,
      category: 'gia-vi',
      image: ''
    },
    {
      name: 'Nước mắm',
      description: 'Nước mắm truyền thống',
      allergenType: 'fish',
      isVegetarian: false,
      isVegan: false,
      category: 'gia-vi',
      image: ''
    },
    {
      name: 'Tương đậu nành',
      description: 'Tương lên men',
      allergenType: 'soy',
      isVegetarian: true,
      isVegan: true,
      category: 'gia-vi',
      image: ''
    },
    {
      name: 'Hạt điều',
      description: 'Hạt điều rang',
      allergenType: 'nuts',
      isVegetarian: true,
      isVegan: true,
      category: 'khac',
      image: ''
    },
    {
      name: 'Lạc',
      description: 'Lạc rang',
      allergenType: 'nuts',
      isVegetarian: true,
      isVegan: true,
      category: 'khac',
      image: ''
    },
    {
      name: 'Bánh phở',
      description: 'Bánh phở gạo',
      allergenType: 'gluten',
      isVegetarian: true,
      isVegan: true,
      category: 'khac',
      image: ''
    }
  ]

  // Use upsert per item because `createMany({ skipDuplicates })` isn't supported on this connector/version
  const created = await Promise.all(
    items.map((item) =>
      prisma.ingredient.upsert({
        where: { name: item.name },
        update: {
          description: item.description,
          allergenType: item.allergenType,
          isVegetarian: item.isVegetarian,
          isVegan: item.isVegan,
          category: item.category,
          image: item.image
        },
        create: item
      })
    )
  )
  console.log('Upserted:', created.length)

  const total = await prisma.ingredient.count()
  console.log('Total ingredients in DB:', total)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
