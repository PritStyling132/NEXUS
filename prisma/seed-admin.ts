import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    const adminEmail = "pritammaityofficial132@gmail.com"
    const adminPassword = "Admin@123"

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
        where: { email: adminEmail },
    })

    if (existingAdmin) {
        console.log("Admin already exists:", adminEmail)
        return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    // Create admin
    const admin = await prisma.admin.create({
        data: {
            email: adminEmail,
            password: hashedPassword,
            firstname: "Super",
            lastname: "Admin",
            isSuperAdmin: true,
            isActive: true,
        },
    })

    console.log("Admin created successfully!")
    console.log("Email:", adminEmail)
    console.log("Password:", adminPassword)
    console.log("ID:", admin.id)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
