# Jai Guru Astro Remedy

## Overview

This is a comprehensive astrology consultation platform built for Astrologer Arup Shastri's personal business. The application offers video/audio/chat consultations, astrology courses, and product sales with a focus on neon glow and glassmorphism design aesthetics. The platform serves clients globally with multilingual support and provides both online and offline consultation booking capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite for build tooling and hot module replacement
- **Styling**: Tailwind CSS with custom neon glow and glassmorphism components for cosmic-themed UI
- **UI Components**: Shadcn/ui component library built on Radix UI primitives for accessibility and consistency
- **Routing**: Client-side routing with path resolution and alias configuration
- **State Management**: TanStack Query for server state management and React hooks for local state
- **Design System**: Custom neon-themed components with animated cosmic backgrounds and 3D realistic effects

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Database ORM**: Drizzle ORM for type-safe database operations with PostgreSQL dialect
- **Authentication**: JWT-based authentication with bcrypt password hashing and multi-factor verification
- **Real-time Communication**: WebSocket integration for live chat and consultation features
- **API Design**: RESTful endpoints with comprehensive CRUD operations and middleware logging

### Database Schema
The application uses PostgreSQL with 22 core tables covering:
- **User Management**: Users, authentication sessions, OTP verifications, mobile number changes
- **Business Core**: Consultations, courses, course enrollments, products, orders
- **Communication**: Chat messages, support chats, student conversations and messages
- **Administrative**: Notifications, audit logs, security events, legal agreements, FAQs
- **Home Tuition**: Specialized courses and applications for in-person services

### Authentication & Authorization
- **Multi-identifier System**: Username, phone number, email, and government ID support
- **OTP Verification**: SMS-based verification through Twilio integration
- **Security Features**: Account status tracking, failed login attempt monitoring, IP tracking
- **Legal Compliance**: Terms acceptance tracking, data processing consent, marketing preferences

### Communication Features
- **Video Consultations**: Jitsi Meet integration for secure video conferencing
- **Audio Consultations**: Built-in voice call functionality with timer management
- **Chat System**: Real-time messaging with WebSocket support and file sharing
- **Session Management**: Consultation timers, pause/resume functionality, and automatic notifications

## External Dependencies

### Payment Processing
- **Stripe**: International payment processing with React Stripe.js integration
- **PayPal**: Alternative international payment gateway through PayPal Server SDK
- **Razorpay & Cashfree**: Indian payment processing solutions
- **PhonePe**: UPI and digital payment integration for Indian market

### Communication Services
- **Twilio**: SMS and OTP delivery service for phone verification
- **AWS SES**: Email service for transactional communications and notifications
- **Jitsi Meet**: Video conferencing solution for consultations

### AI and Content
- **Google Gemini AI**: Content generation and customer support assistance
- **Google Cloud Storage**: File storage and management for user uploads

### Database and Infrastructure
- **Neon Database**: Serverless PostgreSQL database with WebSocket support
- **Replit Object Storage**: File storage with Google Cloud Storage backend
- **Vercel**: Hosting platform for frontend deployment

### Development Tools
- **Vite**: Build tool with React plugin and runtime error overlay
- **ESBuild**: JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS and Autoprefixer

### UI and Design
- **Radix UI**: Comprehensive set of accessible React components
- **Tailwind CSS**: Utility-first CSS framework with custom neon theming
- **Lucide React**: Icon library for consistent iconography