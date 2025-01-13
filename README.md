# Childminder Connect Platform

A comprehensive web application designed to connect parents with childminders, featuring secure authentication, role-based access control, and a modern user interface.

## 🚀 Features

- User authentication with Clerk
- Role-based access control (Parent/Childminder)
- Secure onboarding process
- Real-time messaging
- Booking management
- Review and rating system
- Profile management
- Subscription handling
- Notification system

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.1.4, React 19.0.0
- **Styling**: Tailwind CSS 3.4.1
- **Authentication**: Clerk 6.9.9
- **Database**: Prisma Client 6.2.1
- **Type Safety**: TypeScript 5
- **Linting**: ESLint 9
- **UI Components**: Shadcn UI, Radix UI

## 📋 Prerequisites

- Node.js (Latest LTS version)
- MySQL Database
- Clerk Account for authentication
- Environment variables setup

## 🔧 Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd [project-directory]
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file with the following variables:
```env
DATABASE_URL="mysql://..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

## 🔌 API Endpoints

### Authentication Webhooks
- `POST /api/webhooks/clerk`
  - Handles Clerk authentication webhooks
  - Events: user.created, user.updated, user.deleted

### User Management
- `GET /api/users`
  - Fetch user information
- `POST /api/role`
  - Update user role (parent/childminder)

### Onboarding
- `POST /api/onboarding/parent`
  - Complete parent onboarding process
- `POST /api/onboarding/childminder`
  - Complete childminder onboarding process

### Protected Routes
- `/portal/parent/*`
  - Parent dashboard and related functionalities
- `/portal/childminder/*`
  - Childminder dashboard and related functionalities

## 🔐 Authentication Flow

1. User signs up/signs in through Clerk
2. User selects role (parent/childminder)
3. User completes role-specific onboarding
4. User is redirected to appropriate portal

## 🔄 Middleware

The application uses Clerk middleware for:
- Route protection
- Role-based access control
- Authentication state management
- Redirection logic

## 📁 Project Structure

```
├── app/
│   ├── api/           # API routes
│   ├── onboarding/    # Onboarding flows
│   ├── portal/        # User portals
│   ├── role/          # Role selection
│   └── sign-in/       # Authentication pages
├── components/        # Reusable UI components
├── lib/              # Utility functions
├── prisma/           # Database schema and migrations
└── types/            # TypeScript type definitions
```

## 🛡️ Security

- Authentication handled by Clerk
- Protected API routes
- Secure webhook handling
- Environment variable protection
- Type-safe database queries

## 🧪 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 📄 License

[Your License Here]

## 👥 Contributing

[Your Contributing Guidelines]
