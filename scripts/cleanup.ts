import { createClerkClient } from '@clerk/clerk-sdk-node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function main() {
  try {
    console.log('Starting cleanup...');

    // First delete all test data from database
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

    // Then delete users from Clerk
    console.log('Deleting Clerk users...');
    const { data: users } = await clerkClient.users.getUserList();
    const testUsers = users.filter(user => user.emailAddresses.some(email => email.emailAddress.includes('@example.com')));
    console.log(`Found ${testUsers.length} Clerk users to delete`);
    
    for (const user of testUsers) {
      await clerkClient.users.deleteUser(user.id);
      console.log(`Deleted Clerk user: ${user.emailAddresses[0].emailAddress}`);
    }
    console.log('Clerk users deleted');

    console.log('Cleanup completed!');
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

main(); 