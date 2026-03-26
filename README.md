🏌️ Golf Charity Subscription Platform

A full-stack web application that combines golf-based scoring, subscriptions, and charity donations into an engaging platform.

🚀 Tech Stack Frontend: HTML, CSS, Vanilla JavaScript Backend: Node.js, Express Database: MySQL Authentication: JWT + bcrypt

✨ Key Features 🔐 Authentication & Authorization Secure signup/login system using JWT Password hashing with bcrypt Role-based access (user, admin)

💳 Subscription System Monthly & yearly plans Active/inactive subscription tracking Automatic expiry handling

🎯 Score Management Valid score range: 1–45 only Automatically stores only the latest 5 scores Clean and controlled input validation

🎰 Monthly Draw System Generates 5 random numbers Prize tiers: 🥇 Match 5 → Jackpot 🥈 Match 4 → Second Prize 🥉 Match 3 → Third Prize

❤️ Charity Integration View available charities Select preferred charity Minimum 10% donation contribution Admin can manage charities (CRUD operations)

📊 User Dashboard Real-time data cards Charts & analytics Toast notifications Loading indicators Fully responsive UI

🛠️ Admin Panel Manage users Edit scores Run monthly draw View winners data Full charity management

🔌 API Endpoints

🔐 Auth

POST /api/auth/signup POST /api/auth/login

👤 User

GET /api/users/me GET /api/users/dashboard GET /api/users (admin only)

💳 Subscription

POST /api/subscriptions GET api/subscriptions/me

🎯 Scores POST /api/scores GET /api/scores/me DELETE /api/scores/:id GET /api/scores (admin) PUT /api/scores/:id (admin)

❤️ Charities GET /api/charities POST /api/charities/select GET /api/charities/me/selection POST /api/charities (admin) PUT /api/charities/:id (admin) DELETE /api/charities/:id (admin)

🎰 Draw System POST /api/draws/run (admin) GET /api/draws/latest GET /api/draws/me/results

⚙️ Setup Instructions

1️⃣ Install Dependencies

cd backend npm install

2️⃣ Setup Database

Run the SQL schema in MySQL:

SOURCE /absolute/path/to/golf-App/backend/schema.sql;

3️⃣ Environment Configuration

Create a .env file from .env.example:

PORT=5000 DB_HOST=local host DB_PORT=3306 DB_USER=root DB_PASSWORD=your_mysql_password DB_NAME=golf_charity_platform JWT_SECRET=your_super_secure_secret_key

4️⃣ Start Backend Server

npm run dev

5️⃣ Run the Application

Open in browser:

http://localhost:5000/ Login Page → / Dashboard → /dashboard.html

⚠️ Note: Backend must be running for API calls.

🧪 Demo Access You can select admin role during signup for testing admin features.

📌 Notes Ensure MySQL is running before starting backend Use strong JWT secret in production Designed for scalability and modular backend structure

🌟 Future Improvements Payment gateway integration Email notifications Advanced analytics dashboard Deployment with CI/CD

👨‍💻 Author Aditya Torane B TECH CSE (AI&DS) Student
