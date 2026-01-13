

# AhaduLearning LMS

> **AhaduLearning** is a modern, scalable Learning Management System (LMS) built for educational institutions, instructors, and students.  
> It provides seamless course creation, enrollment, video lessons, quizzes, real-time messaging, and secure online payments.



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
<<<<<<< HEAD
git clone https://github.com/BirukWagnew/ahadulearning.git
cd ahadulearning
=======
git clone https://github.com/BirukWagnew/Ahadulearning
cd Ahadulearning
>>>>>>> 34e4e7d (Fix quiz functionality and image display)
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
<img width="1872" height="905" alt="Screenshot 2026-01-13 165848" src="https://github.com/user-attachments/assets/e80b3009-f8cb-402a-b558-3c759c496995" />
<img width="1640" height="794" alt="Screenshot 2026-01-13 142226" src="https://github.com/user-attachments/assets/8c3f01ef-305d-4e0f-9db2-fcd98e70f19b" />
<img width="1898" height="906" alt="Screenshot 2026-01-13 165924" src="https://github.com/user-attachments/assets/d6ec436a-d4ee-467f-89ef-b29d8759a34d" />


---<img width="1898" height="906" alt="Screenshot 2026-01-13 165924" src="https://github.com/user-attachments/assets/722dd603-7c20-4c4e-b174-8b9a01b60302" />
<img width="1887" height="914" alt="Screenshot 2026-01-13 165907" src="https://github.com/user-attachments/assets/6c2ae3d5-d865-4c2e-81ad-5a4460207273" />
![Uploading Screenshot 2026-01-13 165848.png…]()
<img width="1640" height="794" alt="Screenshot 2026-01-13 142226" src="https://github.com/user-attachments/assets/5f7b3a43-c604-4597-bb03-9fd1188e7249" />


## 💳 Payment Integration (Chapa)

- Students pay through **Chapa** when enrolling in paid courses.
- Payment is verified on the backend via **Chapa Webhook**.
- Enrollment is granted after successful payment verification.


---

## 🛡️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📬 Contact
@Biruk_Wg telegram

---

# AhaduLearning — Transforming Education, Empowering Future!





