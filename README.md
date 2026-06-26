# Loan Management System (Frontend)

A modern **Loan Management System Frontend** built using **Next.js 15, TypeScript and Tailwind CSS**.

The application provides separate experiences for **Borrowers** and **Internal Employees**, while sharing a common authentication system with role-based routing.

---

# Getting Started

Clone the repository

```bash
git clone <repository-url>

cd loan-management-system-frontend
```

---

## Install Dependencies

```bash
npm install
```

---

# Environment Variables

Create a `.env.local` file in the project root.

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1

JWT_SECRET=your_backend_jwt_secret
```

> **Important**
>
> `JWT_SECRET` **must match the backend JWT_SECRET** because the frontend performs server-side JWT verification for protected routes.

---

# Running with Local Backend

Start the backend first.

```bash
Backend

npm run dev
```

Then start the frontend.

```bash
npm run dev
```

Frontend

```text
http://localhost:3000
```

Backend

```text
http://localhost:5000
```

---

# Using the Hosted Backend

If you do not want to run the backend locally, simply update your environment variable:

```env
NEXT_PUBLIC_API_BASE_URL=https://loan-management-system-mrye.onrender.com/api/v1
```

Swagger Documentation

```text
https://loan-management-system-mrye.onrender.com/api-docs/
```

---

# Build for Production

```bash
npm run build

npm start
```

---

# Demo Credentials

Use the accounts created by the backend seed script.

| Role         | Email                                               | Password     |
| ------------ | --------------------------------------------------- | ------------ |
| Admin        | [admin@lms.com](mailto:admin@lms.com)               | password@123 |
| Borrower     | [borrower@lms.com](mailto:borrower@lms.com)         | password@123 |
| Sales        | [sales@lms.com](mailto:sales@lms.com)               | password@123 |
| Sanction     | [sanction@lms.com](mailto:sanction@lms.com)         | password@123 |
| Disbursement | [disbursement@lms.com](mailto:disbursement@lms.com) | password@123 |
| Collection   | [collection@lms.com](mailto:collection@lms.com)     | password@123 |

---

# Notes

* Uses **Next.js App Router**.
* Authentication is **JWT-based**.
* Protected routes use **Server Components** for authentication and role validation.
* Business logic resides in the backend; the frontend consumes REST APIs.
* API base URL can be switched between local and hosted backend using environment variables.

---

# Backend

The backend repository provides:

* Authentication
* BRE Validation
* Loan Processing
* Employee Workflows
* Swagger Documentation
* MongoDB Integration

Swagger (Hosted)

```text
https://loan-management-system-mrye.onrender.com/api-docs/
```

---

Developed using **Next.js**, **TypeScript**, **Tailwind CSS**, and **React**.
