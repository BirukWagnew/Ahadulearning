

# AhaduLearning LMS

> **AhaduLearning** is a modern, scalable Learning Management System (LMS) built for educational institutions, instructors, and students.  
> It provides seamless course creation, enrollment, video lessons, quizzes, real-time messaging, and secure online payments.

![AhaduLearning LMS Banner](https://your-image-link-if-you-have-one.com)

---

## 🚀 Features

- 🧑‍🏫 Instructor Dashboard (Manage Courses, Lessons, Quizzes)
- 🎓 Student Dashboard (Enroll in Courses, Track Progress)
- 📚 Course Browsing and Filtering
- 🎥 Video Lesson Management
- 📝 Quiz and Final Exam Integration
- 💬 Real-Time Chat and Messaging
- 💳 Secure Payment Integration (via Chapa Payment Gateway)
- 📈 Analytics and Progress Tracking
- 🔒 Authentication & Authorization (JWT-based)
- 🌐 Mobile-Responsive UI
- 📁 File Upload Support (Videos, Thumbnails)

---

## 🛠️ Tech Stack

**Frontend**  
- React.js (Vite)
- Tailwind CSS
- Axios
- React Router
- Socket.IO (for real-time features)

**Backend**  
- Node.js
- Express.js
- MongoDB & Mongoose
- Cloudinary (for file storage)
- Chapa API (for payments)
- JWT Authentication
- Multer (for file uploads)

---

## 🧩 Project Structure

```bash
ahadulearning/
├── client/          # Frontend (React)
├── api/          # Backend (Node.js + Express)
├── .env             # Environment variables
├── README.md        # Project documentation
└── package.json     # Project metadata
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/BirukWagnew/ahadulearning.git
cd ahadulearning
```

### 2. Install dependencies

```bash
# For backend
cd api
npm install

# For frontend
cd ../client
npm install
```

### 3. Create Environment Variables

In both `/api/.env` and `/client/.env`, add:

```env
# Server .env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CHAPA_API_KEY=your_chapa_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Client .env
VITE_BACKEND_URL=http://localhost:5000
```

### 4. Run the Application

```bash
# Start backend
cd api
npm run dev

# Start frontend
cd ../client
npm run dev
```

---

## 📸 Screenshots

| Dashboard | Course Details | Payment |
|-----------|----------------|---------|
| ![Dashboard](https://your-image-link.com) | ![Course Detail](https://your-image-link.com) | ![Payment](https://your-image-link.com) |

---

## 📑 API Documentation

Coming soon — API reference will be available via Postman collection and Swagger UI.

---

## 💳 Payment Integration (Chapa)

- Students pay through **Chapa** when enrolling in paid courses.
- Payment is verified on the backend via **Chapa Webhook**.
- Enrollment is granted after successful payment verification.

---

## 👥 Contributing

We welcome contributions!

- Fork the repository
- Create your feature branch (`git checkout -b feature/AmazingFeature`)
- Commit your changes (`git commit -m 'Add some AmazingFeature'`)
- Push to the branch (`git push origin feature/AmazingFeature`)
- Open a Pull Request

---

## 🛡️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📬 Contact



---

# Support the Project!

If you like this project, consider giving it a ⭐️ star on GitHub to help others discover it!

---

# AhaduLearning — Transforming Education, Empowering Future!





