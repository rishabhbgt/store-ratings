# Store Ratings

A full-stack Store Ratings web application built for the store-rating assessment.

The application provides role-based access for **System Administrators, Normal Users, and Store Owners** with store discovery, 1–5 star ratings, dashboards, sorting, filtering, authentication, and password management.

## Tech Stack

### Frontend

* React
* Vite
* JavaScript
* Responsive CSS

### Backend

* Node.js
* Express.js
* MySQL
* JWT Authentication
* bcryptjs
* Helmet
* Express Rate Limit

## User Roles

### System Administrator

* Dashboard with users, stores, ratings, average rating, and rating distribution
* Add users and stores
* View and filter users
* View and filter stores
* Sort table data
* View user details
* View store-owner ratings
* Logout

### Normal User

* Signup and login
* Browse stores
* Search stores by name and address
* View overall store ratings
* Submit, modify, and remove ratings
* Change password
* Logout

### Store Owner

* Login
* View store average rating
* View users who rated the store
* Sort rating data
* Change password
* Logout

## Project Structure

```text
store-ratings/
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── utils/
│   ├── schema.sql
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
```

## Database Setup

Create a MySQL database:

```sql
CREATE DATABASE store_ratings;
```

Then run the schema:

```sql
USE store_ratings;
SOURCE backend/schema.sql;
```

## Backend Setup

Go to the backend folder:

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:

```env
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=store_ratings
JWT_SECRET=your_jwt_secret
CLIENT_ORIGIN=http://localhost:5173
```

Start the backend:

```bash
npm start
```

The API runs on:

```text
http://localhost:4000
```

Health check:

```text
http://localhost:4000/api/health
```

To create the default administrator account:

```bash
node src/seed.js
```

Default admin credentials:

```text
Email: admin@example.com
Password: Admin@123
```

## Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`:

```env
VITE_API_URL=http://localhost:4000/api
```

Start the frontend:

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## Validation

The application includes validation for:

* Name length: 20–60 characters
* Address: up to 400 characters
* Password: 8–16 characters with an uppercase letter and special character
* Standard email format
* Rating values from 1 to 5

## Security

* JWT-based authentication
* Role-based authorization
* Password hashing with bcrypt
* Protected API routes
* Helmet security headers
* Login/signup rate limiting
* Environment variables for secrets and database credentials

## Running the Project

Start the backend first:

```bash
cd backend
npm install
npm start
```

Then start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Repository

GitHub repository:

https://github.com/rishabhbgt/store-ratings
