# JobNest - Job & Internship Portal

JobNest is a comprehensive job and internship portal designed for students, freshers, and professionals to discover opportunities across India. Built with the MERN stack, it provides a seamless experience for job seekers to find, apply, and track their applications.

## 🌟 Features

### For Job Seekers
- **Browse Jobs & Internships**: Search and filter through hundreds of opportunities
- **Smart Search**: Search by title, location, company, and job type
- **Company Profiles**: View detailed information about companies and their openings
- **Easy Application**: Apply with a single click with your profile and resume
- **Application Tracking**: Track all your applications in one place
- **User Profile Management**: 
  - Upload profile picture
  - Update personal information
  - Change password securely
  - View account details

### For Recruiters
- **Post Jobs**: Easy job posting interface for recruiters
- **Job Management**: Manage posted jobs and applications

### General Features
- **Secure Authentication**: JWT-based authentication system
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Theme**: Modern dark UI with gradient accents
- **Real-time Updates**: Live job listings from multiple sources
- **Indian Market Focus**: Tailored for Indian cities and opportunities

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **TailwindCSS** - Styling
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads

## 📋 Prerequisites

Before running this project, make sure you have:
- Node.js (v14 or higher)
- MongoDB (local or Atlas cloud)
- npm or yarn package manager

## 🚀 Installation & Setup

### 1. Clone or Download the Project
```bash
cd "Internfinder1 atlas"
```

### 2. Backend Setup
```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
# Add the following variables:
MONGO_URI=mongodb://localhost:27017/jobnest
JWT_SECRET=your_jwt_secret_key_here
PORT=3100
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup
```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install
```

### 4. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# For macOS (if installed via Homebrew)
brew services start mongodb-community

# For Linux
sudo systemctl start mongod

# For Windows
# Start MongoDB service from Services panel
```

## ▶️ Running the Application

### Start Backend Server
```bash
cd backend
npm start
```
Backend will run on: `http://localhost:3100`

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
Frontend will run on: `http://localhost:3000`

## 📁 Project Structure

```
JobNest/
├── backend/
│   ├── config/          # Database and configuration files
│   ├── middleware/      # Authentication middleware
│   ├── models/          # MongoDB models (User, Job, Application)
│   ├── routes/          # API routes
│   ├── services/        # Email and external job services
│   ├── scripts/         # Database seed scripts
│   ├── uploads/         # User uploads (resumes, profile images)
│   └── server.js        # Express server entry point
│
└── frontend/
    ├── public/          # Static assets (logos)
    ├── src/
    │   ├── components/  # Reusable UI components
    │   ├── context/     # React Context (Auth)
    │   ├── pages/       # Page components
    │   ├── services/    # API service layer
    │   ├── styles/      # CSS files
    │   └── utils/       # Utility functions
    └── package.json
```

## 🔑 Key Features Explained

### Authentication System
- Secure registration and login with JWT tokens
- Password hashing with bcrypt
- Protected routes for authenticated users
- Token-based session management

### Job Management
- Browse jobs from internal database
- Search and filter capabilities
- Detailed job descriptions
- Company information and logos

### Application System
- One-click apply functionality
- Resume upload support
- Application status tracking
- Cancel application option
- View application history

### Profile Management
- Upload and update profile picture
- Edit personal information
- Secure password change
- View account status and details

## 🎨 UI/UX Highlights

- **Dark Theme**: Modern dark color scheme with violet/fuchsia gradients
- **Responsive Design**: Mobile-first approach
- **Smooth Animations**: Hover effects and transitions
- **Toast Notifications**: User-friendly feedback messages
- **Loading States**: Skeleton loaders for better UX
- **Protected Routes**: Automatic redirect for unauthorized access

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API endpoints
- Input validation and sanitization
- File upload restrictions (size and type)
- CORS configuration
- Secure cookie handling

## 📊 Database Models

### User
- Name, Email, Password
- Phone, Profile Image
- Role (user/admin/recruiter)
- Verification status

### Job
- Title, Company, Description
- Location, Salary, Type
- Requirements, Experience
- Application deadline

### Application
- User reference
- Job reference
- Resume upload
- Application status
- Timestamps

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs/add` - Post new job (auth required)

### Applications
- `POST /api/apply/:jobId` - Apply for job
- `GET /api/applications/user` - Get user applications
- `DELETE /api/applications/:id` - Cancel application

### Companies
- `GET /api/companies` - Get all companies
- `GET /api/companies/:name` - Get company details

## 🎯 Future Enhancements

- Email verification system
- Advanced search filters
- Job recommendations based on profile
- Recruiter dashboard
- Application analytics
- Notification system
- Chat/messaging between recruiters and candidates
- Interview scheduling
- Skill assessments

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check MONGO_URI in .env file
- Verify database name is correct

### Port Already in Use
- Change PORT in backend .env file
- Update API_URL in frontend services/api.js

### CORS Errors
- Verify frontend URL in backend CORS configuration
- Check if both servers are running

## 👨‍💻 Developer

Built with ❤️ using MERN Stack to help you build your future.

## 📝 License

This project is for educational purposes.

## 📧 Contact

For questions or support, please contact the development team.

---

**Happy Job Hunting! 🎉**
