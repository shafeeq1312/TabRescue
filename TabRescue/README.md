# TabRescue – Smart Browser Session Recovery Platform

> A production-grade browser session management and crash-recovery platform built with the **MERN Stack** (MongoDB, Express, React, Node.js) and a **Google Chrome Extension (Manifest V3)**.

---

## 1. Project Overview

Users frequently lose critical browser tabs when Google Chrome crashes, closes accidentally, or laptops reboot. TabRescue solves this by:
- Capturing all eligible tabs from the active browser window with 1-click.
- Organizing tabs into smart categories (*Development, Learning, Research, Work, Entertainment, Personal, Others*).
- Filtering out internal schemes (`chrome://`, `about:`, `file://`, Chrome Web Store) and deduplicating URLs.
- Running debounced background auto-save snapshots to prevent data loss.
- Restoring all tabs in their exact original order with a single click.

> **Privacy & Security Guarantee:** TabRescue strictly stores tab URLs and metadata — never page contents, cookies, session storage, or user credentials.

---

## 2. Technology Stack

### Frontend
- **Framework:** React.js 18 + Vite
- **Language:** JavaScript (ES Modules)
- **Styling:** Tailwind CSS (Dark Navy / Slate theme with Electric Blue & Purple accents)
- **Routing:** React Router DOM (v6)
- **Icons:** React Icons (`react-icons/fi`)
- **Charts & Visualization:** Recharts
- **Networking:** Native Fetch API with JWT Bearer injection

### Backend
- **Runtime:** Node.js (ES Modules)
- **Server:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens) with 7-day expiration + bcryptjs password hashing (salt 10)
- **Security:** Express Rate Limit, CORS protection, URL sanitization & deduplication
- **Config:** dotenv

### Google Chrome Extension
- **Manifest:** Manifest V3 (`tabs`, `storage`, `activeTab`, `alarms`)
- **Service Worker:** `background.js` with debounced tab change listeners (`onCreated`, `onRemoved`, `onUpdated`)
- **Popup UI:** Modern dark SaaS interface (`popup.html`, `popup.css`, `popup.js`)
- **Storage:** `chrome.storage.local` for offline token and auto-save state

---

## 3. Project Folder Structure

```
TabRescue/
  frontend/
    public/
      favicon.svg
    src/
      components/
        common/
          Badge.jsx
          Button.jsx
          Input.jsx
          LoadingSpinner.jsx
          Modal.jsx
          ProtectedRoute.jsx
        dashboard/
          CreateSessionModal.jsx
          DeleteConfirmModal.jsx
          EditSessionModal.jsx
          RestoreModal.jsx
          SessionCard.jsx
          SnapshotCard.jsx
          StatCard.jsx
        layout/
          DashboardLayout.jsx
          Footer.jsx
          Navbar.jsx
          Sidebar.jsx
      context/
        AuthContext.jsx
        ToastContext.jsx
      pages/
        AllSessionsPage.jsx
        CategoriesPage.jsx
        Dashboard.jsx
        LandingPage.jsx
        LoginPage.jsx
        NotFoundPage.jsx
        ProfilePage.jsx
        RegisterPage.jsx
        SessionDetailsPage.jsx
        SettingsPage.jsx
      services/
        api.js
      App.jsx
      index.css
      main.jsx
    .env
    .env.example
    index.html
    package.json
    postcss.config.js
    tailwind.config.js
    vite.config.js

  backend/
    config/
      db.js
    controllers/
      authController.js
      sessionController.js
      snapshotController.js
    middleware/
      auth.js
      errorHandler.js
      rateLimiter.js
    models/
      BrowserSnapshot.js
      Session.js
      User.js
    routes/
      authRoutes.js
      sessionRoutes.js
      snapshotRoutes.js
    utils/
      urlValidator.js
    .env
    .env.example
    package.json
    seed.js
    server.js

  extension/
    icons/
      icon16.png
      icon32.png
      icon48.png
      icon128.png
      icon.svg
    background.js
    generate-icons.js
    manifest.json
    popup.css
    popup.html
    popup.js

  package.json
  README.md
```

---

## 4. Quick Start & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally on port 27017, or a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) connection URI.

### Step 1: Install Backend Dependencies
```bash
cd TabRescue/backend
npm install
```

### Step 2: Configure Backend Environment
A `.env` file is pre-configured with default local development values:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tabrescue
JWT_SECRET=tabrescue_super_secure_jwt_secret_key_2026_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Step 3: (Optional) Seed Sample Data
Populate the database with a test user and sample categorized sessions:
```bash
npm run seed
```
> **Default Test Credentials:**
> - Email: `demo@tabrescue.dev`
> - Password: `TabRescue@2026`

### Step 4: Start Backend Server
```bash
npm run dev
# Server will run at: http://localhost:5000
# Health check: http://localhost:5000/api/health
```

### Step 5: Install & Start Frontend
In a new terminal:
```bash
cd TabRescue/frontend
npm install
npm run dev
# Frontend runs at: http://localhost:5173
```

---

## 5. Google Chrome Extension Setup

1. Open **Google Chrome** and navigate to:
   ```
   chrome://extensions
   ```
2. Enable **Developer mode** in the top-right corner.
3. Click the **Load unpacked** button.
4. Select the `TabRescue/extension` folder.
5. TabRescue will appear in your extensions list. Click the **puzzle icon** in Chrome and **pin** TabRescue to your toolbar.

---

## 6. Extension Connection to Web Account

You can connect the extension in two secure ways:

### Option A: Direct Extension Login (Recommended)
1. Click the TabRescue icon in your Chrome toolbar.
2. Go to the **Settings** tab.
3. Enter your TabRescue email and password.
4. Click **Connect Account**. The status will switch to `Connected`.

### Option B: Web Token Handoff
1. Log in to the TabRescue web app at `http://localhost:5173`.
2. Navigate to **Settings** (`/settings`).
3. Click **Copy Token** under *Your Extension Sync Token*.
4. Open the Extension popup > **Settings**, paste the token into *Extension Token*, and click **Connect via Token**.

---

## 7. End-to-End Workflow Testing

### Test 1: Capture & Save Session
1. Open 4-5 sample websites in Google Chrome (e.g. `react.dev`, `github.com`, `tailwindcss.com`).
2. Click the TabRescue extension icon.
3. Review the active tab count and preview list.
4. Enter a session name (or keep the smart auto-suggested name).
5. Choose a category (e.g. `Development`).
6. Click **Save Current Session**.
7. Navigate to the web dashboard (`http://localhost:5173/dashboard`).
8. Verify the new session immediately appears with favicon previews, category badge, and tab count!

### Test 2: Restore Browser Session
1. In the Web Dashboard or Extension popup, locate the saved session.
2. Click **Restore Tabs** (or **Restore Session**).
3. All tabs open in their original order.
4. The dashboard updates `lastRestoredAt` timestamp.

### Test 3: Auto-Save Crash Protection Snapshot
1. In the Extension popup, go to **Settings** and toggle **Auto-Save Snapshots** to ON.
2. Open, close, or navigate between tabs in Chrome.
3. Wait 4 seconds for the debouncer to settle.
4. In the Web Dashboard, the **Latest Auto-Saved Browser Snapshot** card updates with the latest tab count and timestamp.
5. Click **Restore Snapshot** to verify instantaneous recovery.

---

## 8. Backend REST API Reference

All protected endpoints require `Authorization: Bearer <JWT_TOKEN>`.

### Authentication Endpoints
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Authenticate user & get JWT | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Private |
| `PUT` | `/api/auth/profile` | Update profile name or password | Private |

### Session Endpoints
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/sessions` | Create a new session with tabs | Private |
| `GET` | `/api/sessions` | Get all sessions (category/sort query supported) | Private |
| `GET` | `/api/sessions/search?q=` | Search sessions by name, title, or URL | Private |
| `GET` | `/api/sessions/stats/summary`| Aggregated metrics & category distribution | Private |
| `GET` | `/api/sessions/:id` | Get individual session details | Private |
| `PUT` | `/api/sessions/:id` | Update session details or tab array | Private |
| `DELETE` | `/api/sessions/:id` | Delete session | Private |
| `POST` | `/api/sessions/bulk-delete` | Delete multiple sessions by array of IDs | Private |
| `POST` | `/api/sessions/:id/restore`| Mark session as restored & retrieve tabs | Private |

### Browser Snapshot (Auto-save) Endpoints
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/snapshot` | Upsert latest debounced browser snapshot | Private |
| `GET` | `/api/snapshot` | Get current user's latest snapshot | Private |
| `DELETE` | `/api/snapshot` | Clear latest snapshot | Private |

---

## 9. Cloud Deployment Guide

### Database: MongoDB Atlas
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and whitelist IP `0.0.0.0/0`.
3. Copy your connection URI (`mongodb+srv://<user>:<password>@cluster.mongodb.net/tabrescue`).

### Backend: Render.com
1. Create a **New Web Service** connected to your repository.
2. Set **Root Directory** to `TabRescue/backend`.
3. Set **Build Command** to `npm install`.
4. Set **Start Command** to `node server.js`.
5. Add Environment Variables:
   - `MONGODB_URI`: `<Atlas Connection String>`
   - `JWT_SECRET`: `<Long Random Secret>`
   - `CLIENT_URL`: `https://your-frontend.vercel.app`
   - `NODE_ENV`: `production`

### Frontend: Vercel
1. Import repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `TabRescue/frontend`.
3. Framework Preset: **Vite**.
4. Set Environment Variables:
   - `VITE_API_URL`: `https://your-backend.onrender.com`
5. Deploy.

### Chrome Extension Production Configuration
1. In `TabRescue/extension/popup.js`, set default `apiUrl` to your deployed backend URL.
2. Users can also adjust the backend URL anytime in the extension's Settings tab.

---

## 10. License
MIT License. Built with ❤️ for productive web browsing.
