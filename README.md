# CityRider - Ride Sharing Application

A comprehensive ride-sharing mobile application built with React Native and Node.js, allowing drivers to post rides and passengers to search and book rides.

## Project Structure

```
cityrider/
├── backend/          # Node.js + Express + MongoDB backend
│   ├── models/       # MongoDB models (User, Ride, Booking, Message)
│   ├── routes/       # API routes
│   ├── middleware/   # Authentication middleware
│   └── server.js     # Express server setup
│
└── mobile/           # React Native mobile app
    ├── src/
    │   ├── screens/  # App screens (auth, driver, passenger, common)
    │   ├── components/ # Reusable components
    │   ├── services/   # API service layer
    │   ├── context/    # React context (AuthContext)
    │   └── theme.js    # App theme
    └── App.js        # Main app component
```

## Features

### Driver Features
- ✅ Post rides with origin, destination, date/time, seats, vehicle type, and price
- ✅ Manage posted rides (view, edit, cancel)
- ✅ View and confirm passenger bookings
- ✅ Real-time messaging with passengers

### Passenger Features
- ✅ Search rides by origin, destination, and date
- ✅ Filter rides by price, seats available, vehicle type
- ✅ View detailed ride information with driver profile
- ✅ Book rides with seat selection
- ✅ View booking history
- ✅ Real-time messaging with drivers

### Common Features
- ✅ User authentication (login/register)
- ✅ User profiles with ratings
- ✅ In-app messaging system with Socket.IO
- ✅ Location picker with map integration
- ✅ Route visualization on maps
- ✅ Push notifications support (structure ready)

## Tech Stack

### Backend
- **Node.js** + **Express.js** - RESTful API
- **MongoDB** with **Mongoose** - Database
- **JWT** - Authentication
- **Socket.IO** - Real-time messaging
- **bcryptjs** - Password hashing

### Frontend
- **React Native** with **Expo** - Mobile app framework
- **React Navigation** - Navigation
- **React Native Paper** - UI components
- **React Native Maps** - Map integration
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **AsyncStorage** - Local storage

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cityrider
JWT_SECRET=your_secret_jwt_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NODE_ENV=development
```

5. Make sure MongoDB is running (local or Atlas)

6. Start the server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Mobile App Setup

1. Navigate to mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Update API base URL in `src/services/api.js`:
   - iOS Simulator: `http://localhost:5000/api`
   - Android Emulator: `http://10.0.2.2:5000/api`
   - Physical Device: `http://YOUR_COMPUTER_IP:5000/api`

4. Start Expo:
```bash
npm start
# or
expo start
```

5. Run on device:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app

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

## Database Schema

### Users
- userId, name, email, password, role, rating, contactInfo, vehicleInfo

### Rides
- rideId, driverId, origin, destination, departureTime, seatsAvailable, 
  bookedSeats, vehicleType, pricePerSeat, description, status

### Bookings
- bookingId, rideId, passengerId, seatsBooked, status, paymentStatus, totalAmount

### Messages
- messageId, senderId, receiverId, rideId, message, read, timestamp

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `GOOGLE_MAPS_API_KEY` - Google Maps API key (optional)

## Development Notes

1. **MongoDB**: Make sure MongoDB is running before starting the backend
2. **API URL**: Update the API base URL in mobile app for your testing environment
3. **Location Permissions**: The app requests location permissions for map features
4. **Socket.IO**: Real-time messaging requires Socket.IO connection to backend

## Future Enhancements

- [ ] Payment gateway integration (Stripe/Razorpay)
- [ ] Push notifications (Firebase Cloud Messaging)
- [ ] Rating and review system
- [ ] Ride sharing optimization (partial route matching)
- [ ] Advanced search filters
- [ ] Route optimization and suggestions
- [ ] Social features (follow drivers, favorite routes)

## License

This project is open source and available for educational purposes.

## Support

For issues or questions, please refer to the documentation or create an issue in the repository.






