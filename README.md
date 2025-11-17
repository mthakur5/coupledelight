# CoupleDelight - Dating Platform for Couples and Singles

A dating platform where couples and singles can create profiles and connect with each other.

## Features

- User registration and authentication (couples and singles)
- Profile creation and management
- Browse and discover other profiles
- Advanced filtering and search
- MongoDB database integration

## Tech Stack

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- bcryptjs for password hashing

**Frontend:**
- React.js
- React Router for navigation
- Axios for API calls
- Modern CSS styling

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or remotely)
- npm or yarn

### Installation

1. Install backend dependencies:
```bash
npm install
```

2. Install frontend dependencies:
```bash
cd client
npm install
```

3. Configure environment variables:
Create a `.env` file in the root directory with:
```
MONGODB_URI=mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.5.9
DB_NAME=coupledelight
JWT_SECRET=your-secret-key-change-in-production
PORT=5000
```

4. Make sure MongoDB is running on your local machine

### Running the Application

1. Start the backend server:
```bash
npm run server
```

2. In a new terminal, start the React frontend:
```bash
npm run client
```

3. Or run both concurrently:
```bash
npm run dev
```

The backend will run on `http://localhost:5000` and the frontend on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Profile
- `GET /api/profile/me` - Get current user's profile
- `POST /api/profile` - Create/update profile
- `PUT /api/profile` - Update profile
- `GET /api/profile/:id` - Get profile by ID
- `DELETE /api/profile` - Delete profile

### Discover
- `GET /api/discover` - Get all profiles with filters
- `GET /api/discover/search` - Search profiles

## Account Types

### Single
- Create individual profile
- Browse couples and other singles
- Specify gender and preferences

### Couple
- Create joint profile for both partners
- Add details for both partners
- Browse singles and other couples

## Profile Information

- Bio
- Age
- Location (city, state, country)
- Interests
- Photos
- Looking for preferences
- Account type specific fields

## Database Schema

### User Collection
- email
- password (hashed)
- accountType (single/couple)
- isActive
- createdAt

### Profile Collection
- userId (reference to User)
- accountType
- bio
- age
- location
- interests
- photos
- lookingFor
- Single fields: name, gender
- Couple fields: coupleName, partner1, partner2, relationshipStatus
- isComplete, isVisible
- createdAt, updatedAt

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected API routes
- Input validation

## License

ISC
# coupledelight
