import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.communityPlace.findFirst({
    where: { name: "Brilliant Angels Academy" },
  })

  if (existing) {
    console.log("Brilliant Angels Academy already exists")
    return
  }

  const place = await prisma.communityPlace.create({
    data: {
      name: "Brilliant Angels Academy",
      category: "community",
      description: "Community-Based Organisation empowering Githogoro through education, environment, sports, youth empowerment, health, and disaster management. Programs include Sulwe Scholarship, Adopt a Child, and vocational training.",
      lat: -1.2134,
      lng: 36.8241,
      phone: "+254796595995",
      website: "https://brilliant-angel-cbo.vercel.app",
      isApproved: true,
      isOfficial: true,
    },
  })

  console.log("Created:", place.name, place.id)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
