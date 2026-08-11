# TailorEase Pro

A modern, multi-tenant SaaS platform for tailoring businesses to manage orders, customers, payments, and operations with precision.

## Overview

TailorEase Pro is a comprehensive order and business management system built for tailoring shops. It enables seamless order tracking from intake to delivery, with integrated payment management, customer relationship tracking, and staff administration.

**Key Highlight:** Built as a true multi-tenant SaaS where each tailoring business operates in complete isolation with full tenant data segregation.

## Core Features

### 📦 Order Management
- **Complete Order Lifecycle** - Track orders through 5 stages: Received → Cutting → Sewing → Finishing → Completed
- **Order Status Flow** - Interactive timeline visualization with quick navigation and confirmation dialogs
- **Order Search & Filters** - Find orders by title, customer, status, or due date
- **Order Amendments** - Create linked amendments for completed orders without losing original order details
- **Quick Order Duplication** - Clone past orders for repeat customers and update measurements as needed

### 💰 Payment Tracking
- **Flexible Payment Recording** - Log partial or full payments against orders
- **Auto-calculated Payment Status** - Automatically track UNPAID, PARTIAL, or PAID status
- **Payment History** - Complete audit trail of all payments with timestamps and methods
- **Balance Calculation** - Real-time calculation of remaining balance due

### 📄 Invoice System
- **One-Page Invoices** - Clean, professional invoice generation
- **Printable Format** - Direct print-to-PDF support for customer handoff
- **Complete Details** - Shows order info, customer details, measurements, and payment history

### 📐 Measurements & Customer Management
- **Editable Measurements** - Update customer measurements without creating new records
- **Measurement Templates** - Predefined templates for different garment types
- **Customer Database** - Comprehensive customer profiles with contact info and measurement history
- **Measurement Tracking** - Full audit trail of measurement changes over time

### 📅 Due Date Management
- **Order Deadlines** - Set and track due dates for every order
- **Urgency Indicators** - Visual urgency badges (On Track, Due Soon, Overdue) with color coding
- **Dashboard Overview** - See orders due in the next 3 days at a glance
- **Smart Sorting** - Sort orders by due date to prioritize workflow

### 👥 Multi-Tenant Architecture
- **Complete Data Isolation** - Each company's data is completely segregated
- **Tenant-Scoped Queries** - All database queries automatically filter by companyId
- **Company Administration** - Each tenant has independent company settings and staff
- **Scalable Infrastructure** - Built to handle multiple independent businesses

### 👨‍💼 Staff & Access Management
- **Role-Based Access** - SUPER_ADMIN (full access) and STAFF (limited dashboard access)
- **Staff Approval Workflow** - Admins approve new staff members before dashboard access
- **Activity Logging** - Complete audit trail of all staff actions
- **Staff Suspension** - Admins can suspend staff without deleting records

### 🎯 Admin Dashboard
- **KPI Overview** - At-a-glance metrics: Customers, Active Orders, Staff, Pending Approvals
- **Order Pipeline** - Visual pipeline showing order count by stage
- **Due Soon Orders** - Prioritized list of orders due within 3 days
- **Recent Activity** - Log of all platform activities with timestamps
- **Pending Staff** - Review and approve/reject pending staff members
- **Company Management** - Monitor and manage all registered companies

### 🔐 Authentication & Security
- **Secure Login** - Email-based login with bcrypt password hashing
- **Forgot Password** - Token-based password reset with email verification
- **Session Management** - Secure session cookies with automatic expiration
- **Account Verification** - Email verification for new accounts

## Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router and server actions
- **React 19** - Latest React with hooks and concurrent features
- **TypeScript** - Full type safety across the codebase
- **TailwindCSS** - Utility-first CSS for responsive design
- **Server Actions** - Form handling and mutations without API routes

### Backend
- **Node.js** - Runtime environment
- **Prisma ORM 7** - Type-safe database access with migrations
- **PostgreSQL** - Relational database with full ACID compliance

### Infrastructure & Services
- **Supabase Storage** - File uploads for order photos and documents
- **SendByte Email API** - Transactional emails (password reset, notifications)
- **Vercel** - Deployment and hosting (serverless)

### Security & Auth
- **bcryptjs** - Password hashing and verification
- **Crypto tokens** - Secure password reset tokens with expiration

## Architecture Highlights

### Multi-Tenant Data Model
```
Company (tenant)
├── Staff (employees)
├── Customers
├── Orders
│   ├── Measurements
│   ├── Payments
│   ├── Photos
│   ├── Amendments (linked orders)
│   └── Status History
└── Activity Logs
```

### Data Isolation Strategy
- Every query includes `companyId` filter
- No cross-tenant data leakage possible
- Each user belongs to exactly one company
- Session includes companyId for automatic scoping

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Git

### Installation

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd tailorease-pro
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/tailorease
NEXT_PUBLIC_APP_URL=http://localhost:3000
SENDBYTE_API_KEY=your_api_key_here
```

4. **Run database migrations:**
```bash
npx prisma migrate dev
```

5. **Start the development server:**
```bash
npm run dev
```

6. **Open the app:**
- Navigate to [http://localhost:3000](http://localhost:3000)
- Register a new company
- Create your first order

## Project Structure

```
app/
├── dashboard/          # Main SaaS application
│   ├── orders/        # Order management
│   ├── customers/     # Customer management
│   ├── profile/       # Staff profile & settings
│   ├── staff/         # Staff management (admin)
│   ├── company/       # Company settings (admin)
│   └── activity/      # Activity logs
├── admin/             # Platform admin dashboard
├── invoice/           # Invoice generation & display
├── login/             # Authentication
├── forgot-password/   # Password reset flow
├── register/          # Company & staff registration
└── libs/              # Shared utilities
    ├── prisma.ts      # Database client
    ├── auth.ts        # Authentication helpers
    ├── email.ts       # Email service
    ├── tokenCleanup.ts # Token cleanup utility
    └── orderUrgency.ts # Due date urgency calculation

prisma/
├── schema.prisma      # Data models & relationships
└── migrations/        # Database migration history
```

## Key Features Deep Dive

### Order Status Flow
Orders flow through a 5-stage process with complete visibility:
- **Received** - Initial intake and quote
- **Cutting** - Garment cutting phase
- **Sewing** - Main sewing work
- **Finishing** - Final touches and quality check
- **Completed** - Ready for customer pickup

Staff can navigate to any stage directly or use quick action buttons for back/forward movement.

### Payment System
- Record individual payments at any time
- System automatically calculates balance due
- Payment status updates in real-time:
  - **UNPAID** - No payment received
  - **PARTIAL** - Some payment received, balance outstanding
  - **PAID** - Full payment received

### Order Amendments
- Create amendments only from completed orders
- Amendments are linked to original orders but operate independently
- Track amendment history for each original order
- Amendments start as new RECEIVED orders

## Deployment

### Deploy to Vercel

1. **Push to GitHub:**
```bash
git add .
git commit -m "deployment ready"
git push
```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables
   - Click Deploy

3. **Run database migrations on production:**
```bash
npx prisma migrate deploy
```

4. **Set up custom domain** (optional)
   - Add your domain in Vercel project settings
   - Configure DNS records as instructed

## Performance & Security

### Caching Strategy
- Uses Next.js built-in caching with `revalidatePath` and `revalidateTag`
- Automatic Incremental Static Regeneration (ISR)
- Server-side caching for frequently accessed data

### Security Measures
- All passwords hashed with bcryptjs
- Secure password reset tokens with expiration
- CSRF protection via Next.js server actions
- SQL injection prevention via Prisma ORM
- Automatic tenant data isolation

### Database
- PostgreSQL with full ACID compliance
- Automatic migrations with Prisma
- Indexed queries for performance
- Transaction support for multi-step operations

## Future Enhancements

Planned features for future releases:
- Redis caching for high-scale deployments
- Automated email notifications for order status changes
- SMS notifications for customers
- Advanced analytics and reporting dashboard
- Bulk order import/export
- Custom measurement templates per company
- Appointment scheduling system
- Mobile app (iOS/Android)

## Support & Contribution

For bug reports, feature requests, or contributions, please open an issue or pull request on GitHub.

## License

This project is proprietary software. All rights reserved.

---

Built with ❤️ for tailoring businesses worldwide.
