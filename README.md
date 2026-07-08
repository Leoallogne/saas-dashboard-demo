# MoveOps Dashboard 🚛

MoveOps is a premium, enterprise-grade logistics and moving management dashboard built with React. It provides real-time oversight of moving logistics, designed specifically for executive operators and dispatchers.

## ✨ Key Features

1. **Executive Dashboard (Analytics)**
   - High-level KPIs: Total Revenue, Net Profit, Fleet Utilization, and Active Jobs.
   - Interactive charts and quick-access widgets for pipeline and dispatch management.

2. **Job Pipeline (Kanban Board)**
   - Drag-and-drop Kanban board for managing the lifecycle of a move (New Inquiry ➔ Estimate Sent ➔ Scheduled ➔ Completed).
   - Instant profitability insights on job hover.
   - Double-click job cards to reveal comprehensive financial and logistical details.

3. **Fleet Scheduler (Dispatch Grid)**
   - Visual drag-and-drop grid scheduling.
   - Intelligent conflict detection: Visual warnings if multiple jobs are scheduled on the same truck on the same day.
   - **Maintenance Locks:** Mark trucks as under service (`+ Service`) to block dispatching and auto-unassign conflicting jobs.

4. **Financial Audit Ledger**
   - Comprehensive audit table for all completed jobs.
   - Interactive column sorting and pagination.
   - **Reconcile Workflow:** Bulk select and mark jobs as "Reconciled" to prevent double-auditing.
   - Advanced Margin Filters (High, Avg, Low margins) and dynamic visual financial breakdown.
   - One-click invoice receipt viewing.

5. **Live Google Maps Integration**
   - Dual-pane UI for adding new jobs.
   - Smart autocomplete for Origin and Destination addresses using Google Places.
   - Real-time route visualization on an interactive 3D map.

6. **Regional Localization & Multi-Branch**
   - Instantly switch currencies (USD, GBP, AUD) with dynamic calculations applied across the entire app.
   - Create new Branch Divisions with isolated, fresh databases to simulate franchise scaling.

7. **Interactive Manual Book**
   - Built-in, comprehensive user manual located in the Executive Settings.
   - Interactive tab navigation and nested documentation.

## 🚀 Tech Stack

- **Framework:** React + Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **State Management:** React Hooks (useState, useMemo)
- **External APIs:** Google Maps API (Places, Directions, Maps JavaScript API)

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/moveops-dashboard.git
   cd moveops-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

## 🛠 Usage & Demo Data

This application uses local storage to persist state and simulate a database environment. It comes pre-loaded with premium dummy data for presentation purposes.

- **Resetting Data:** To restore the application to its default initial state, click the red **"Reset System Data"** button at the bottom of the Sidebar.
- **Maps API Key:** The application uses a placeholder API key for the Google Maps integration. For full production usage, insert your valid Google Maps API Key in `AddJobModal.jsx`.

## 📄 License

This project is licensed under the MIT License.
