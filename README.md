# Mentora — AI-Powered Smart Learning Companion

Mentora is an AI-powered, interactive math tutoring web application built for children aged 7 to 10. It pairs an animated AI tutor — powered by Google's Gemini  — with SVG-based visual storytelling, voice interaction, and gamified learning to make foundational mathematics engaging, accessible, and personalized, without requiring installation or specialized hardware.

> Senior Project — Department of Computer Science, Forman Christian College (A Chartered University), Lahore, Pakistan.

<p align="center">
  <img src="/logo.jpeg" alt="Mentora Logo" width="200">
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

Early mathematics education is essential for long-term academic success, yet many children aged 7–10 lack access to affordable, personalized, and engaging tutoring. Traditional classrooms and most digital platforms provide limited individual attention, feedback, visualization, and interactivity — making core concepts such as addition, subtraction, multiplication, and division difficult for young learners to grasp.

**Mentora** addresses this gap with an animated AI tutor that delivers personalized, step-by-step math lessons in real time. Lessons are rendered through a custom `MathVisual` component using animated SVG graphics and familiar objects (apples, cats, fish, cars, etc.), and children can interact with the tutor via text or voice. A parent dashboard provides visibility into topic mastery, quiz results, accuracy, and daily activity.

User testing with children in the target age group showed that learners completed lessons, understood the concepts being taught, and responded positively to the animated visual approach — with AI responses remaining accurate and age-appropriate throughout.

## Problem Statement

Existing math education platforms typically lack at least one of the following: real-time personalized feedback, meaningful visual interactivity, or voice-based interaction — and none combine all three within a structured lesson framework built specifically for children aged 7–10.

Mentora solves this by combining:
- Conversational AI tutoring (Gemini 2.5 Flash)
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
- 🤖 **AI Tutor (Mentora)** — Powered by Google's Gemini 2.5 Flash, generating dynamic, step-by-step lessons and quiz questions tailored to each child's current level.
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
| Frontend | React.js, Framer Motion |
| Backend | FastAPI (Python) |
| Database | PostgreSQL (via SQLAlchemy ORM) |
| AI Model | Google Gemini  |
| Text-to-Speech | gTTS (Google Text-to-Speech) |
| Speech-to-Text | Web Speech API (browser-native) |
| Visualization | Custom `MathVisual` SVG component |



## System Flow



## Screenshots

<!--
  ADD APPLICATION SCREENSHOTS HERE
  Suggested screens (from the project report):
  - Student / Parent Signup
  - Student / Parent Login
  - Mentora Welcome Screen
  - Topic Selection Screen (Addition / Subtraction / Multiplication / Division)
  - AI Tutor Chat Interface (Learning Mode)
  - Student Dashboard & Progress Analytics
  - Parent Profile Screen
  - Game Arcade Screen
-->

| Screen | Preview |
|---|---|
| Student Signup | <!-- 🖼️ image --> |
| Parent Signup | <!-- 🖼️ image --> |
| Student Login | <!-- 🖼️ image --> |
| Parent Login | <!-- 🖼️ image --> |
| Mentora Welcome Screen | <!-- 🖼️ image --> |
| Topic Selection | <!-- 🖼️ image --> |
| AI Tutor Chat (Learning Mode) | <!-- 🖼️ image --> |
| Student Dashboard | <!-- 🖼️ image --> |
| Parent Dashboard | <!-- 🖼️ image --> |
| Game Arcade | <!-- 🖼️ image --> |

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

**1. Clone the repository**

```bash
git clone <project-repository-link>
cd mentora
```

**2. Set up the backend**

```bash
cd backend
python -m venv venv

# Activate the virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**3. Set up the frontend**

```bash
cd ../frontend
npm install
```

### Environment Variables

**Backend** — create a `.env` file inside the `backend` folder:

```env
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=postgresql://username:password@localhost:5432/mentora_db
```

**Frontend** — create a `.env` file inside the `frontend` folder:

```env
VITE_API_URL=http://localhost:8000
```

> Ensure the PostgreSQL database name, username, and password match the `DATABASE_URL` above. The backend uses SQLAlchemy to automatically create the required tables on startup.

### Running the Application

**Start the backend server:**

```bash
cd backend
uvicorn main:app --reload
```

The backend will run at: `http://localhost:8000`

**Start the frontend development server** (in a separate terminal):

```bash
cd frontend
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
- All AI-generated responses are constrained via system prompts to remain on-topic, age-appropriate, and free of irrelevant content, in addition to Gemini's built-in safety guardrails.
- Voice input is processed through the browser's native Web Speech API and is not stored as an audio recording.
- User and interaction data is associated with authenticated user accounts and stored in PostgreSQL.



## Project Team

| Talha Saleem Siddiqui | 
| Eman Kamran | 
| Abdul Hadi Adnan | 

**Primary Advisor:** Akheem Yousaf
**Secondary Advisor:** Sharoon Nasim

Department of Computer Science, Forman Christian College (A Chartered University), Lahore, Pakistan.



## License

This repository is intended for academic project use. Add the preferred license for the repository before making it public.

---

<p align="center">Made with ❤️ for young learners — Mentora Team</p>
