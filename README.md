# Vivago Digital OS

Vivago Digital OS is a premium, state-of-the-art internal operating system designed for digital agencies to manage operations, projects, and finances in one unified workspace. This project is currently a high-fidelity UI prototype built with modern web technologies.

## 🚀 Overview

The system provides a comprehensive suite of tools for agency management, featuring a sleek, dark-mode-ready interface with glassmorphism effects and dynamic animations. It is designed to streamline workflow from client onboarding to project delivery and financial reporting.

## ✨ Key Features

### 📊 Operations Dashboard
- **Real-time Stats**: Track active projects, pending payments, and team utilization.
- **Financial Health**: Visualize revenue and cost trends at a glance.

### 📁 Management Modules
- **Projects**: Centralized project tracking with detailed status updates, timelines, and valuation tracking.
- **Clients**: Manage client relationships and historical project data.
- **Team**: A dedicated module for managing team members, roles, and expertise.

### 💰 Financial Tracking
- **Payments**: Track incoming and outgoing payments with detailed breakdowns (given/received).
- **Profit & Loss**: Monitor project-level profitability and company expenses.
- **Invoices**: Manage and generate billing documents.

### ⚡ Action Center & Tools
- **Reminders**: Task management with priority levels and due dates to ensure no deadline is missed.
- **Credentials**: Secure storage for project-related access keys and service endpoints.
- **Files**: Organized storage for project documents and assets.

### 👤 Profile & Security
- **Secure Access**: Multi-step authentication flow (UI Prototype).
- **Personalized Settings**: Manage individual user profiles and preferences.

## 🛠️ Technology Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Hooks (useState, useMemo, useEffect)

## 📁 Project Structure

```text
src/
├── app/                  # App router pages and layouts
│   ├── dashboard/        # Main landing overview
│   ├── projects/         # Project management
│   ├── clients/          # Client CRM
│   ├── team/             # Team management
│   ├── payments/         # Financial tracking
│   ├── reminders/        # Task management
│   └── ...               # Asset and profile modules
├── components/           # Reusable UI primitives and layouts
│   ├── ui/               # shadcn/ui base components
│   └── app-sidebar.tsx   # Global navigation system
├── lib/                  # Utility functions and mock data
└── ...
```

## 🚦 Getting Started

1.  **Clone and Install**:
    ```bash
    npm install
    ```
2.  **Environment Setup**:
    Since this is a UI prototype, no database is required. The `.env` file is primarily for future extensibility.
3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
4.  **Explore**:
    Navigate to `http://localhost:3000`. You can "log in" with any credentials in this prototype version.

---

*Built with ❤️ for Vivago Digital.*