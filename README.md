# 🎓 AhaduLearning LMS

> A modern, full-stack Learning Management System designed to connect instructors and students through structured online learning.

AhaduLearning is a **MERN-stack Learning Management System (LMS)** that provides a complete environment for course creation, enrollment, video-based learning, assessments, communication, payments, and progress tracking.

The project was developed to explore how modern web technologies can be used to build practical digital learning solutions.

---

## 🚀 Key Features

### 👨‍🏫 Instructor Features

* Create and manage courses
* Upload course materials and video lessons
* Create quizzes and final exams
* Monitor student enrollment and progress
* Manage course content through an instructor dashboard

### 👨‍🎓 Student Features

* Browse and filter available courses
* Enroll in courses
* Watch video lessons
* Complete quizzes and final exams
* Track learning progress
* Access enrolled course content
* Communicate through real-time messaging

### 🔐 Authentication & Security

* User authentication and authorization
* JWT-based authentication
* Role-based access control
* Protected application routes

### 💬 Communication

* Real-time messaging using Socket.IO

### 💳 Payments

* Online payment integration using Chapa

### 📊 Learning & Progress

* Course progress tracking
* Quiz and examination functionality
* Student and instructor dashboards
* Learning analytics

### 📁 File Management

* Course media and file uploads
* Cloud-based media storage using Cloudinary

### 📱 Responsive Design

* Responsive interface for desktop and mobile devices

---

## 🏗️ Technology Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* Axios
* React Router
* Socket.IO Client

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* Socket.IO
* JWT
* Multer

### Services & APIs

* Cloudinary
* Chapa API

### Development Tools

* Git
* GitHub
* npm

---

## 🧩 System Architecture

AhaduLearning follows a client-server architecture:

```text
┌───────────────────────────┐
│        React Client       │
│      Vite + Tailwind      │
└─────────────┬─────────────┘
              │
              │ HTTP / REST API
              │ WebSocket
              ▼
┌───────────────────────────┐
│      Node.js / Express    │
│       Backend API         │
└───────┬─────────┬─────────┘
        │         │
        │         ├──────────────► Cloudinary
        │
        ├────────────────────────► Chapa
        │
        ▼
┌───────────────────────────┐
│        MongoDB            │
│      Application Data     │
└───────────────────────────┘
```

---

## 📁 Project Structure

```text
Ahadulearning/
│
├── client/              # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── api/                 # Node.js / Express backend
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   └── package.json
│
└── README.md
```

> The exact internal structure may evolve as the project continues to be developed.

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have the following installed:

* Node.js
* npm
* MongoDB
* Git

### 1. Clone the repository

```bash
git clone https://github.com/BirukWagnew/Ahadulearning.git
cd Ahadulearning
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Install backend dependencies

Open another terminal:

```bash
cd api
npm install
```

### 4. Configure environment variables

Create the required `.env` files for the frontend and backend.

The application requires configuration for services such as:

* MongoDB
* JWT authentication
* Cloudinary
* Chapa
* Email functionality
* Other application-specific settings

**Never commit real API keys, passwords, tokens, or other secrets to GitHub.**

### 5. Start the application

Start the backend and frontend using the project's configured development commands.

---

## 🖥️ Application Areas

The system is organized around the main users of the platform:

```text
                    AhaduLearning
                          │
              ┌───────────┴───────────┐
              │                       │
          Instructor                Student
              │                       │
      ┌───────┴───────┐       ┌───────┴────────┐
      │               │       │                │
   Courses         Analytics  Courses        Progress
   Lessons         Students   Lessons         Quizzes
   Quizzes         Content    Exams           Messaging
```

---

## 🎯 Project Goals

The main goals of AhaduLearning are to:

* Build a practical full-stack education platform
* Provide structured online learning capabilities
* Connect instructors and students in one platform
* Practice scalable web application development
* Integrate external services and APIs
* Apply authentication and role-based authorization
* Explore real-time communication in web applications

---

## 🔮 Future Improvements

Potential future improvements include:

* Advanced instructor analytics
* Improved recommendation systems
* More comprehensive learning analytics
* AI-powered learning assistance
* Enhanced search and filtering
* Improved notification systems
* Automated deployment and CI/CD
* Cloud infrastructure and production deployment
* Improved testing and monitoring

---

## 📸 Screenshots

Screenshots of the application can be added here to showcase the main user interfaces.

---

## 🧠 What I Learned

Developing AhaduLearning provided practical experience with:

* Full-stack JavaScript development
* REST API design
* MongoDB data modeling
* Authentication and authorization
* Real-time communication
* Third-party API integration
* File and media management
* Payment integration
* Frontend state and component management
* Building a complete application across frontend and backend systems

---

## 👨‍💻 Developer

**Biruk Wagnew**

BSc Information Technology graduate interested in **Cloud Engineering, DevOps, Full-Stack Development, and AI**.

* GitHub: [@BirukWagnew](https://github.com/BirukWagnew)
* LinkedIn: [linkedin.com/in/birukwagneww](https://linkedin.com/in/birukwagneww)

---

## 📄 License

This project is licensed under the **MIT License**.
