const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const items = [
    // 10 protein / nguyên liệu chính
    { name: 'Thịt heo', description: 'Thịt heo tươi', allergenType: '', isVegetarian: false, isVegan: false, category: 'thit-ca', image: '' },
    { name: 'Thịt vịt', description: 'Thịt vịt tươi', allergenType: '', isVegetarian: false, isVegan: false, category: 'thit-ca', image: '' },
    { name: 'Ngao', description: 'Ngao tươi', allergenType: 'shellfish', isVegetarian: false, isVegan: false, category: 'thit-ca', image: '' },
    { name: 'Hàu', description: 'Hàu sữa', allergenType: 'shellfish', isVegetarian: false, isVegan: false, category: 'thit-ca', image: '' },
    { name: 'Cá basa', description: 'Cá basa tươi', allergenType: 'fish', isVegetarian: false, isVegan: false, category: 'thit-ca', image: '' },
    { name: 'Cá thu', description: 'Cá thu tươi', allergenType: 'fish', isVegetarian: false, isVegan: false, category: 'thit-ca', image: '' },
    { name: 'Bạch tuộc', description: 'Bạch tuộc tươi', allergenType: 'shellfish', isVegetarian: false, isVegan: false, category: 'thit-ca', image: '' },
    { name: 'Sườn heo', description: 'Sườn heo', allergenType: '', isVegetarian: false, isVegan: false, category: 'thit-ca', image: '' },
    { name: 'Giò heo', description: 'Giò heo', allergenType: '', isVegetarian: false, isVegan: false, category: 'thit-ca', image: '' },

    // 10 gia vị
    { name: 'Tiêu xay', description: 'Hạt tiêu đen xay', allergenType: '', isVegetarian: true, isVegan: true, category: 'gia-vi', image: '' },
    { name: 'Nước tương', description: 'Nước tương (xì dầu)', allergenType: 'soy', isVegetarian: true, isVegan: true, category: 'gia-vi', image: '' },
    { name: 'Sốt ớt', description: 'Sốt ớt (chili sauce)', allergenType: '', isVegetarian: true, isVegan: true, category: 'gia-vi', image: '' },
    { name: 'Sốt hoisin', description: 'Sốt hoisin', allergenType: 'soy', isVegetarian: true, isVegan: true, category: 'gia-vi', image: '' },
    { name: 'Hành khô', description: 'Hành khô phi', allergenType: '', isVegetarian: true, isVegan: true, category: 'gia-vi', image: '' },
    { name: 'Tỏi bột', description: 'Tỏi bột', allergenType: '', isVegetarian: true, isVegan: true, category: 'gia-vi', image: '' },
    { name: 'Bột ngọt', description: 'Bột ngọt (MSG)', allergenType: '', isVegetarian: true, isVegan: true, category: 'gia-vi', image: '' },
    { name: 'Bột ớt', description: 'Bột ớt', allergenType: '', isVegetarian: true, isVegan: true, category: 'gia-vi', image: '' },
    { name: 'Mật ong', description: 'Mật ong', allergenType: '', isVegetarian: true, isVegan: false, category: 'gia-vi', image: '' }
  ]

  // Upsert each item to avoid duplicates
  const results = []
  for (const item of items) {
    try {
      const res = await prisma.ingredient.upsert({
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
      results.push(res)
    } catch (err) {
      console.error('Failed upsert', item.name, err.message)
    }
  }

  console.log('Upserted count:', results.length)
  const total = await prisma.ingredient.count()
  console.log('Total ingredients in DB now:', total)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
