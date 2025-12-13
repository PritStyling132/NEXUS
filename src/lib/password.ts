import bcrypt from "bcryptjs"

export function generateTemporaryPassword(length: number = 12): string {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const lowercase = "abcdefghijklmnopqrstuvwxyz"
    const numbers = "0123456789"
    const special = "!@#$%^&*"
    const allChars = uppercase + lowercase + numbers + special

    let password = ""
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += special[Math.floor(Math.random() * special.length)]

    for (let i = 4; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)]
    }

    return password
        .split("")
        .sort(() => Math.random() - 0.5)
        .join("")
}

export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(
    password: string,
    hashedPassword: string,
): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
}

export function isPasswordExpired(expiresAt: Date | null): boolean {
    if (!expiresAt) return true
    return new Date() > expiresAt
}

export function getPasswordExpiryDate(hours: number = 24): Date {
    const expiryDate = new Date()
    expiryDate.setHours(expiryDate.getHours() + hours)
    return expiryDate
}
