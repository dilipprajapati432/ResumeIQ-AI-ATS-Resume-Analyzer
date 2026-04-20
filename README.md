**ResumeIQ** is a full-stack web application designed to help job seekers optimize their resumes for Applicant Tracking Systems (ATS). Using **Google Gemini 2.0** and **Groq (Llama 3)**, it provides detailed compatibility scores, keyword gap analysis, and actionable suggestions to improve interview chances.

## 🚀 Live Demo
[![Live Demo](https://img.shields.io/badge/Live-Demo-green)](https://resumeiqscan.vercel.app)

---
## 📸 Screenshots

<img width="1918" height="1027" alt="image" src="https://github.com/user-attachments/assets/9f6e3f73-03c3-4296-88bc-704c584bde33" />
<img width="1918" height="1020" alt="image" src="https://github.com/user-attachments/assets/26ef7fde-1b3d-4a30-a096-711a8e418c30" />
<img width="1918" height="1022" alt="image" src="https://github.com/user-attachments/assets/4c45141b-d159-49a1-b42a-498ccb6fff5f" />
<img width="1918" height="1017" alt="image" src="https://github.com/user-attachments/assets/f2f44a24-8bea-47df-a64a-4082e6e3388e" />
<img width="1918" height="981" alt="image" src="https://github.com/user-attachments/assets/45dbc046-8410-4bd1-9321-af519ef7768f" />
<img width="1918" height="1018" alt="image" src="https://github.com/user-attachments/assets/c218f0e2-d0a0-4a22-8c97-73e3cbbb8f1c" />
<img width="1902" height="1015" alt="image" src="https://github.com/user-attachments/assets/533c546c-b15a-43a7-b5fe-7bc82be2d57f" />

---
## ✨ Features
- **🧠 6-Dimensional AI Scoring** — Analysis of Keywords, Formatting, Experience, Skills, Education, and Impact.
- **⚡ Hybrid AI Engine** — Ultra-fast insights powered by Gemini 2.0 and Groq/Llama-3.3.
- **📄 Full File Support** — Instant extraction from **PDF** and **TXT** files.
- **🎨 Premium UI** — Dark editorial design with interactive scoring charts and glassmorphism components.
- **🛡️ Privacy-First** — Transient, in-memory processing. Resumes are never stored.

---

## 🛠️ Tech Stack
- **Frontend**: React 18, Framer Motion, Recharts
- **Backend**: Node.js, Express, Multer, PDF-Parse
- **AI Engine**: Google Gemini 2.0 Flash & Groq (Llama 3.3 70b)
- **Deployment**: Vercel (Frontend) & Render (Backend)

---

## 📁 Project Structure
```text
.
├── backend/            # Express.js API & AI Analysis Logic
│   ├── .env.example    # Template for environment variables
│   ├── server.js       # Core API & Multi-Model AI Engine
│   └── package.json
├── frontend/           # React.js SPA (Vite/CRA)
│   ├── public/         # Static assets
│   ├── src/
│   │   ├── components/ # Modular UI (Hero, AnalyzeForm, etc.)
│   │   ├── App.js      # Main Router & Layout
│   │   └── index.css   # 'Dark Editorial' Design System
│   ├── vercel.json     # Production routing config
│   └── package.json
├── package.json        # Root scripts for managing both layers
└── README.md
```

---

## 🚀 Local Setup

### 1. Clone & Install
```bash
# Clone the repository
git clone <your-repo-link>
cd <repo-name>

# Install all dependencies
npm run install:all
```

### 2. Configure Environment
Create `backend/.env` using the provided `.env.example`:
```env
GEMINI_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
```

### 3. Run Development
```bash
npm run dev
```

---

## 👤 Author
**Dilip Prajapati**
- 💼 [LinkedIn](https://www.linkedin.com/in/dilip-kohar-014627293)
- 🌐 [Facebook](https://www.facebook.com/dilip.kohar.7)
- 📧 [Email](mailto:dilipkohar4320@gmail.com)

---

## 📄 License
This project is licensed under the MIT License.
