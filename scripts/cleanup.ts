import { PrismaClient } from '@prisma/client';
import { createClerkClient, User } from '@clerk/clerk-sdk-node';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const prisma = new PrismaClient();

async function main() {
  console.log('Starting cleanup...');

  // First, get all Clerk users with our test email pattern
  try {
    const { data: clerkUsers } = await clerkClient.users.getUserList();
    const testUsers = clerkUsers.filter((user: User) => 
      user.emailAddresses.some(email => email.emailAddress.includes('@example.com'))
    );

    console.log(`Found ${testUsers.length} Clerk users to delete`);

    // Delete all matching Clerk users
    for (const user of testUsers) {
      try {
        await clerkClient.users.deleteUser(user.id);
        console.log(`Deleted Clerk user: ${user.emailAddresses[0]?.emailAddress}`);
      } catch (error) {
        console.error(`Failed to delete Clerk user ${user.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Failed to fetch Clerk users:', error);
  }

  // Delete all test data from our database
  await prisma.message.deleteMany({
    where: {
      OR: [
        { sender: { email: { contains: '@example.com' } } },
        { receiver: { email: { contains: '@example.com' } } }
      ]
    }
  });

  await prisma.conversation.deleteMany({
    where: {
      OR: [
        { parent: { email: { contains: '@example.com' } } },
        { childminder: { email: { contains: '@example.com' } } }
      ]
    }
  });

  await prisma.review.deleteMany({
    where: {
      OR: [
        { parent: { email: { contains: '@example.com' } } },
        { childminder: { email: { contains: '@example.com' } } }
      ]
    }
  });

  await prisma.booking.deleteMany({
    where: {
      OR: [
        { parent: { email: { contains: '@example.com' } } },
        { childminder: { email: { contains: '@example.com' } } }
      ]
    }
  });

  await prisma.child.deleteMany({
    where: {
      parent: { email: { contains: '@example.com' } }
    }
  });

  await prisma.user.deleteMany({
    where: {
      email: { contains: '@example.com' }
    }
  });

  console.log('Cleanup completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 