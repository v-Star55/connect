# Connect 💬

Connect is a modern, feature-rich, full-stack real-time social and chat platform. It allows users to authenticate (locally or via Google), build a profile, search for other users, send/manage connection requests, and engage in instant, real-time messaging using WebSockets.

---

## 🚀 Key Features

- **🔐 Dual Authentication System**
  - Secure email/password login and registration.
  - One-click **Google OAuth 2.0** integration.
  - Password recovery flow with automated email reset links via **Nodemailer**.
  - Secure session handling via HttpOnly Cookies and JWT.

- **💬 Real-Time Messaging**
  - Instant chat using WebSockets (**Socket.io**).
  - Room joining/leaving mechanisms.
  - Messaging actions: **Edit**, **Delete**, and broadcast updates instantly to active rooms.

- **🤝 Social Network & Connection Management**
  - Search for users in real-time.
  - Send, accept, reject, or cancel connection requests.
  - Modal-based connection tracking for pending requests.

- **👤 Dynamic User Profiles**
  - Custom profiles detailing user info.
  - Clean and responsive dashboard interfaces.

- **🎨 Modern User Interface**
  - Built with **React 19** and **Vite** for blazing fast performance.
  - Styled with **TailwindCSS v4.0** offering modern aesthetics and absolute responsiveness.
  - Beautiful notifications and toast feedback using **react-hot-toast**.

---

## 🛠 Tech Stack & Rationale

### Frontend
- **React 19 & Vite**: Provides a component-based model with extremely fast Hot Module Replacement (HMR) and optimized build outputs.
- **TailwindCSS v4**: Next-generation utility-first CSS framework with integrated Vite support for rapid design iterations and consistent layouts.
- **Redux Toolkit**: Centralized state management for user authentication status, profile data, and active chat states.
- **TanStack React Query**: Declarative server-state synchronization, request caching, and clean mutation handling.
- **Socket.io Client**: Establishes lightweight, bidirectional, event-based real-time communication channels.

### Backend
- **Node.js & Express**: A fast, unopinionated web framework for constructing scalable RESTful APIs.
- **MongoDB & Mongoose**: Flexible document database to easily model user schemas, connection requests, and messages with schema validations.
- **Socket.io (Server)**: Manages active client connections, user presence, and real-time room communication.
- **Nodemailer**: Standard Node.js package to securely deliver registration/password-recovery emails.

---

## 📂 Project Structure

```
connect/
├── client/                 # Frontend (Vite + React)
│   ├── src/
│   │   ├── auth/           # Login, Register, Forgot Password
│   │   ├── components/     # ChatScreen, Sidebar, Modals, Cards
│   │   ├── pages/          # Home, Profile, Search, NotFound
│   │   ├── store/          # Redux Store Configuration
│   │   ├── slice/          # Redux Toolkit Slices (auth, chat, etc.)
│   │   ├── api/            # Axios instance and API calls
│   │   ├── main.tsx        # Application Entry Point
│   │   └── index.css       # Tailwind Directives & Styles
│   └── package.json
│
└── server/                 # Backend (Node.js + Express)
    ├── config/             # Configuration utilities
    ├── db/                 # Mongoose Database Connection
    ├── middleware/         # Auth verification and Error Handling
    ├── routes/             # Express routes (auth, users, chats)
    ├── services/           # Nodemailer and auxiliary services
    ├── utils/              # Token generation & helper methods
    ├── server.js           # Server Setup & Socket.io handling
    └── package.json
```

---

## ⚙️ Environment Configuration

Before running the application, you need to configure the environment variables for both the client and the server.

### Server Env Configuration (`server/.env`)
Create a `.env` file inside the `server/` directory:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27050/connect  # Your MongoDB URI
JWT_SECRET=your_jwt_secret_here
CLIENT_URL=http://localhost:5173

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Mailer Configuration (e.g. Gmail SMTP or Mailtrap)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Client Env Configuration (`client/.env`)
Create a `.env` file inside the `client/` directory:

```env
VITE_API_URL=http://localhost:4000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB running locally or a remote database instance

### Installation & Run

1. **Clone the Repository**
   ```bash
   git clone https://github.com/v-Star55/connect.git
   cd connect
   ```

2. **Start the Backend Server**
   ```bash
   cd server
   npm install
   npm run dev
   ```
   The server will start on port `4000`.

3. **Start the Frontend Client**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```
   The client will run on port `5173`. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.
