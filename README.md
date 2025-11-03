# MindMate – Anonymous Mental Health Buddy for Students

MindMate is a MERN-Stack based mental wellness platform designed to support students through anonymous emotional expression, guided counseling, mental health resources, and digital well-being tools. The platform provides a safe space where students can anonymously interact, track their mental health, book appointments with verified counselors/psychologists, and seek help during emergencies.

---

## 🚀 Features

### 👨‍🎓 Student Portal

* Login using Username (Anonymous)
* Secure authentication (JWT)
* Anonymous Vent Wall (Community Support)
* Report system for abusive content
* Mental health resource access (Articles / Videos)
* Appointment booking with counselors/psychologists
* Feedback system

### 🧑‍⚕️ Counselor/Psychologist Portal

* Secure Login
* Profile and Availability Management
* Appointment Management
* Student Feedback Review
* Mental health content contribution (resources)
* Personal dashboard & statistics

### 🛠 Admin Portal

* Manage Students & Counselors/Psychologists
* Review and Approve counselor profiles
* Handle reports & content moderation
* View system logs
* Statistics control and view

---

## 📂 Project Structure

```
MindMate/
├── mindmate-backend
│ ├── src
│ │ ├── config
│ │ ├── controllers
│ │ ├── middlewares
│ │ ├── models
│ │ ├── routes
│ │ └── utils
│ ├── uploads
│ ├── app.js
│ ├── server.js
│ └── .env
│
└── mindmate-frontend
├── public
├── src
│ ├── assets
│ ├── components
│ ├── config
│ ├── Layout
│ ├── pages
│ ├── routes
│ ├── styles
│ └── Utils
├── App.jsx
├── main.jsx
└── .env
```

---

## 🧠 Tech Stack

| Category   | Technologies                        |
| ---------- | ----------------------------------- |
| Frontend   | React, Axios, Formik, Yup, Toastify |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB Atlas/Mongoose              |
| Auth       | JWT, bcrypt                         |
| Email      | Nodemailer                          |

---

## ⚙️ Installation & Setup

### ✅ Clone the Repository

```bash
git clone https://github.com/Athul-Rup-A/MindMate.git
cd MindMate
```

### ✅ Backend Setup

```bash
cd mindmate-backend
npm install
```

Create `.env` file:

```
MONGO_URI=
JWT_SECRET=
PORT=

ADMIN_PORTAL_URL=

EMAIL_USER=
EMAIL_PASS=
SENDER_NAME=
FRONTEND_URL=

CHAT_SECRET_KEY=

BASE_URL=
```

MONGO_URI=
JWT_SECRET=
EMAIL_USER=
EMAIL_PASS=

````
Run backend:
```bash
npm run dev
````

### ✅ Frontend Setup

```bash
cd ../mindmate-frontend
npm install
npm start
```

Create `.env` file for Frontend:

````
VITE_API_URL=
VITE_BASE_URL=
VITE_ADMIN_BASE_URL=
VITE_CP_BASE_URL=
VITE_STUDENT_BASE_URL=
```bash
cd ../mindmate-frontend
npm install
npm start
````

---

## 🧪 API Overview (Brief)

| Module                              | Methods                                |
| ----------------------------------- | -------------------------------------- |
| Auth                                | Register, Login, Forgot Alias/Password |
| Student                             | CRUD, Booking, Vent Posts              |
| Vent Wall                           | Post, Like, Report                     |
| Appointments                        | Book, Cancel, View                     |
| Counselors & Psychologists          | Sessions, Resource                     |
| Admin                               | Approvals, Manage Users                |

(Full API docs coming soon)

---

## 🛡 Security Features

* Password hashing with bcrypt
* JWT authentication
* IP-based logging (planned)
* Anonymous username system
* Abuse reporting system

---

## 🎯 Future Enhancements

* AI‑powered chat buddy
* Voice notes & diary
* Meditation & guided breathing modules
* Gamified mood & habit rewards system
* Push notifications for reminders

---

## 🤝 Contributing

Pull requests & improvements are welcome. Please open an issue first to discuss changes.

---

## 📄 License

MIT License – Free to use & modify.

---

## 👤 Author

**Athul Rup A**

> MERN Stack Developer | Mental Health Tech Enthusiast

GitHub: @Athul-Rup-A

---

If you like this project, ⭐ Star the repo and support the vision of Student Mental Wellness!
