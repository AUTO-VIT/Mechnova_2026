# MECHNOVA // 2026
**Autonomous Systems & Intelligent Control Platform**

The next-generation mission control and evaluation platform for engineering teams. Mechnova 2026 provides an authoritative, deterministic environment for competitive robotics evaluation, registration, theme bidding, and real-time telemetry.

---

## 🚀 Core Features

- **Team Roster Portal**: Secure authentication and team verification system.
- **Timed Two-Phase Quiz Verification**: A competitive quiz arena where teams earn priority points under strict timed conditions.
- **Sealed Theme Reveals & Deterministic Bidding**: Teams use their earned points to bid on high-priority engineering domains and themes.
- **Mission Control / Admin Dashboard**: Live, real-time command center for administrators to dictate event phases, open/close registration windows, and broadcast bulletins.
- **Dynamic CMS System**: Firestore-driven content management allows administrators to update mission briefings, UI copy, and status badges on the fly.
- **Particle Visualization**: High-performance cyber-physical aesthetic with a custom 3D Stardust and Cosmic Wireframe background canvas.

## 🛠 Tech Stack

- **Frontend Core**: React 18 (via Vite)
- **Styling**: Tailwind CSS, Lucide Icons
- **Backend & Database**: Firebase (Authentication, Firestore Realtime Database)
- **Routing**: React Router DOM
- **Deployment**: Vercel / Firebase Hosting (Recommended)

## 📦 Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AUTO-VIT/Mechnova_2026.git
   cd Mechnova_2026
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root of the project and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the local development server:**
   ```bash
   npm run dev
   ```
   The application will boot up at `http://localhost:5173`.

## 🔒 Authentication & Administration

Admin access is controlled via Firebase custom claims or by strictly matching whitelisted Admin UID arrays within the Firestore configurations.
Ensure you update the database rules to prevent unauthorized execution of administrative capabilities.

## 📜 License

© 2026 MECHNOVA // ROBOTICS & AUTOMATION PLATFORM. ALL RIGHTS RESERVED.
