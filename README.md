# Rehearsal Scheduler

A modern web application designed to help bands and music groups efficiently schedule rehearsals, track attendance, and optimize meeting times based on member availability.

## Features

- **User Authentication:** Secure login system with role-based permissions (band leaders vs. members)
- **Band Management:** Create and manage multiple bands/ensembles
- **Rehearsal Scheduling:** Create, edit, and manage rehearsal events with recurring options
- **Availability Management:** Members can set regular availability and specific unavailable dates
- **Attendance Tracking:** RSVP system and automated attendance statistics
- **Optimal Time Suggestions:** Smart algorithm to suggest best rehearsal times
- **Notifications:** Email and push notification system for rehearsal reminders
- **Calendar Integration:** Sync with Google Calendar, Apple Calendar, and Outlook
- **Resource Sharing:** Upload and share sheet music, audio files, and set lists
- **Mobile Responsive:** Fully functional experience on all devices

## Technology Stack

### Frontend
- React.js with TypeScript
- Redux Toolkit for state management
- Material-UI components
- D3.js for availability visualization
- React-Big-Calendar for calendar components
- Progressive Web App (PWA) capabilities

### Backend
- Node.js with Express
- MongoDB database
- JWT authentication with OAuth 2.0
- AWS S3 for file storage
- SendGrid for email notifications
- Firebase Cloud Messaging for push notifications

## Getting Started

### Prerequisites
- Node.js (v18.x or higher)
- npm (v8.x or higher)
- MongoDB (v5.x or higher)
- AWS account (for S3 storage)
- SendGrid account (for email notifications)
- Firebase account (for push notifications)

### Installation

1. Clone the repository
```bash
git clone https://github.com/dxaginfo/rehearsal-scheduler-2025-06-19.git
cd rehearsal-scheduler-2025-06-19
```

2. Install dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

3. Configure environment variables
```bash
# In the server directory, create a .env file
cp .env.example .env

# In the client directory, create a .env file
cp .env.example .env
```

4. Set up your environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Secret for JWT token generation
   - `AWS_ACCESS_KEY` and `AWS_SECRET_KEY`: For S3 access
   - `SENDGRID_API_KEY`: For email sending
   - `FIREBASE_CONFIG`: For push notifications

5. Start the development servers
```bash
# Start backend server (from server directory)
npm run dev

# Start frontend development server (from client directory)
npm start
```

### Project Structure

```
rehearsal-scheduler/
├── client/                 # Frontend React application
│   ├── public/             # Static files
│   ├── src/                # Source files
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── redux/          # Redux state management
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   └── App.tsx         # Main application component
│   └── package.json        # Frontend dependencies
│
├── server/                 # Backend Node.js/Express application
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── app.js          # Express application setup
│   └── package.json        # Backend dependencies
│
├── .gitignore              # Git ignore file
└── README.md               # Project documentation
```

## Deployment

### Frontend Deployment (Vercel)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy the client directory

### Backend Deployment (AWS Elastic Beanstalk)
1. Create an Elastic Beanstalk environment
2. Configure environment variables
3. Deploy the server directory

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements
- [Create React App](https://create-react-app.dev/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Material-UI](https://mui.com/)
- [React-Big-Calendar](https://github.com/jquense/react-big-calendar)