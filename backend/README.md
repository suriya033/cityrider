# CityRider Backend API

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your MongoDB connection string and JWT secret.

4. Make sure MongoDB is running on your system or use MongoDB Atlas.

5. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Rides
- `GET /api/rides` - Get all rides (with filters)
- `GET /api/rides/:id` - Get specific ride
- `POST /api/rides` - Create ride (Driver only)
- `PUT /api/rides/:id` - Update ride (Driver, owner)
- `DELETE /api/rides/:id` - Cancel ride (Driver, owner)
- `GET /api/rides/driver/my-rides` - Get driver's rides
- `GET /api/rides/:id/bookings` - Get ride bookings

### Bookings
- `POST /api/bookings` - Create booking (Passenger)
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get specific booking
- `PUT /api/bookings/:id/confirm` - Confirm booking (Driver)
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update profile

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/conversation/:userId` - Get conversation
- `GET /api/messages/conversations` - Get all conversations
- `PUT /api/messages/:id/read` - Mark message as read






