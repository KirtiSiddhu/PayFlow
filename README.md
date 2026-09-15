# PayWave — Digital Wallet System

A complete, production-ready Digital Wallet application built with the MERN stack (MongoDB, Express, React, Node.js). 

## 🚀 Features

- **Role-based Authentication**: User, Admin, and Super Admin flows.
- **Wallet Operations**: Add money (simulated), withdraw, send, and request money.
- **Atomic Transactions**: Uses MongoDB Sessions for true database transactions (prevents double spending).
- **Comprehensive Dashboards**: Recharts visualizations for user analytics and system-wide admin analytics.
- **Admin Management**: Block users, freeze wallets, audit logs.
- **Real-time Notifications**: Custom notification system with unread counts.
- **Security**: JWT, bcrypt, Helmet, express-rate-limit, and express-mongo-sanitize.

## 🛠 Tech Stack

- **Frontend**: React + Vite, Tailwind CSS, React Router, Recharts, Lucide Icons, Axios.
- **Backend**: Node.js, Express, Mongoose, JWT.
- **Database**: MongoDB (Local or Atlas).

## 📦 Installation & Setup

1. **Clone & Install Dependencies**:
   ```bash
   # Backend
   cd server
   npm install

   # Frontend
   cd ../client
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/digital_wallet
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=7d
   CLIENT_URL=http://localhost:5173
   ```

3. **Seed the Database (Optional but recommended for demo)**:
   ```bash
   cd server
   npm run seed
   ```
   *This creates admins, users, wallets, and dummy transactions.*

4. **Run the Application**:
   ```bash
   # Terminal 1 (Backend)
   cd server
   npm run dev

   # Terminal 2 (Frontend)
   cd client
   npm run dev
   ```

## 🔑 Demo Credentials (if seeded)

**User:**
- Email: arjun@example.com
- Password: User@1234

**Admin:**
- Email: admin1@paywave.com
- Password: Admin@1234

**Super Admin:**
- Email: superadmin@paywave.com
- Password: SuperAdmin@123
