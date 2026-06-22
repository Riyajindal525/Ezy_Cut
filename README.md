# ✂️ EzyCut – Salon Booking & Queue Management Platform

EzyCut is a full-stack salon appointment booking and queue management platform that helps customers discover salons, book appointments, make online payments, track queue positions in real-time, and review services.

The platform also provides dedicated dashboards for Salon Owners and Administrators to manage salons, services, bookings, payments, queues, and analytics.

---

# 🚀 Features

## Customer Features

- User Registration & Login
- Browse Salons
- Search & Filter Salons
- View Salon Details
- View Available Services
- Check Available Time Slots
- Book Appointments
- Online Payments via Razorpay
- Queue Tracking
- Booking History
- Reviews & Ratings
- Notifications
- Profile Management

---

## Salon Owner Features

- Owner Authentication
- Create & Manage Salon
- Add/Edit/Delete Services
- Manage Bookings
- Queue Management
- Customer Tracking
- Revenue Dashboard
- Payment Tracking
- Salon Analytics
- Profile Management

---

## Admin Features

- Admin Dashboard
- User Management
- Salon Management
- Salon Approval System
- Payment Monitoring
- Platform Analytics
- Revenue Monitoring
- Review Monitoring

---

# 🏗️ System Architecture

```text
Frontend (React + Vite)
        │
        ▼
Axios API Layer
        │
        ▼
Express Routes
        │
        ▼
Controllers
        │
        ▼
Services
        │
        ▼
MongoDB Database
```

---

# 🛠️ Tech Stack

## Frontend

- React.js
- Vite
- React Router DOM
- Axios
- Zustand
- Tailwind CSS
- Shadcn UI
- Lucide React

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Bcrypt
- Razorpay

## Database

- MongoDB Atlas

## Payment Gateway

- Razorpay

---

# 📂 Project Structure

## Frontend

```text
frontend/
│
├── src/
│   ├── api/
│   ├── assets/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   ├── routes/
│   ├── store/
│   ├── services/
│   ├── hooks/
│   ├── utils/
│   └── App.jsx
│
├── public/
├── package.json
└── vite.config.js
```

---

## Backend

```text
backend/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── validations/
│   ├── sockets/
│   ├── jobs/
│   ├── utils/
│   ├── app.js
│   └── server.js
│
├── package.json
└── .env
```

---

# 👥 User Roles

## Customer

Can:

- Register/Login
- Browse salons
- Book appointments
- Pay online
- Join queue
- Track queue
- Review salons

---

## Salon Owner

Can:

- Manage salon
- Manage services
- View bookings
- Manage queue
- View payments
- View analytics

---

## Admin

Can:

- Manage users
- Manage salons
- Approve salons
- View payments
- Monitor platform

---

# 🔐 Authentication

The platform uses:

- JWT Access Tokens
- JWT Refresh Tokens
- Password Hashing (bcrypt)

Protected APIs require:

```http
Authorization: Bearer <token>
```

---

# 📊 Database Collections

## Users

Stores:

- Customer Accounts
- Salon Owner Accounts
- Admin Accounts

---

## Salons

Stores:

- Salon Information
- Owner Details
- Ratings
- Services

---

## Services

Stores:

- Service Name
- Duration
- Price
- Salon Reference

---

## Bookings

Stores:

- Customer
- Salon
- Service
- Appointment Time
- Status

---

## Payments

Stores:

- Razorpay Order
- Razorpay Payment
- Amount
- Status

---

## Queue

Stores:

- Queue Token
- Position
- Estimated Wait Time

---

## Reviews

Stores:

- Rating
- Review
- Customer
- Salon

---

## Notifications

Stores:

- Notification Type
- Message
- Read Status

---

# 📅 Booking Lifecycle

```text
Select Salon
      │
      ▼
Select Service
      │
      ▼
Choose Slot
      │
      ▼
Create Payment Order
      │
      ▼
Payment Success
      │
      ▼
Booking Created
      │
      ▼
Booking Confirmed
      │
      ▼
Service Completed
```

---

# 🎟️ Queue Lifecycle

```text
Booking Created
      │
      ▼
Join Queue
      │
      ▼
Generate Token
      │
      ▼
Calculate Position
      │
      ▼
Track Queue
      │
      ▼
Service Started
      │
      ▼
Service Completed
```

---

# 💳 Payment Flow

```text
Create Razorpay Order
        │
        ▼
Customer Payment
        │
        ▼
Payment Verification
        │
        ▼
Store Payment
        │
        ▼
Create Booking
```

---

# ⭐ Review Flow

```text
Booking Completed
       │
       ▼
Customer Submits Review
       │
       ▼
Validate Booking
       │
       ▼
Store Review
       │
       ▼
Update Salon Rating
```

---

# 🔔 Notification Types

Supported notifications:

- Booking Created
- Booking Confirmed
- Booking Cancelled
- Queue Updates
- Payment Updates
- Review Notifications
- System Notifications

---

# 🌐 API Modules

## Auth APIs

```http
/api/auth
```

## Salon APIs

```http
/api/salons
```

## Service APIs

```http
/api/services
```

## Booking APIs

```http
/api/bookings
```

## Queue APIs

```http
/api/queue
```

## Payment APIs

```http
/api/payments
```

## Review APIs

```http
/api/reviews
```

## Notification APIs

```http
/api/notifications
```

## Admin APIs

```http
/api/admin
```

---

# ⚙️ Environment Variables

## Backend (.env)

```env
NODE_ENV=development

PORT=5000

MONGODB_URI=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

CLIENT_URL=
```

---

## Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

---

# ▶️ Installation

## Clone Repository

```bash
git clone <repository-url>
```

---

## Backend Setup

```bash
cd backend

npm install

npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# 🧪 Testing Checklist

## Customer

- Register
- Login
- Browse salons
- Book service
- Pay successfully
- Join queue
- Track queue
- Submit review

---

## Salon Owner

- Login
- Create salon
- Add services
- View bookings
- Start service
- Complete service
- View revenue

---

## Admin

- Login
- View users
- View salons
- Approve salons
- View payments
- View analytics

---

# 🚀 Deployment

## Backend

```bash
npm install
npm run build
npm start
```

---

## Frontend

```bash
npm install
npm run build
```

Deploy:

- Vercel
- Netlify
- AWS
- Render

---

# 🔮 Future Enhancements

- Real-time Socket.IO Notifications
- Loyalty Program
- Coupon System
- Membership Plans
- Multi-Salon Ownership
- Google Maps Integration
- AI-Based Wait Time Prediction
- Mobile Application

---

# 👨‍💻 Developer Notes

Business Critical Modules:

1. Authentication
2. Booking Management
3. Queue Management
4. Razorpay Payments
5. Salon Ownership Validation
6. Review System

Before making changes:

- Understand booking flow
- Understand queue lifecycle
- Understand payment verification
- Test role-based permissions

---

# 📄 License

This project is developed as the **EzyCut Salon Booking & Queue Management Platform**.

All rights reserved.