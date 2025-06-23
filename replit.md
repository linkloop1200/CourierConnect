# Spoedpakketjes - Express Delivery Application

## Overview

This is a full-stack web application for express package delivery services in the Netherlands. The system provides a mobile-first interface for customers to book deliveries, track packages in real-time, and manage their delivery preferences. The application uses a modern tech stack with React frontend, Express backend, and PostgreSQL database.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for development and production builds
- **Maps Integration**: Google Maps JavaScript API with custom fallback components

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API endpoints under `/api` prefix
- **Middleware**: Custom logging, JSON parsing, CORS handling
- **Development**: Hot reload with tsx for TypeScript execution

### Database Layer
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with connection pooling
- **Migrations**: Drizzle Kit for schema management
- **Connection**: WebSocket-enabled for serverless environments

## Key Components

### Data Models
- **Users**: Customer accounts with authentication details
- **Addresses**: Geocoded delivery locations with coordinates
- **Drivers**: Delivery personnel with real-time location tracking
- **Deliveries**: Order management with status tracking and pricing

### Core Features
1. **Real-time Package Tracking**: GPS-based location updates
2. **Address Management**: Geocoded addresses with Google Maps integration
3. **Driver Assignment**: Automatic matching based on availability
4. **Delivery Status Updates**: Automated status progression
5. **Mobile-Optimized Interface**: Progressive Web App design

### UI Components
- **App Layout**: Mobile-first design with bottom navigation
- **Map Integration**: Google Maps with fallback alternatives
- **Form Handling**: React Hook Form with Zod validation
- **Component Library**: Comprehensive shadcn/ui implementation

## Data Flow

### Customer Journey
1. Customer selects pickup/delivery addresses
2. System calculates pricing and assigns available driver
3. Real-time tracking begins once pickup is confirmed
4. Status updates flow through WebSocket connections
5. Delivery completion triggers notifications

### Driver Workflow
1. Driver receives delivery assignments
2. Route optimization for multiple deliveries
3. Real-time location broadcasting
4. Status updates at each delivery milestone
5. Performance metrics and feedback collection

## External Dependencies

### Google Services
- **Maps JavaScript API**: Interactive maps and geocoding
- **Places API**: Address autocomplete and validation
- **Directions API**: Route optimization and navigation

### Development Tools
- **Replit Integration**: Development environment configuration
- **Vite Plugins**: Runtime error overlay and development tools
- **Database**: Neon PostgreSQL serverless database

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide Icons**: Consistent iconography

## Deployment Strategy

### Development Environment
- **Platform**: Replit with Node.js 20 runtime
- **Database**: PostgreSQL 16 module
- **Hot Reload**: Automatic TypeScript compilation and reload
- **Port Configuration**: Frontend (5000) with automatic external mapping

### Production Build
- **Frontend**: Vite production build to `dist/public`
- **Backend**: ESBuild compilation to `dist/index.js`
- **Deployment**: Autoscale deployment target
- **Asset Serving**: Static file serving from build directory

### Environment Configuration
- **Database URL**: Required for PostgreSQL connection
- **Google Maps API**: Optional for enhanced map features
- **Session Management**: PostgreSQL-backed sessions

## Changelog
- June 23, 2025. Initial setup
- June 23, 2025. LocationIQ API integratie en OpenStreetMap implementatie voltooid

## User Preferences

Preferred communication style: Simple, everyday language.