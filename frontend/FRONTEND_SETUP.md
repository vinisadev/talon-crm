# TalonCRM Frontend Setup

## Overview

The frontend is built with Next.js 15, React 19, TypeScript, and Tailwind CSS. It includes a complete authentication system with login, registration, and a protected dashboard.

## Features Implemented

### ✅ Authentication System
- **Login Page** (`/login`) - Email/password authentication with form validation
- **Registration Page** (`/register`) - User registration with organization selection
- **Protected Routes** - Middleware and components to protect dashboard routes
- **Auth Context** - Global authentication state management

### ✅ Dashboard
- **Main Dashboard** (`/dashboard`) - Overview with stats cards and recent activity
- **Sidebar Navigation** - Responsive sidebar with navigation menu
- **User Profile** - Display user information and logout functionality

### ✅ Landing Page
- **Home Page** (`/`) - Marketing landing page with features showcase
- **Responsive Design** - Mobile-first responsive design
- **Call-to-Action** - Clear paths to login/registration

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI Library**: shadcn/ui components
- **Styling**: Tailwind CSS v4
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **State Management**: React Context API
- **HTTP Client**: Fetch API with custom wrapper

## Getting Started

1. **Install Dependencies**
   ```bash
   cd frontend
   pnpm install
   ```

2. **Environment Setup**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

3. **Start Development Server**
   ```bash
   pnpm dev
   ```

4. **Access the Application**
   - Home: http://localhost:3000
   - Login: http://localhost:3000/login
   - Register: http://localhost:3000/register
   - Dashboard: http://localhost:3000/dashboard (requires authentication)

## API Integration

The frontend integrates with the NestJS backend API:

- **Authentication**: `/auth/login`, `/auth/register`, `/auth/profile`
- **Token Management**: JWT tokens stored in localStorage and cookies
- **Error Handling**: Comprehensive error handling with user feedback

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Protected dashboard pages
│   ├── login/            # Authentication pages
│   ├── register/
│   ├── layout.tsx        # Root layout with AuthProvider
│   └── page.tsx          # Landing page
├── components/           # Reusable components
│   ├── dashboard/        # Dashboard-specific components
│   ├── ui/              # shadcn/ui components
│   └── protected-route.tsx
├── contexts/            # React contexts
│   └── auth-context.tsx # Authentication context
└── lib/                 # Utilities and API client
    ├── api.ts          # API client
    └── utils.ts        # Utility functions
```

## Key Components

### AuthContext
- Manages global authentication state
- Provides login, register, logout functions
- Handles token persistence and validation

### API Client
- Centralized HTTP client for backend communication
- Automatic token management
- Error handling and response parsing

### ProtectedRoute
- HOC for protecting dashboard routes
- Redirects unauthenticated users to login
- Shows loading state during authentication check

### Dashboard Layout
- Responsive sidebar navigation
- User profile display
- Mobile-friendly hamburger menu

## Development Notes

- All forms use React Hook Form with Zod validation
- Responsive design works on mobile, tablet, and desktop
- Dark mode support through Tailwind CSS
- TypeScript for type safety
- ESLint for code quality

## Next Steps

1. **Backend Integration**: Ensure the NestJS server is running on port 3001
2. **Database Setup**: Run Prisma migrations to set up the database
3. **Testing**: Add unit and integration tests
4. **Additional Features**: Implement contacts, organizations, and reports pages
5. **Deployment**: Configure for production deployment
