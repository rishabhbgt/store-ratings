# Store Ratings Platform

A full-stack web application that allows users to discover stores, submit ratings from 1 to 5, and manage store and user information based on their role.

## Tech Stack

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* Node.js
* Express.js
* JWT Authentication
* bcryptjs

### Database

* MySQL

## User Roles

### System Administrator

* View dashboard statistics
* Add users and administrators
* Add stores
* View users and stores
* Search, filter, and sort listings
* View user details
* View store ratings

### Normal User

* Sign up and log in
* View registered stores
* Search stores by name and address
* View overall store rating
* Submit a rating from 1 to 5
* Modify or remove their submitted rating
* Change password

### Store Owner

* Log in to the platform
* View average rating of their store
* View users who have submitted ratings
* Change password

## Project Structure

```text
store-ratings/
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── db.js
│   │   ├── index.js
│   │   ├── seed.js
│   │   └── validators.js
│   ├── schema.sql
│   ├── package.json
│   └── package-lock.json
│
└── frontend/
    ├── public/
    ├── src/
    ├── .env.example
    ├── package.json
    └── package-lock.json
```

## Requirements

Make sure the following are installed:

* Node.js 18 or higher
* MySQL

## Database Setup

Create the database in MySQL:

```sql
CREATE DATABASE store_ratings;
```

Then run the SQL statements from:

```text
backend/schema.sql
```

## Backend Setup

Open a terminal in the backend directory:

```bash
cd backend
npm install
npm run dev
```

The backend runs on:

```text
http://localhost:4000
```

Create a `.env` file inside the `backend` directory:

```env
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=store_ratings
JWT_SECRET=your_random_secret
CLIENT_ORIGIN=http://localhost:5173
```

## Admin Account

To create the initial administrator account, run:

```bash
node src/seed.js
```

The seed script creates the administrator account used for initial access.

## Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

Create a `.env` file inside the `frontend` directory:

```env
VITE_AP_
```
