const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function main() {
  const dishes = await prisma.dish.findMany({
    include: {
    },
    orderBy: { createdAt: 'desc' }
  })

  const outPath = path.join(__dirname, 'dishes.json')
  fs.writeFileSync(outPath, JSON.stringify(dishes, null, 2), 'utf8')
  console.log(`Exported ${dishes.length} dishes to ${outPath}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
