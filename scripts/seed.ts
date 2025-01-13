import { PrismaClient, Role, Gender, BookingStatus, Prisma } from '@prisma/client';
import { createClerkClient } from '@clerk/clerk-sdk-node';

// Initialize Clerk client
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const prisma = new PrismaClient();

// Dublin area locations
const dublinLocations = [
  { area: 'Dublin 1', coordinates: { lat: 53.3498, lng: -6.2603 } },
  { area: 'Dublin 2', coordinates: { lat: 53.3398, lng: -6.2489 } },
  { area: 'Dublin 3', coordinates: { lat: 53.3621, lng: -6.2186 } },
  { area: 'Dublin 4', coordinates: { lat: 53.3279, lng: -6.2184 } },
  { area: 'Dublin 5', coordinates: { lat: 53.3813, lng: -6.1746 } },
  { area: 'Dublin 6', coordinates: { lat: 53.3087, lng: -6.2606 } },
  { area: 'Dublin 7', coordinates: { lat: 53.3595, lng: -6.2921 } },
  { area: 'Dublin 8', coordinates: { lat: 53.3375, lng: -6.2774 } },
  { area: 'Dublin 9', coordinates: { lat: 53.3785, lng: -6.2419 } },
  { area: 'Dublin 10', coordinates: { lat: 53.3637, lng: -6.3352 } }
];

// Child age ranges and activities
const childActivities = [
  'Swimming lessons',
  'Dance classes',
  'Football training',
  'Art classes',
  'Music lessons',
  'Gymnastics',
  'Drama club',
  'Tennis lessons'
];

const specialNeeds = [
  'None',
  'Mild autism',
  'ADHD',
  'Dyslexia',
  'Sensory processing',
  'Speech delay'
];

async function createClerkUser(email: string, password: string, name: string, role: Role) {
  try {
    const clerkUser = await clerkClient.users.createUser({
      emailAddress: [email],
      password,
      firstName: name.split(' ')[0],
      lastName: name.split(' ')[1] || '',
      publicMetadata: {
        role: role.toLowerCase(),
        onboardingComplete: true
      }
    });
    return clerkUser;
  } catch (error) {
    console.error(`Failed to create Clerk user for ${email}:`, error);
    throw error;
  }
}

function getRandomLocation() {
  return dublinLocations[Math.floor(Math.random() * dublinLocations.length)];
}

function getRandomBirthDate(minAge: number, maxAge: number) {
  const today = new Date();
  const minDate = new Date(today.getFullYear() - maxAge, 0, 1);
  const maxDate = new Date(today.getFullYear() - minAge, 11, 31);
  return new Date(minDate.getTime() + Math.random() * (maxDate.getTime() - minDate.getTime()));
}

function getRandomActivities(count: number) {
  const shuffled = [...childActivities].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).join(', ');
}

async function main() {
  console.log('Starting seeding...');

  // Create 5 parents
  const parents = await Promise.all(
    Array(5).fill(null).map(async (_, i) => {
      const email = `parent${i + 1}@example.com`;
      const name = `Parent ${i + 1}`;
      const location = getRandomLocation();
      
      // Create user in Clerk first with parent role
      const clerkUser = await createClerkUser(email, 'password123', name, Role.parent);
      
      // Then create in our database with Clerk ID
      const user = await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          name: name,
          email: email,
          password: 'managed-by-clerk',
          role: Role.parent,
          serviceArea: location.area,
          availability: {
            weekdays: true,
            weekends: false,
            evenings: true
          }
        }
      });

      // Create 1-3 children for each parent
      const childCount = Math.floor(Math.random() * 3) + 1;
      const children = await Promise.all(
        Array(childCount).fill(null).map(async (_, j) => {
          const specialNeed = specialNeeds[Math.floor(Math.random() * specialNeeds.length)];
          return prisma.child.create({
            data: {
              parentId: user.id,
              name: `Child ${i + 1}${String.fromCharCode(65 + j)}`,
              dateOfBirth: getRandomBirthDate(2, 12),
              gender: Math.random() > 0.5 ? Gender.male : Gender.female,
              additionalInfo: JSON.stringify({
                activities: getRandomActivities(2),
                specialNeeds: specialNeed,
                allergies: specialNeed === 'None' ? 'None' : 'Check medical record',
                preferences: {
                  favoriteActivities: getRandomActivities(2),
                  dislikes: 'None noted'
                }
              })
            }
          });
        })
      );

      return { ...user, children };
    })
  );

  // Create 10 childminders
  const childminders = await Promise.all(
    Array(10).fill(null).map(async (_, i) => {
      const email = `childminder${i + 1}@example.com`;
      const name = `Childminder ${i + 1}`;
      const location = getRandomLocation();
      const yearsExp = 5 + Math.floor(Math.random() * 15);
      
      // Create user in Clerk first with childminder role
      const clerkUser = await createClerkUser(email, 'password123', name, Role.childminder);
      
      // Then create in our database with Clerk ID
      return prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          name: name,
          email: email,
          password: 'managed-by-clerk',
          role: Role.childminder,
          experience: `${yearsExp} years of experience`,
          qualifications: JSON.stringify([
            'Certified Early Childhood Educator',
            'First Aid Certified',
            'Child Protection Training',
            yearsExp > 10 ? 'Advanced Childcare Diploma' : 'Basic Childcare Certificate',
            Math.random() > 0.5 ? 'Special Needs Education' : null
          ].filter(Boolean)),
          serviceArea: location.area,
          hourlyRate: new Prisma.Decimal(20 + Math.floor(Math.random() * 15)),
          gardaVetted: true,
          tuslaRegistered: true,
          availability: {
            monday: { morning: true, afternoon: true, evening: Math.random() > 0.5 },
            tuesday: { morning: true, afternoon: true, evening: Math.random() > 0.5 },
            wednesday: { morning: true, afternoon: true, evening: Math.random() > 0.5 },
            thursday: { morning: true, afternoon: true, evening: Math.random() > 0.5 },
            friday: { morning: true, afternoon: true, evening: Math.random() > 0.5 },
            saturday: Math.random() > 0.7,
            sunday: Math.random() > 0.8
          }
        }
      });
    })
  );

  // Create bookings and reviews
  for (const parent of parents) {
    for (const child of parent.children) {
      // Create 2-4 bookings per child with random childminders
      const bookingCount = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < bookingCount; i++) {
        const randomChildminder = childminders[Math.floor(Math.random() * childminders.length)];
        const startTime = new Date();
        startTime.setDate(startTime.getDate() - (i * 7)); // Past bookings
        
        const booking = await prisma.booking.create({
          data: {
            parentId: parent.id,
            childminderId: randomChildminder.id,
            childId: child.id,
            startTime: startTime,
            endTime: new Date(startTime.getTime() + 3 * 60 * 60 * 1000),
            status: BookingStatus.completed,
            additionalInfo: JSON.stringify({
              specialInstructions: 'None',
              emergencyContact: '+353 87 123 4567',
              pickupPerson: parent.name,
              activities: getRandomActivities(1)
            })
          }
        });

        // Create detailed reviews for completed bookings
        const rating = Math.floor(Math.random() * 2) + 4; // 4-5 star ratings
        await prisma.review.create({
          data: {
            parentId: parent.id,
            childminderId: randomChildminder.id,
            bookingId: booking.id,
            rating: rating,
            review: `${rating === 5 ? 'Excellent' : 'Very good'} service! ${randomChildminder.name} was ${
              rating === 5 ? 'amazing' : 'professional'} with the children. ${
              rating === 5 ? 'Highly recommended!' : 'Would book again.'}`
          }
        });
      }

      // Create conversations with messages
      const randomChildminder = childminders[Math.floor(Math.random() * childminders.length)];
      await prisma.conversation.create({
        data: {
          parentId: parent.id,
          childminderId: randomChildminder.id,
          messages: {
            create: [
              {
                senderId: parent.id,
                receiverId: randomChildminder.id,
                content: `Hi ${randomChildminder.name}, I'm looking for childcare for my ${
                  Math.floor((new Date().getTime() - child.dateOfBirth.getTime()) / (1000 * 60 * 60 * 24 * 365))} year old.`
              },
              {
                senderId: randomChildminder.id,
                receiverId: parent.id,
                content: `Hello ${parent.name}, thank you for reaching out! I'd be happy to help. What days and times are you looking for?`
              },
              {
                senderId: parent.id,
                receiverId: randomChildminder.id,
                content: 'I need someone for weekday afternoons, typically 2-6pm. Is that something you could accommodate?'
              },
              {
                senderId: randomChildminder.id,
                receiverId: parent.id,
                content: 'Yes, that works perfectly with my schedule. Would you like to discuss the details further?'
              }
            ]
          }
        }
      });
    }
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 