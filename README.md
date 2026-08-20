# MechNova 2026

MechNova is the event operations platform for the Robotics & Automation Club at VIT Chennai. It brings registration, a timed team quiz, theme bidding, deterministic allocation, public results, and live event administration into one responsive web application.

## What it includes

- Public event landing page, live status board, registration, and theme reveal
- Team access with Firebase Authentication
- Synchronized, two-phase quiz sessions with a persistent score ledger
- Ranked theme preferences and score-prioritized seat allocation
- Team result publishing and printable registration credentials
- Admin controls for event phases, questions, themes, registrations, allocations, homepage content, and audit history
- Real-time updates backed by Cloud Firestore
- Responsive React interface with accessible dialogs, loading states, and reduced-motion support

## Technology

- React 18 and Vite 5
- Tailwind CSS
- Firebase Authentication, Cloud Firestore, Cloud Functions, and Hosting
- React Router
- Lucide icons and Three.js visuals

## Project structure

```text
src/
  components/      Public, participant, quiz, admin, and shared UI
  context/         Authentication and live event state
  hooks/           Event clock and quiz session hooks
  services/        Firebase and application data services
  utils/           Formatting and credential helpers
functions/         Firebase callable functions
firestore.rules    Firestore authorization rules
firebase.json      Firebase hosting, functions, and emulator configuration
```

## Local development

### Requirements

- Node.js 18
- npm
- Firebase CLI for emulator or deployment workflows

### Setup

```bash
git clone https://github.com/AUTO-VIT/Mechnova_2026.git
cd Mechnova_2026
npm install
npm --prefix functions install
```

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Use local Firebase services when true.
VITE_USE_EMULATORS=false

# Use deployed callable functions when true; otherwise the app uses its
# Firestore-backed development adapter.
VITE_USE_CLOUD_FUNCTIONS=true
```

Environment files, local credentials, logs, build output, and dependencies are excluded from Git.

Start the frontend:

```bash
npm run dev
```

The Vite development server is available at `http://localhost:5173`.

To run against the Firebase Emulator Suite, set `VITE_USE_EMULATORS=true`, then start the configured emulators in a second terminal:

```bash
firebase emulators:start --only auth,functions,firestore,hosting
```

## Application routes

| Route | Purpose |
| --- | --- |
| `/` | Public event overview |
| `/status` | Live event status |
| `/themes` | Revealed themes |
| `/register` | Team registration |
| `/login` | Team access |
| `/quiz` | Timed quiz |
| `/bidding` | Ranked theme bidding |
| `/results` | Published allocations |
| `/admin/login` | Administrator sign-in |
| `/admin` | Event control room |

## Build and deployment

Create a production build:

```bash
npm run build
```

Deploy the frontend to the Firebase project configured in `.firebaserc`:

```bash
firebase deploy --only hosting
```

When backend code, Firestore rules, or indexes change, deploy those targets as well:

```bash
firebase deploy --only functions,firestore:rules,firestore:indexes
```

## Security notes

- Administrator authorization is enforced with Firebase custom claims and Firestore Security Rules.
- Client-side Firebase configuration identifies the Firebase project; it does not replace authentication or database authorization.
- Never commit service-account keys, `.env` files, exported credentials, or test access codes.
- Review `firestore.rules` and test sensitive workflows with the Emulator Suite before deploying authorization changes.

## License

Copyright 2026 Robotics & Automation Club, VIT Chennai. All rights reserved.
