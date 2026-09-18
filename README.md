# Mentora — AI-Powered Smart Learning Companion

Mentora is an AI-powered, interactive math tutoring web application built for children aged 7 to 10. It pairs an animated AI tutor — powered by Google's Gemini models — with SVG-based visual rendering, voice interaction, and gamified learning to make foundational mathematics engaging, accessible, and personalized, without requiring installation or specialized hardware.

<p align="center">
  <img src="public/Logo.jpeg" width="200">
</p>

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Objectives](#objectives)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Flow](#system-flow)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the Application](#running-the-application)
- [Usage Guide](#usage-guide)
- [Testing](#testing)
- [Security & Privacy](#security--privacy)
- [Project Team](#project-team)
- [Acknowledgements](#acknowledgements)
- [License](#license)

---

## Overview

Early mathematics education is essential for long-term academic success, yet many children aged 7–10 lack access to affordable, personalized, and engaging tutoring. Traditional classrooms and most digital platforms provide limited individual attention, feedback, visualization, and interactivity — making core concepts such as addition, subtraction, multiplication, and division/fraction difficult for young learners to grasp.

**Mentora** addresses this gap with an animated AI tutor that delivers personalized, step-by-step math lessons in real time. Lessons are rendered through a custom `MathVisual` component using animated SVG graphics and familiar objects (oranges, cats, fishes, cars, etc.), and children can interact with the tutor via text or voice. A parent dashboard provides visibility into topic mastery, quiz results, accuracy, and daily activity.

User testing with children in the target age group showed that learners completed lessons, understood the concepts being taught, and responded positively to the animated visual approach — with AI responses remaining accurate and age-appropriate throughout.

## Problem Statement

Existing math education platforms typically lack at least one of the following: real-time personalized feedback, meaningful visual interactivity, or voice-based interaction — and none combine all three within a structured lesson framework built specifically for children aged 7–10.

Mentora solves this by combining:
- Conversational AI tutoring (Google Gemini, auto-selected model)
- Animated, SVG-based visual learning
- Voice-based interaction
- A structured, progressive lesson framework (CRA pedagogy)

...all within a single, cohesive, browser-based web application.

## Objectives

1. **Interactive Quiz System** — Provide children aged 7–10 with AI-driven, level-based math quizzes across four modules and thirteen difficulty levels.
2. **Visual Learning** — Teach math concepts through animated SVG-based visual storytelling using a custom `MathVisual` component.
3. **Voice Interaction** — Allow children to interact with the AI tutor through voice input alongside traditional text input.
4. **Adaptive Learning Path** — Implement an intelligent learning sequence that dynamically adjusts to each child's performance.
5. **Progress Tracking** — Give parents visibility into their child's topic mastery, quiz scores, and daily learning activity through a statistics dashboard.

## Key Features

- 🧮 **Four Math Modules** — Addition, Subtraction, Multiplication, and Division, structured across **13 progressive difficulty levels**, following the **Concrete–Representational–Abstract (CRA)** pedagogical framework.
- 🤖 **AI Tutor (Mentora)** — Powered by Google's Gemini API. On startup, the backend queries the Gemini API for the models available to the configured API key and automatically selects the best one from a preferred list (`gemini-3.5-flash` → `gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-1.5-flash` → `gemini-2.5-pro` → `gemini-2.0-flash-lite` → `gemini-1.5-pro`), falling back to any other available Gemini "flash" or Gemini model if none of the preferred ones are accessible. This means the exact model used depends on what the provided `GEMINI_API_KEY` has access to, rather than being hardcoded.
- 🎨 **Animated Visual Learning** — A custom `MathVisual` React component renders concepts as animated SVG scenes using familiar objects, powered by Framer Motion.
- 🎙️ **Voice Input & Output** — Voice recognition via the browser's native Web Speech API and voice synthesis via gTTS, so children can speak their answers and hear responses.
- 💡 **Progressive Hints System** — Scaffolded hints are provided after repeated incorrect attempts, guiding the student without revealing the answer outright.
- 🏆 **Gamification** — Points and streaks to keep children motivated across sessions.
- 🕹️ **Games Arcade** — Supplementary math-based games for additional engagement and practice.
- 📊 **Parent Dashboard** — Topic mastery, quiz results, accuracy rate, and daily activity, so parents can track their child's progress.
- 🔐 **Authentication** — Separate sign-up/login flows for students and parents, including email verification and forgot-password support.
- 🌐 **No Installation Required** — Runs entirely in the browser on laptops, tablets, and desktops.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Vite, Framer Motion, HTML/CSS |
| Runtime | Node.js (required to run/build the Vite frontend and manage npm packages) |
| Backend | FastAPI (Python), Uvicorn, REST API |
| Database | PostgreSQL (via SQLAlchemy ORM) |
| AI Model | Google Gemini API (model auto-selected at runtime based on API key access — see [Key Features](#key-features)) |
| Text-to-Speech | gTTS (Google Text-to-Speech) |
| Speech-to-Text | Web Speech API (browser-native) |
| Visualization | Custom `MathVisual` SVG component |

## System Flow

<img src="Screenshots/System Flow.png" width="600"> 

## Screenshots

| Screen Name | Preview |
|---|---|
| Student Signup | <img src="Screenshots/Student Signup Screen.png" alt="Student Signup" width="600"> |
| Parent Signup | <img src="Screenshots/Parent Signup Screen.png" alt="Parent Signup" width="600"> |
| Student Login | <img src="Screenshots/Student Login Screen.png" alt="Student Login" width="600"> |
| Parent Login | <img src="Screenshots/Parent Login Screen.png" alt="Parent Login" width="600"> |
| Mentora Welcome Screen | <img src="Screenshots/Mentora Welcome Screen.png" alt="Mentora Welcome Screen" width="600"> |
| Interaction Mode | <img src="Screenshots/Interaction mode Screen.png" alt="Interaction Mode" width="600"> |
| AI Tutor Chat Interface | <img src="Screenshots/AI Tutor Chat Interface Interaction mode.png" alt="AI Tutor Chat Interface" width="600"> |
| Addition Visual Learning Example | <img src="Screenshots/Addition Visual Learning Example.png" alt="Addition Visual Learning Example" width="600"> |
| Addition Visual Learning | <img src="Screenshots/Addition Visual Learning .png" alt="Addition Visual Learning" width="600"> |
| Subtraction Visual Learning Example | <img src="Screenshots/Subtraction Visual Learning Example.png" alt="Subtraction Visual Learning Example" width="600"> |
| Math Adventure Topic Selection | <img src="Screenshots/Math Adventure Topic Selection Screen (Learning mode).png" alt="Math Adventure Topic Selection" width="600"> |
| Addition Level Selection | <img src="Screenshots/Addition Level Selection Screen.png" alt="Addition Level Selection" width="600"> |
| Subtraction Level Selection | <img src="Screenshots/Subtraction Level Selection Screen.png" alt="Subtraction Level Selection" width="600"> |
| Multiplication Level Selection | <img src="Screenshots/Multiplication Level Selection Screen.png" alt="Multiplication Level Selection" width="600"> |
| Division Level Selection | <img src="Screenshots/Division Level Selection Screen.png" alt="Division Level Selection" width="600"> |
| Multiplication Level 1 Learning Mode | <img src="Screenshots/Multiplication Level 1 Learning mode.png" alt="Multiplication Level 1 Learning Mode" width="600"> |
| Multiplication Level 1 Adaptive Learning | <img src="Screenshots/Multiplication Level 1 Adaptive Learning.png" alt="Multiplication Level 1 Adaptive Learning" width="600"> |
| Student Dashboard & Progress Analytics | <img src="Screenshots/Student Dashboard and Progress Analytics.png" alt="Student Dashboard and Progress Analytics" width="600"> |
| Game Arcade | <img src="Screenshots/Game Arcade Screen.png" alt="Game Arcade" width="600"> |
| Student Profile | <img src="Screenshots/Student Profile Screen.png" alt="Student Profile" width="600"> |
| Parent Profile | <img src="Screenshots/Parent Profile Screen.png" alt="Parent Profile" width="600"> |

## Getting Started

### Prerequisites

Make sure the following are installed before setup:

- Python 3.10 or above
- Node.js and npm
- PostgreSQL
- Git
- Google Chrome (or any modern web browser)
- A stable internet connection
- A microphone and speakers (for voice interaction)

### Installation

This repository has a **flat frontend layout**: the project root itself is the Vite/React frontend (it contains `package.json`, `vite.config.js`, `index.html`, `src/`, and `public/`). The FastAPI backend lives in its own `Backend/` subfolder. There is no separate `frontend/` folder.

**1. Clone the repository**

```bash
git clone <project-repository-link>
cd Mentora-AI-Powered-Smart-Learning-Companion
```

**2. Set up the frontend (repository root)**

```bash
npm install
```

**3. Set up the backend**

```bash
cd Backend
python -m venv venv

# Activate the virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Environment Variables

**Backend** — create a `.env` file inside the `Backend` folder:

```env
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=postgresql://username:password@localhost:5432/mentora_db
SENDER_EMAIL=your_gmail_address@gmail.com
SENDER_PASSWORD=your_gmail_app_password
```

> `SENDER_EMAIL` and `SENDER_PASSWORD` are used to send verification and password-reset emails via Gmail's SMTP server (`smtp.gmail.com`). `SENDER_PASSWORD` should be a [Gmail App Password](https://myaccount.google.com/apppasswords), not your regular account password. If these two variables are left unset, the backend will **not** fail — it logs a warning and mocks the email (prints the recipient, subject, and body to the console) instead of actually sending it, which is useful for local development without email credentials.

> The backend does **not** require you to specify a Gemini model name. On startup it automatically queries the Gemini API for the models your `GEMINI_API_KEY` can access and selects the best available one (preferring newer Flash models, e.g. `gemini-3.5-flash` or `gemini-2.5-flash`, with automatic fallback to other available Gemini models). The selected model is printed to the backend console at startup.

**Frontend** — create a `.env` file in the **repository root** (not inside a `frontend` subfolder, since the root itself is the frontend):

```env
VITE_API_URL=http://localhost:8000
```

> Ensure the PostgreSQL database name, username, and password match the `DATABASE_URL` above. The backend uses SQLAlchemy to automatically create the required tables on startup.

### Running the Application

**Start the backend server:**

```bash
cd Backend
uvicorn main:app --reload
```

The backend will run at: `http://localhost:8000`

**Start the frontend development server** (in a separate terminal, from the repository root):

```bash
npm run dev
```

The frontend will run at: `http://localhost:5173`

Open `http://localhost:5173` in Google Chrome to access Mentora.

> **Note on voice features:** For best results, use Google Chrome, allow microphone permission when prompted, and ensure a stable internet connection (audio generation relies on server-side gTTS).

## Usage Guide

Mentora has two user classes: **Student** is the primary actor of the system, directly interacting with the AI tutor to learn and practice mathematics. **Parent** is the secondary actor, using the system to monitor and review the student's learning progress.

**Students:**
1. Sign up / log in as a student.
2. Select a math topic — Addition, Subtraction, Multiplication, or Division.
3. Choose a difficulty level.
4. Learn with Mentora through animated examples and voice/text interaction.
5. Complete the quiz; receive hints after repeated incorrect attempts.
6. View points, streaks, and progress on the dashboard.

**Parents:**
1. Sign up / log in as a parent.
2. View the child's topic mastery, quiz results, accuracy, and daily activity from the parent dashboard.

## Testing

Mentora was evaluated through both functional testing (covering sign-up, login, forgot password, AI tutoring, learn & practice, progress tracking, and the games arcade) and user testing with children in the 7–10 target age group. Results showed that children were able to complete lessons, understand the concepts taught, and respond positively to the animated, voice-enabled tutoring approach, with AI-generated responses remaining accurate and age-appropriate.

## Security & Privacy

- Passwords are never stored in plain text; they are hashed before being stored in PostgreSQL.
- The Gemini API key is stored as a backend environment variable and is never exposed in the frontend codebase.
- The specific Gemini model used is auto-selected server-side based on what the configured API key can access; no model name needs to be exposed to or configured by the frontend.
- All AI-generated responses are constrained via system prompts to remain on-topic, age-appropriate, and free of irrelevant content, in addition to Gemini's built-in safety guardrails.
- Voice input is processed through the browser's native Web Speech API and is not stored as an audio recording.
- User and interaction data is associated with authenticated user accounts and stored in PostgreSQL.

## Project Team

**Talha Saleem Siddiqui**
<br>
Eman Kamran
<br>
Abdul Hadi Adnan

**Primary Advisor:** Akheem Yousaf
**Secondary Advisor:** Sharoon Nasim

Department of Computer Science, Forman Christian College (A Chartered University), Lahore, Pakistan.

## License

This repository is intended for academic project use. Add the preferred license for the repository before making it public.

---

<p align="center">Made with ❤️ for young learners — Mentora Team</p>
