# Seoulbound '28 — GKS Study Command Center

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Workbox_Offline-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> A mission-critical, offline-first Progressive Web App (PWA) engineered by a Nigerian Computer Science / AI applicant to systematically conquer the **Global Korea Scholarship (GKS 2028 cycle)** across Korean language (TOPIK), English (IELTS), Document Legalization, and Machine Learning portfolio development.

---

## 🎯 Purpose & Genesis

Applying for the Global Korea Scholarship (GKS) through the **Embassy Track (Korean Embassy in Abuja, Nigeria)** or the direct **University Track** is one of the most competitive academic pursuits in the world. Selection committees evaluate applicants not merely on grades, but on **demonstrated grit, autonomous self-discipline, and structured problem-solving**.

Rather than managing a multi-year scholarship marathon with scattered spreadsheets and notes, **Seoulbound '28** was engineered from the ground up as a dedicated command center:
1. **Daily Execution Cockpit:** Quantifies daily study blocks, builds habit streaks, manages exam registration finances in Nigerian Naira (₦), and guards critical deadlines.
2. **Living Proof of Engineering Maturity:** Serves as a public, deployed portfolio centerpiece demonstrating full-stack TypeScript architecture, offline PWA engineering, and clean design.

---

## 🗺️ The Four Strategic Tracks

The application coordinates four synchronized preparation tracks:

| Track | Focus | Key Objective | Milestone Target |
| :--- | :--- | :--- | :--- |
| 🇰🇷 **Korean (한국어)** | TOPIK I & II Preparation | Acquire TOPIK Level 3–4 for maximum selection preference points and degree fast-tracking. | TOPIK II (July / October 2027) |
| 🇬🇧 **English (영어)** | IELTS Academic | Attain Band 6.0+ to substantiate international academic qualifications. | Sit IELTS (August 2027) |
| 🏛️ **GKS Nigeria (장학금)** | Embassy Track Dossier | Coordinate legalization via NPC, Federal Ministry of Education, Foreign Affairs (MFA), and Consular Authentication in Abuja. | Window opens ~Sept 15, 2027 |
| 🐍 **Python / ML (코딩)** | CS / AI Portfolio | Build and deploy two complete machine learning systems to substantiate research potential in Korea. | 2 Deployed ML Applications |

---

## ✨ Engineering & Architectural Highlights

### 1. Offline-First Progressive Web App (PWA)
* Built on `vite-plugin-pwa` with custom Workbox runtime caching strategies:
  * **Navigation Requests:** `NetworkFirst` with seamless fallback to cached application shell.
  * **Static Assets:** `CacheFirst` strategy for JavaScript, stylesheets, fonts, and icons.
* Fully installable on iOS, Android, macOS, and Windows with standalone display mode.

### 2. Multi-Layered Data Protection & Disaster Recovery
* **Dual-Key Snapshot Mirroring:** In addition to active storage (`seoulbound28.v1`), the app maintains a rolling disaster-recovery mirror (`seoulbound28.snapshot`).
* **Automated Backup Overdue Detection:** If 30 days elapse without a backup or new records are created, a non-intrusive warning banner prompts the user to download an offline backup.
* **Portable JSON Snapshots:** One-click full export and schema-validated import with **Merge** (non-destructive) or **Replace** modes.
* **CSV Data Portability:** Instant spreadsheet downloads for both the **Study Log** and the **Financial Ledger**.

### 3. Recharts Multi-Track Study Analytics
* Dynamic stacked bar visualization tracking daily study allocation across all four tracks.
* 7-day and 14-day window toggles with daily averages and focus-track detection.
* Custom tooltip rendering exact minutes and hours per subject.

### 4. Cultural & Ergonomic Aesthetics (*Hanji & Dancheong*)
* **Palette:** Grounded in warm Korean handmade paper (*Hanji* `#f6efe3`), ink charcoal typography, and traditional *Dancheong* architectural hues (Korean Red `#c8393f`, Navy `#2e5e8c`, and Sage `#84a59d`).
* **Micro-interactions:** Integrated Sonner toasts with authentic Korean encouragement phrases (*"수고하셨습니다!"*, *"꾸준함이 답이다"*).
* **Currency Localization:** Native Nigerian Naira (`₦ NGN`) financial tracker with user-switchable `USD ($)` and `KRW (₩)` formats.

---

## 🏗️ Repository Architecture

```
seoulbound-28/
├── public/
│   └── icons/                # PWA icons (192px, 512px, maskable, SVG)
├── src/
│   ├── components/
│   │   ├── BackupBanner.tsx  # 30-day data safety reminder banner
│   │   ├── FundsView.tsx     # Exam savings ledger (IELTS, TOPIK, Legalization)
│   │   ├── LogView.tsx       # Recharts analytics and study logging
│   │   ├── RoadmapView.tsx   # GKS milestone timeline and track cards
│   │   ├── RoundCheck.tsx    # Accessible SVG checkbox component
│   │   ├── SettingsModal.tsx # Data backup, JSON restore, and date calibration
│   │   ├── Taegeuk.tsx       # Vector Taegeuk roundel symbol
│   │   ├── TasksView.tsx     # Track-filtered daily task checklist
│   │   ├── TodayView.tsx     # Runway progress gauge, streak, and daily quotes
│   │   └── ui/               # Core Radix UI / Tailwind primitives
│   ├── lib/
│   │   ├── backup.ts         # JSON validation, CSV generators, and backup engine
│   │   ├── cheer.ts          # Authentic Korean encouragement phrases
│   │   ├── data.ts           # GKS timeline constants, default goals, and phrases
│   │   ├── store.tsx         # Context-based reactive state machine with recovery
│   │   ├── types.ts          # Strongly typed domain entities
│   │   └── utils.ts          # Tailwind class merger utility
│   ├── App.tsx               # Root view router and shell layout
│   ├── main.tsx              # Application entry point
│   └── index.css             # Hanji theme design tokens and font typography
├── tailwind.config.js        # Theme color definitions and animation keyframes
├── vite.config.ts            # Vite & Workbox PWA configuration
└── package.json              # Dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js:** v18.0.0 or higher
* **npm:** v9.0.0 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/seoulbound-28.git

# Navigate into the project directory
cd seoulbound-28

# Install dependencies
npm install

# Start the local development server
npm run dev
```

The application will be running live at `http://localhost:3000/`.

### Production Build & Linting

```bash
# Run TypeScript compilation and Vite production build
npm run build

# Run ESLint validation
npm run lint

# Preview the production build locally
npm run preview
```

---

## 📝 Statement for the GKS Selection Committee

> *"Consistency is the answer. (꾸준함이 답이다.)*  
> *In preparation for my studies in South Korea, I designed and built this application to enforce daily accountability across Korean language acquisition, research literature review, and academic fund management. It reflects the dedication, independence, and technical rigor I will bring to graduate study in the Republic of Korea."*

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
