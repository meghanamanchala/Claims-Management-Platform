# ClaimFlow — Minimal Claims Management Platform

> A modern, full-stack claims management platform for patients to submit & track health insurance claims and insurers to review, approve, or reject claims with custom approved amounts and comments.

---

## Key Features

### Patient Portal
- **Submit Claims**: Easy submission form capturing Name, Email, Claim Amount, Description, and File Upload (Receipt / Medical Prescription).
- **Track Claims Dashboard**: Real-time tracking of submitted claims with live status indicators (`PENDING`, `APPROVED`, `REJECTED`).
- **Detailed Insights**: View approved payout amounts, insurer review comments, submission dates, and uploaded document previews.

### Insurer Portal
- **Metrics Overview**: Real-time stats on total claims, pending reviews, approved claims, rejected claims, and total payout disbursed.
- **Advanced Filtering & Search**: Filter by status (`PENDING`, `APPROVED`, `REJECTED`), search by patient name/email/ID, and filter by claim amount range or date.
- **Manage & Review Modal**:
  - View claim breakdown & inline document preview/download.
  - Approve or Reject claims with custom Approved Amounts and Insurer Review Comments.

---

## Repository Structure

```
Claims-Management-Platform/
├── backend/                  # NestJS Node.js Server & MongoDB Mongoose API
│   ├── src/
│   │   ├── claims/           # Claims Module (Controller, Service, Schema, DTOs)
│   │   ├── auth/             # Auth Module & User Schema
│   │   ├── app.module.ts     # Main NestJS Application Module
│   │   └── main.ts           # Server Entry point (CORS, Static Uploads, Validation)
│   ├── package.json
│   └── tsconfig.json
├── frontend/                 # React + Vite + Tailwind CSS Application
│   ├── src/
│   │   ├── components/       # UI Components (Navbar, Portals, Modals, Filters)
│   │   │   ├── PatientPortal/
│   │   │   └── InsurerPortal/
│   │   ├── services/         # Axios API Client
│   │   ├── App.jsx           # App Layout & Navigation
│   │   └── index.css         # Styling & Design Tokens
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Quick Start Guide

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **MongoDB**: MongoDB Atlas connection string or local MongoDB instance.

---

### 1. Backend Setup (NestJS + MongoDB)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start backend server in development mode
npm run start:dev
```

The NestJS backend API will run on `http://localhost:5000/api`.

---

### 2. Frontend Setup (React + Vite + Tailwind CSS)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## API Reference

### Claims Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/claims` | Submit a new claim with file upload (`multipart/form-data`) |
| `GET` | `/api/claims` | Fetch all claims (Supports query params: `status`, `search`, `email`) |
| `GET` | `/api/claims/:id` | Fetch claim details by ID |
| `PATCH` | `/api/claims/:id/review` | Update claim status (`APPROVED`/`REJECTED`), `approvedAmount`, and `insurerComments` |
| `GET` | `/api/claims/stats/summary` | Get aggregated claims dashboard metrics |

---

## License
MIT License. Built for the Kalvium Full-Stack Challenge.
