# Campus Event Platform

A real time event management platform for campus events with live attendance tracking and interactive features.

## Features

- **Real-time Event Tracking**
  - Live viewer count for each event
  - Student-only view tracking
  - Automatic inactive viewer cleanup

- **User Management**
  - Student and Organizer roles
  - Secure authentication
  - Role-based access control

- **Event Management**
  - Create and manage events
  - View event details and attendance
  - Real-time updates
  - Location tracking

- **Registration System**
  - Easy event registration
  - Registration status tracking (pending/approved/rejected)
  - Automated notifications

## Tech Stack

### Frontend
- React 18
- Vite
- Socket.IO Client
- TailwindCSS
- Lucide React (Icons)
- React Router DOM

### Backend
- Node.js
- Express
- Socket.IO
- MongoDB
- Mongoose
- JWT Authentication

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── api/           # API integration
│   │   ├── components/    # Reusable components
│   │   ├── context/      # React context providers
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Page components
│   │   ├── routes/       # Route configurations
│   │   └── socket/       # Socket.IO client setup
│   
└── server/                # Backend Node.js application
    ├── config/           # Configuration files
    ├── controllers/      # Route controllers
    ├── middleware/       # Express middleware
    ├── models/          # Mongoose models
    ├── routes/          # Express routes
    └── socket/          # Socket.IO handlers
```

## Getting Started

### Prerequisites
- Node.js 16+
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd campus-event-platform
\`\`\`

2. Install backend dependencies:
\`\`\`bash
cd server
npm install
\`\`\`

3. Install frontend dependencies:
\`\`\`bash
cd ../client
npm install
\`\`\`

4. Set up environment variables:

Create a \`.env\` file in the server directory:
\`\`\`env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
\`\`\`

Create a \`.env\` file in the client directory:
\`\`\`env
VITE_API_URL=http://localhost:5000
\`\`\`

### Running the Application

1. Start the backend server:
\`\`\`bash
cd server
npm run dev
\`\`\`

2. Start the frontend development server:
\`\`\`bash
cd client
npm run dev
\`\`\`

## Real-time Features

- **Live Viewer Tracking**: Tracks active students viewing each event
- **Automatic Cleanup**: Removes inactive viewers after 30 seconds
- **Room-based Broadcasting**: Efficient event-specific updates
- **Heartbeat System**: Maintains accurate viewer counts

## Security Features

- JWT-based authentication
- Role-based access control
- Secure password hashing
- Protected API endpoints
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
