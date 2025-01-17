# Technical Specification

## System Overview
- The system is a web application designed to connect parents with childminders. It facilitates the onboarding process for both parents and childminders, allows users to sign in and sign up, and provides pages for the home, about, contact, and onboarding processes. The application uses a relational database to store user data, bookings, conversations, messages, subscriptions, reviews, and notifications.
- The system enforces code quality and styling standards within a web development project. It integrates linting and styling tools to ensure consistent code style and adherence to best practices.
- The system is a web application built using Next.js, leveraging Clerk for authentication middleware, and styled with Tailwind CSS. The core capabilities include user authentication, role-based access control, and image handling. The application ensures secure access to routes based on user authentication status and role, and it optimizes image loading from external sources.
- The system is a web application designed to manage and interact with a childminder service. It provides functionalities such as user authentication, data management via Prisma ORM, UI components for a responsive design, and state management. The application leverages Next.js for server-side rendering and API routes, ensuring a performant and SEO-friendly user experience.

## Architecture
- The application follows a component-based architecture using React and Next.js. The main components include `RootLayout` for the global layout and styling, `Home`, `About`, `Contact`, and onboarding pages for specific functionalities, and `SignIn` and `SignUp` components for authentication. The data flow starts from user interactions in the components, which then communicate with the backend via API calls. The backend uses Prisma to interact with the MySQL database. The application leverages Clerk for authentication and user management.
- The architecture leverages modular configuration files to define linting and styling rules. These configurations are integrated into the broader build and development process, ensuring that code quality checks are performed as part of the development workflow.
- The architecture is modular, with clear separation of concerns. The `middleware.ts` file acts as an authentication and routing middleware, intercepting requests to enforce access controls. The `next.config.ts` file configures image optimization, while the `tailwind.config.ts` file defines the styling configuration. The middleware integrates with Clerk to manage user sessions and redirects, while the configuration files enhance the application's performance and aesthetics without direct interaction with the middleware.
- The architecture follows a modular design pattern, where different components and services are decoupled. The system uses Next.js pages and API routes to handle routing and server-side logic. Prisma is utilized for database interactions, providing a type-safe query builder. The UI is constructed using Shadcn UI components and Tailwind CSS for styling, ensuring a consistent and modern look. Authentication is managed through Clerk, which integrates seamlessly with Next.js. The application employs TypeScript for type safety and better developer experience.

## Implementation
- The `RootLayout` component sets up the global styles and fonts, and wraps the application in the `ClerkProvider` for authentication context.
- The `Home` component displays the main landing page with sections for hero, pricing, features, testimonials, and a call-to-action.
- The `About` component provides information about the mission, values, and a call-to-action to join the community.
- The `Contact` component includes a contact form and other contact methods.
- The `OnboardingPage` component handles the routing logic based on the user's role and onboarding status.
- The `ChildminderOnboarding` and `ParentOnboarding` components use React Hook Form and Zod for form validation and state management.
- The `prisma/schema.prisma` file defines the database schema, including models for users, children, bookings, conversations, messages, subscriptions, reviews, and notifications.
- The `migration.sql` file initializes the database tables and foreign key constraints.
- The file imports necessary modules such as `path`, `url`, and `FlatCompat` from `@eslint/eslintrc`.
- It resolves the current file's directory using `fileURLToPath` and `dirname`.
- Creates a `FlatCompat` instance with the base directory set to the resolved directory.
- Uses the `compat.extends` method to extend configurations from `next/core-web-vitals` and `next/typescript`.
- Exports the combined ESLint configuration.
- Defines a configuration object conforming to the `postcss-load-config` type.
- Specifies `tailwindcss` as a plugin within the configuration.
- Exports the PostCSS configuration.
- Uses `clerkMiddleware` and `createRouteMatcher` from `@clerk/nextjs/server` to define public and onboarding routes.
- Implements conditional logic to check user authentication status via `auth()` and redirects users based on their session claims and current route.
- Utilizes `NextResponse` to handle responses, including redirects to sign-in, role selection, or onboarding pages.
- Configures image optimization for remote patterns, specifically for images hosted on `images.unsplash.com`.
- Specifies content paths for Tailwind to scan, including pages, components, and app directories.
- Extends the theme with custom colors using CSS variables.
- The implementation utilizes Next.js scripts for development, building, and starting the application. The `dev` script runs the development server with Turbopack for faster rebuilds. The `build` script compiles the application for production, and the `start` script runs the production server. Linting is handled by ESLint with configurations specific to Next.js. The application uses Prisma Client to interact with the database, ensuring type-safe queries and migrations. UI components are built using Shadcn UI and Radix UI, with Tailwind CSS for styling. Clerk handles user authentication, providing hooks and components for secure user sessions.

## Core Functionality
- User authentication and management using Clerk.
- Onboarding processes for parents and childminders with form validation.
- Display of home, about, and contact pages with relevant information and call-to-action buttons.
- Relational database management using Prisma and MySQL for storing user data, bookings, conversations, messages, subscriptions, reviews, and notifications.
- Enforces linting rules by extending configurations tailored for Next.js projects with core web vitals and TypeScript support.
- Configures PostCSS to use TailwindCSS for utility-first CSS styling.
- Enforces access control by checking if a route is public or requires authentication.
- Redirects unauthenticated users to the sign-in page.
- Guides authenticated users without a selected role to the role selection page.
- Ensures users complete onboarding based on their role before accessing other parts of the application.
- Optimizes loading of images from `images.unsplash.com` to improve performance.
- Applies Tailwind CSS with custom color variables for consistent theming across the application.
- User authentication implemented using Clerk, providing secure login, registration, and session management.
- Data management using Prisma Client for CRUD operations, ensuring type-safe database interactions.
- UI components built using Shadcn UI and Radix UI for responsive and accessible UI elements.
- Styling employed using Tailwind CSS for utility-first styling, allowing for rapid UI development.
- Linting and type checking ensured by ESLint and TypeScript throughout the application.

## Dependencies
- Next.js for the React framework
- Tailwind CSS for styling
- React Hook Form for form state management
- Zod for schema validation
- Lucide React for icons
- Clerk for authentication
- Prisma for database ORM
- MySQL as the relational database
- `eslint`: Used for JavaScript and TypeScript linting.
- `@eslint/eslintrc`: Provides utilities for creating ESLint configurations.
- `flat-compat`: Enables compatibility with flat configuration extending.
- `postcss`: CSS processing tool.
- `tailwindcss`: Utility-first CSS framework integrated via PostCSS.
- `@clerk/nextjs`: Used for authentication middleware.
- `next`: Next.js framework for server-side rendering and routing.
- `tailwindcss`: CSS framework for utility-first styling.
- `@clerk/nextjs`: "^6.9.9" - For user authentication.
- `@prisma/client`: "^6.2.1" - For database interactions.
- `next`: "15.1.4" - The React framework for server-side rendering and routing.
- `react`: "^19.0.0" - The core library for building UI components.
- `react-dom`: "^19.0.0" - For rendering React components to the DOM.
- `tailwindcss`: "^3.4.1" - For utility-first CSS styling.
- `typescript`: "^5" - For type safety and better developer experience.
- `eslint`: "^9" - For linting JavaScript and TypeScript code.
- `eslint-config-next`: "15.1.4" - ESLint configuration specifically for Next.js projects.