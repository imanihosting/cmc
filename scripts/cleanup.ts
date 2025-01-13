import { createClerkClient } from '@clerk/clerk-sdk-node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function main() {
  console.log('Starting cleanup...');
  
  try {
    // Get all test users from Clerk first
    const { data: users } = await clerkClient.users.getUserList();
    const testUsers = users.filter(user => user.emailAddresses.some(email => email.emailAddress.includes('@example.com')));
    console.log(`Found ${testUsers.length} Clerk users to delete`);

    // Delete database records first
    console.log('Deleting database records...');
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

    console.log('Database records deleted');

    // Now delete Clerk users
    console.log('Deleting Clerk users...');
    for (const user of testUsers) {
      try {
        await clerkClient.users.deleteUser(user.id);
        console.log(`Deleted Clerk user: ${user.emailAddresses[0].emailAddress}`);
      } catch (error) {
        console.error(`Failed to delete Clerk user ${user.emailAddresses[0].emailAddress}:`, error);
      }
    }
    console.log('Clerk users deleted');

    console.log('Cleanup completed!');
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 