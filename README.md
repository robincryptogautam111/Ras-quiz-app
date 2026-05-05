# 🎯 RAS Quiz Arena — Full Stack Application

A complete quiz platform with user authentication, admin panel, and UPI payment gateway.

## Tech Stack
- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (access + refresh tokens)
- **Payments**: Razorpay (UPI, cards, netbanking)
- **File Upload**: Multer + Cloudinary

## Project Structure
```
ras-quiz-app/
├── backend/          ← Node.js + Express API
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── middleware/
│       └── utils/
├── frontend/         ← React + Vite app
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── context/
│       └── hooks/
└── docs/             ← API documentation
```

## Quick Setup

### 1. Clone & Install
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment Variables

**backend/.env**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rasquiz
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_refresh_secret_here
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@rasquiz.com
ADMIN_PASSWORD=Admin@123
NODE_ENV=development
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

### 3. Run
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### 4. Seed Admin
```bash
cd backend && npm run seed
```

## API Endpoints
See `docs/api.md` for full documentation.

## Payment Flow
1. User clicks "Buy Quiz"
2. Backend creates Razorpay order
3. Frontend opens Razorpay checkout
4. User pays via UPI/Card
5. Razorpay sends webhook to backend
6. Backend verifies signature & unlocks quiz
7. User gets access immediately

## Admin Credentials (after seed)
- Email: admin@rasquiz.com
- Password: Admin@123
