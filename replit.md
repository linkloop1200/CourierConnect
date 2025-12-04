# Spoedpakketjes - Express Delivery Application

## Overview

This is a comprehensive full-stack web application for express package delivery services in the Netherlands, featuring complete Uber-inspired functionality as the primary interface. The system provides a modern Uber-style booking experience, professional driver dashboard, comprehensive user analytics, payment processing system, and advanced routing optimization. The application uses a modern tech stack with React frontend, Express backend, and PostgreSQL database, delivering a complete enterprise-grade delivery platform that fully utilizes all backend functionality.

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

### Core Features - Complete Uber-Inspired Delivery Platform

#### Traditional Interface (Original)
1. **Classic Mobile Interface**: Bottom sheet design with map integration
2. **Standard Delivery Form**: Traditional form-based booking experience
3. **Basic Package Tracking**: Timeline-based delivery status updates
4. **Address Management**: Recent addresses and favorites system

#### Uber-Style Interface (New)
5. **Uber-Inspired Home**: Location picker with service type selection
6. **Dynamic Pricing**: Real-time price estimates based on distance and service
7. **Service Tiers**: Express, Standard, and Eco delivery options
8. **Location Search**: Google Maps-style address autocomplete

#### Driver Experience
9. **Professional Driver Dashboard**: Complete earnings and delivery management
10. **Real-Time Location Updates**: Live GPS tracking and route optimization
11. **Driver Assignment System**: Automatic order matching and acceptance
12. **Performance Analytics**: Ratings, earnings, and completion statistics

#### Advanced Tracking
13. **Live Tracking Interface**: Real-time driver location and ETA updates
14. **Interactive Progress Timeline**: Step-by-step delivery status visualization
15. **Customer-Driver Communication**: In-app calling and messaging
16. **Delivery Completion Flow**: Rating system and reorder functionality

#### Payment Processing System
17. **Multi-Method Payment**: Credit card, iDEAL, Apple Pay, Google Pay integration
18. **iDEAL Integration**: Complete Dutch banking system with all major banks
19. **Secure Payment Flow**: PCI-compliant payment processing with Stripe
20. **Payment Validation**: Real-time card validation and security checks

#### Advanced Routing Optimization
21. **AI Route Planning**: Machine learning-powered route optimization
22. **Multi-Factor Analysis**: Traffic, time windows, fuel efficiency, priorities
23. **Performance Analytics**: CO₂ reduction, cost savings, efficiency metrics
24. **Team Management**: Driver performance tracking and route assignment

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
- June 23, 2025. Embedded OpenStreetMap iframe succesvol geïmplementeerd met overlay markers
- June 23, 2025. Alle 14 geavanceerde functies geïmplementeerd en werkend - complete Spoedpakketjes app
- June 23, 2025. Volledige Uber-geïnspireerde functionaliteit toegevoegd - complete end-to-end bezorgervaring
- June 23, 2025. Payment Processing System en Advanced Routing Optimization geïmplementeerd - complete enterprise-grade delivery platform
- June 23, 2025. Complete transformatie naar Uber-thema als hoofdinterface - alle backend functionaliteit volledig benut in moderne UI
- June 23, 2025. Bottom navigation toegevoegd aan alle pagina's voor consistente gebruikerservaring
- June 23, 2025. Role-switching systeem geïmplementeerd met klant/bezorger/beheerder weergaves en geoptimaliseerde menu breedte
- June 23, 2025. Donkerblauw thema geïmplementeerd voor consistente Nederlandse corporate identity
- June 23, 2025. Autocomplete adressysteem geïmplementeerd met OpenStreetMap Nominatim API - Nederlandse adressen met directe doorschakeling naar hoofdscherm
- June 23, 2025. Optimale bestelflow geïmplementeerd: adressen invoeren → bereken knop → service selectie aangesloten op navigatiebalk
- June 23, 2025. Onthoud functie voor adressen geïmplementeerd - automatische opslag in localStorage met recente adressen lijst
- June 23, 2025. Kaart gefocust op Amsterdam met dynamische iconen - ophaal (groen huis), bezorg (rood pakket), bezorger (paarse scooter) met optimale route weergave
- June 23, 2025. GPS-naar-pixel synchronisatie probleem opgelost - kaart iframe en overlay markers gebruiken nu exact dezelfde bounding box voor perfecte coördinaat positionering
- June 24, 2025. Stabiele marker positionering geïmplementeerd met vaste Amsterdam bounds - iconen blijven op GPS locaties bij zoom wijzigingen en prominente route visualisatie toegevoegd
- June 24, 2025. Kaart interface vereenvoudigd - verwarrende overlay markers verwijderd, alleen stabiele OpenStreetMap markers behouden, eenvoudige legenda linksboven toegevoegd

## User Preferences

Preferred communication style: Simple, everyday language.