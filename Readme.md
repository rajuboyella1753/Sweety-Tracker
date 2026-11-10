# Sweety – Blood Glucose Tracker

A full-stack web application built as a Junior Full-Stack Developer assessment for Kenpath. Sweety allows diabetes patients to track their daily blood glucose readings across specific time slots, enforce strict clinical validation rules, and view real-time analytical reports (Daily, Month-to-Date, and Previous Month).

---

## Tech Stack

- **Frontend:** React.js, Axios, Custom Dark Glassmorphism UI (Indigo & Orange Accents)
- **Backend:** Node.js, Express.js, JSON Web Tokens (JWT), bcrypt
- **Database:** PostgreSQL (with connection pooling via pg)

---

## Project Directory Structure

```text
sweety-tracker/
├── backend/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── readings.js
│   │   └── reports.js
│   ├── db.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

---

## Features Implemented (Required)

1. **Authentication:** Secure user registration with password hashing (`bcrypt`) and JWT-based session authorization. Users only access their personal readings.
2. **Readings Management:** Add, view, and delete blood glucose readings for 4 distinct time slots:
   - Morning (fasting)
   - After breakfast
   - After lunch
   - After dinner
3. **Strict Validation Rules:**
   - Value is required & must be a whole number between 40 and 600 mg/dl.
   - Maximum 4 readings per day limit.
   - Unique time slot constraint per day.
   - Future date restriction.
4. **Comprehensive Reports:**
   - **Daily Report:** Lists readings by slot along with statistics (Count, Average rounded to 1 decimal, Highest, Lowest).
   - **Month-to-Date (MTD):** Aggregates stats from the 1st of the current month to the selected date.
   - **Previous Monthly:** Aggregates stats for the entire previous month.

---

## Installation & Setup Instructions

### Prerequisites
- Node.js installed on your machine.
- PostgreSQL installed (configured on local or custom path, e.g., `D:\PostgresInstall\18`).

### 1. Database Setup
1. Open pgAdmin or PostgreSQL terminal.
2. Create a new database named `sweety_db`:
   ```sql
   CREATE DATABASE sweety_db;
   ```
3. Run the following SQL to create the required tables:
   ```sql
   -- Users Table
   CREATE TABLE users (
       id SERIAL PRIMARY KEY,
       name VARCHAR(100) NOT NULL,
       email VARCHAR(150) UNIQUE NOT NULL,
       password_hash VARCHAR(255) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- Readings Table
   CREATE TABLE readings (
       id SERIAL PRIMARY KEY,
       user_id INT REFERENCES users(id) ON DELETE CASCADE,
       date DATE NOT NULL,
       slot VARCHAR(50) NOT NULL,
       value INT NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the backend folder with the following variables (refer to `.env.example`):
   ```env
   PORT=5000
   DB_USER=postgres
   DB_PASSWORD=YourDatabasePassword
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=sweety_db
   JWT_SECRET=your_super_secret_jwt_key
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install axios
   ```
3. Start the React development server:
   ```bash
   npm start
   ```
4. Open your browser and visit `http://localhost:3000`.

---

## Environment Variables (`.env.example`)

```env
PORT=5000
DB_USER=postgres
DB_PASSWORD=Raju2003
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sweety_db
JWT_SECRET=super_secret_key_sweety_123
```

---

## Notes & Assumptions

- **Assumptions:** Users are expected to input blood glucose values in standard integer mg/dl units. Date selections default to the current local date.
- **Future Improvements:** With additional time, implementing Redis caching for report queries, adding a Recharts graphical trend line, and containerizing with Docker Compose would further enhance performance and scalability.
