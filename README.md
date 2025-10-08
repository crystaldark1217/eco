# 🌱 EcoQuest - Gamified Eco-Friendly Habits

A gamified web application that motivates users to adopt eco-friendly habits through challenges, points, and leveling systems.

## ✨ Features

- **User Authentication**: Secure registration and login system
- **Gamification**: Points, levels, and achievement system
- **Challenge System**: Daily and weekly eco-friendly challenges
- **Photo Verification**: Upload photos to verify challenge completion
- **Admin Panel**: Manage users and approve challenge submissions
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Real-time Updates**: Dynamic content updates without page refresh

## 🚀 Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- MongoDB (local installation or MongoDB Atlas account)

### Installation

1. **Clone or download the project**
   ```bash
   cd ecoquest
   ```

2. **Run the setup script**
   ```bash
   npm run setup
   ```
   This will:
   - Install all dependencies
   - Create necessary directories
   - Set up environment configuration
   - Check MongoDB connection
   - Provide setup instructions

3. **Start the application**
   ```bash
   npm start
   ```

4. **Access the application**
   - Open your browser and go to `http://localhost:3000`
   - Use the default admin credentials:
     - Email: `admin@ecoquest.com`
     - Password: `admin123`

## 🗄️ Database Setup

### Option 1: MongoDB Atlas (Recommended)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update the `MONGODB_URI` in your `.env` file:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ecoquest?retryWrites=true&w=majority
   ```

### Option 2: Local MongoDB

1. Download and install [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Start the MongoDB service
3. The application will automatically connect to `mongodb://localhost:27017/ecoquest`

## 📁 Project Structure

```
ecoquest/
├── public/                 # Frontend files
│   ├── index.html         # Landing page
│   ├── login.html         # Login page
│   ├── register.html      # Registration page
│   ├── dashboard.html     # User dashboard
│   ├── admin.html         # Admin panel
│   ├── profile.html       # User profile
│   ├── styles.css         # CSS styles
│   └── script.js          # Client-side JavaScript
├── uploads/               # File upload directory
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables
├── setup.js               # Setup script
└── README.md              # This file
```

## 🎮 How to Use

### For Users

1. **Register**: Create a new account on the registration page
2. **Login**: Sign in to access your dashboard
3. **View Challenges**: Browse available daily and weekly challenges
4. **Complete Challenges**: Upload photos to verify challenge completion
5. **Earn Points**: Get points for approved challenges and level up
6. **Track Progress**: Monitor your eco-friendly journey

### For Admins

1. **Login**: Use admin credentials to access the admin panel
2. **Manage Users**: View all registered users and their progress
3. **Review Submissions**: Approve or reject challenge submissions
4. **Monitor Activity**: Track platform usage and user engagement

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ecoquest

# Security Keys
JWT_SECRET=your-jwt-secret-key
SESSION_SECRET=your-session-secret-key

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
```

## 🛠️ Development

### Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with auto-reload
- `npm run setup` - Run the setup script
- `npm test` - Run tests (placeholder)

### Development Mode

For development with auto-reload:

```bash
npm run dev
```

This uses nodemon to automatically restart the server when files change.

## 🌟 Default Challenges

The application comes with pre-configured challenges:

1. **Plant a Tree** (50 points) - Weekly
2. **Sort Your Waste** (20 points) - Daily
3. **Reuse Packaging** (30 points) - Weekly
4. **Best Out of Waste** (40 points) - Weekly
5. **Use Public Transport** (25 points) - Daily
6. **Save Water** (15 points) - Daily

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Session management
- File upload validation
- Input sanitization
- Admin role protection

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes and orientations

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running (local) or connection string is correct (Atlas)
   - Check firewall settings
   - Verify network connectivity

2. **Port Already in Use**
   - Change the PORT in `.env` file
   - Kill the process using the port: `netstat -ano | findstr :3000`

3. **File Upload Issues**
   - Check if `uploads/` directory exists
   - Verify file permissions
   - Ensure file size is within limits

4. **Authentication Problems**
   - Clear browser localStorage
   - Check JWT_SECRET in `.env`
   - Verify token expiration

### Getting Help

If you encounter issues:

1. Check the console for error messages
2. Review the `ISSUES_AND_FIXES.md` file
3. Ensure all dependencies are installed
4. Verify environment configuration

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the project
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 🌍 Environmental Impact

EcoQuest promotes sustainable living through:
- Waste reduction challenges
- Energy conservation activities
- Transportation alternatives
- Environmental awareness
- Community engagement

---

**Made with 💚 for a sustainable future**