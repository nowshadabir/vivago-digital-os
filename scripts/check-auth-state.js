const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient();
  try {
    const users = await prisma.user.count();
    const otpRows = await prisma.$queryRawUnsafe("SELECT COUNT(*) AS c FROM auth_otp");
    const otpCount = Number(otpRows?.[0]?.c ?? 0);

    console.log(`users=${users}`);
    console.log(`auth_otp=${otpCount}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
