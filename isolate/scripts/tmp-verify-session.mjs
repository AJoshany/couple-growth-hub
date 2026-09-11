// TEMPORARY verification helper. Creates/links/removes a single test user so we
// can confirm the session no longer goes stale after couple setup.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const email = process.env.TEST_EMAIL;
const action = process.argv[2];

async function main() {
  if (action === "create") {
    const passwordHash = await bcrypt.hash("verify-password-123", 12);
    const user = await prisma.user.create({
      data: { name: "Verify User", email, passwordHash },
      select: { id: true },
    });
    console.log(JSON.stringify({ userId: user.id }));
    return;
  }

  if (action === "addCouple") {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, coupleId: true },
    });
    if (!user) throw new Error("test user missing");
    const couple = await prisma.couple.create({
      data: { name: "Verify Couple", startDate: new Date("2024-02-14") },
    });
    await prisma.user.update({
      where: { id: user.id },
      data: { coupleId: couple.id, coupleRole: "OWNER" },
    });
    console.log(JSON.stringify({ coupleId: couple.id, userId: user.id }));
    return;
  }

  if (action === "cleanup") {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, coupleId: true },
    });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { coupleId: null, coupleRole: null },
      });
      await prisma.user.delete({ where: { id: user.id } });
      if (user.coupleId) {
        await prisma.couple.delete({ where: { id: user.coupleId } });
      }
    }
    console.log(JSON.stringify({ cleaned: true, userId: user?.id ?? null }));
    return;
  }

  throw new Error(`unknown action: ${action}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
