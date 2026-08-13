# 🎓 Adyapan Edutech AI Hiring Platform (adyapanHIRING)

Official AI-Powered Recruitment, ATS Resume Scoring, Candidate Management, and Offer Generation Platform for **Adyapan Edutech Pvt. Ltd.**.

---

## 🌟 Key Features

- **⚡ Deterministic Job-Specific ATS Resume Scoring**:
  - Calculates candidate fit score (0–100) strictly based on match between candidate's uploaded resume and specific job requirements (Required Skills, Experience, Education, Projects, Role Relevance).
- **💼 Job & Applicant Pipeline Management**:
  - Full CRUD operations for published jobs, candidate directories, and interview scheduling.
- **📄 Offer Letter Generator & Email Service**:
  - Automated PDF offer letter generation and candidate notification system.
- **🤖 AI Recruitment Copilot Chatbot**:
  - Natural language assistant providing daily live recruitment updates, candidate rankings, and interview question suggestions.
- **🛡️ Executive Admin Security & Profile**:
  - Admin profile management with live PostgreSQL database sync and `bcrypt` password hashing.
- **📱 100% Mobile & Tablet Responsive**:
  - Glassmorphic UI styled with Adyapan Brand Orange theme (`#f97316` / `#ea580c`).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, Lucide Icons, React Router DOM, Toaster.
- **Backend**: Node.js, Express.js, Prisma ORM, PostgreSQL (Neon Cloud DB), BcryptJS, JWT.
- **Email Service**: Resend API / SMTP.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/DineshSharmaPb07/adyapanHIRING.git
cd adyapanHIRING
```

### 2. Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Variables Setup
Create `.env` file inside `backend/` directory following `backend/.env.example`:
```env
PORT=5000
DATABASE_URL="your_postgresql_neon_database_url"
JWT_SECRET="your_jwt_secret"
RESEND_API_KEY="your_resend_api_key"
OPENAI_API_KEY="your_ai_api_key"
```

### 4. Run Development Servers
```bash
# Start backend server
cd backend
npm run dev

# Start frontend server
cd frontend
npm run dev
```

---

## 📄 License
Privately developed for **Adyapan Edutech Pvt. Ltd.**
