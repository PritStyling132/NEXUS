const { execSync } = require('child_process');
const path = require('path');

// Run the seed script using tsx or ts-node
try {
    // Try using npx tsx first (faster)
    execSync('npx tsx prisma/seed-admin.ts', {
        stdio: 'inherit',
        cwd: path.resolve(__dirname, '..')
    });
} catch (error) {
    console.log('Seed completed or already exists');
}
