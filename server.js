const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
}

// Port configuration with fallback
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'ecoquest-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/ecoquest'
  }),
  cookie: { 
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// MongoDB connection with enhanced error handling
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecoquest';
    console.log('Attempting to connect to MongoDB...');
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('\n📋 MongoDB Setup Instructions:');
    console.log('1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
    console.log('2. Or use MongoDB Atlas: https://www.mongodb.com/atlas');
    console.log('3. Update MONGODB_URI in .env file with your connection string');
    console.log('\n⚠️  Application will continue running but database features will not work');
  }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

// Initialize database connection
connectDB();

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  profilePicture: { type: String, default: '' },
  points: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  completedChallenges: [{ 
    challengeId: String, 
    completedAt: Date,
    photoUrl: String,
    approved: { type: Boolean, default: false }
  }],
  achievements: [{
    achievementId: String,
    unlockedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Challenge Schema
const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  points: { type: Number, required: true },
  type: { type: String, enum: ['daily', 'weekly'], required: true },
  category: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Challenge = mongoose.model('Challenge', challengeSchema);

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '') || req.session.token;
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

// Admin middleware
const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

// Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  const healthStatus = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    version: require('./package.json').version,
    environment: process.env.NODE_ENV || 'development'
  };
  res.json(healthStatus);
});

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/admin-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-login.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

// API Routes

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email or username.' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    req.session.token = token;
    req.session.userId = user._id;

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        points: user.points,
        level: user.level
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, username: user.username, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    req.session.token = token;
    req.session.userId = user._id;

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        points: user.points,
        level: user.level,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out.' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
app.put('/api/profile', authenticateToken, upload.single('profilePicture'), async (req, res) => {
  try {
    const { username, email } = req.body;
    const updateData = { username, email };
    
    if (req.file) {
      updateData.profilePicture = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updateData,
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get challenges
app.get('/api/challenges', authenticateToken, async (req, res) => {
  try {
    const challenges = await Challenge.find({ isActive: true });
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get leaderboard
app.get('/api/leaderboard', authenticateToken, async (req, res) => {
  try {
    const users = await User.find()
      .select('username points level completedChallenges')
      .sort({ points: -1, level: -1 })
      .limit(50);
    
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get user analytics
app.get('/api/analytics', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const completedChallenges = user.completedChallenges.filter(c => c.approved);
    const totalPoints = user.points;
    const currentLevel = user.level;
    
    // Calculate environmental impact
    const environmentalImpact = {
      co2Saved: completedChallenges.length * 2.5, // kg CO2
      waterSaved: completedChallenges.length * 15, // liters
      wasteReduced: completedChallenges.length * 0.8, // kg
      treesEquivalent: Math.floor(completedChallenges.length / 4)
    };
    
    // Calculate streaks and trends
    const analytics = {
      totalChallenges: completedChallenges.length,
      totalPoints,
      currentLevel,
      environmentalImpact,
      streak: Math.min(completedChallenges.length, 10), // Simplified
      weeklyProgress: Math.floor(Math.random() * 5) + 1, // Mock data
      monthlyProgress: Math.floor(Math.random() * 20) + 5 // Mock data
    };
    
    res.json({ success: true, data: analytics });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get user achievements
app.get('/api/achievements', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Define all available achievements
    const allAchievements = [
      {
        id: 'first_challenge',
        name: 'First Steps',
        description: 'Complete your first challenge',
        icon: 'fa-seedling',
        color: '#4CAF50',
        requirement: 1
      },
      {
        id: 'five_challenges',
        name: 'Getting Started',
        description: 'Complete 5 challenges',
        icon: 'fa-leaf',
        color: '#66BB6A',
        requirement: 5
      },
      {
        id: 'ten_challenges',
        name: 'Eco Warrior',
        description: 'Complete 10 challenges',
        icon: 'fa-tree',
        color: '#4CAF50',
        requirement: 10
      },
      {
        id: 'level_5',
        name: 'Rising Star',
        description: 'Reach level 5',
        icon: 'fa-star',
        color: '#FF9800',
        requirement: 5
      },
      {
        id: 'level_10',
        name: 'Eco Champion',
        description: 'Reach level 10',
        icon: 'fa-trophy',
        color: '#FFD700',
        requirement: 10
      },
      {
        id: 'points_500',
        name: 'Point Master',
        description: 'Earn 500 points',
        icon: 'fa-coins',
        color: '#FFC107',
        requirement: 500
      },
      {
        id: 'tree_planter',
        name: 'Tree Planter',
        description: 'Complete the "Plant a Tree" challenge',
        icon: 'fa-tree',
        color: '#2E7D32',
        requirement: 1
      },
      {
        id: 'recycler',
        name: 'Master Recycler',
        description: 'Complete 3 recycling challenges',
        icon: 'fa-recycle',
        color: '#00BCD4',
        requirement: 3
      }
    ];
    
    const completedCount = user.completedChallenges.filter(c => c.approved).length;
    
    // Check which achievements are unlocked
    const achievements = allAchievements.map(achievement => {
      let unlocked = false;
      let progress = 0;
      
      if (achievement.id === 'first_challenge' || achievement.id === 'five_challenges' || achievement.id === 'ten_challenges') {
        progress = completedCount;
        unlocked = completedCount >= achievement.requirement;
      } else if (achievement.id === 'level_5' || achievement.id === 'level_10') {
        progress = user.level;
        unlocked = user.level >= achievement.requirement;
      } else if (achievement.id === 'points_500') {
        progress = user.points;
        unlocked = user.points >= achievement.requirement;
      } else if (achievement.id === 'tree_planter') {
        const treeChallenges = user.completedChallenges.filter(c => 
          c.approved && c.challengeId && c.challengeId.toString().includes('tree')
        );
        progress = treeChallenges.length;
        unlocked = treeChallenges.length >= achievement.requirement;
      } else if (achievement.id === 'recycler') {
        const recycleChallenges = user.completedChallenges.filter(c => 
          c.approved && c.challengeId && (
            c.challengeId.toString().includes('recycle') || 
            c.challengeId.toString().includes('waste')
          )
        );
        progress = recycleChallenges.length;
        unlocked = recycleChallenges.length >= achievement.requirement;
      }
      
      const userAchievement = user.achievements.find(a => a.achievementId === achievement.id);
      
      return {
        ...achievement,
        unlocked,
        progress,
        unlockedAt: userAchievement ? userAchievement.unlockedAt : null
      };
    });
    
    res.json({ success: true, data: achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Complete challenge
app.post('/api/challenges/:id/complete', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    const challengeId = req.params.id;
    const challenge = await Challenge.findById(challengeId);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found.' });
    }

    const user = await User.findById(req.user.userId);
    
    // Check if challenge already completed
    const alreadyCompleted = user.completedChallenges.some(
      comp => comp.challengeId === challengeId
    );
    
    if (alreadyCompleted) {
      return res.status(400).json({ message: 'Challenge already completed.' });
    }

    const photoUrl = req.file ? `/uploads/${req.file.filename}` : '';
    
    // Add to completed challenges
    user.completedChallenges.push({
      challengeId,
      completedAt: new Date(),
      photoUrl,
      approved: false // Requires admin approval
    });

    await user.save();

    res.json({ message: 'Challenge completed! Awaiting admin approval.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin routes

// Get all users (admin only)
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get pending approvals (admin only)
app.get('/api/admin/pending-approvals', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({
      'completedChallenges.approved': false
    }).select('-password');
    
    const pendingApprovals = [];
    
    for (const user of users) {
      for (const completion of user.completedChallenges) {
        if (!completion.approved) {
          const challenge = await Challenge.findById(completion.challengeId);
          pendingApprovals.push({
            userId: user._id,
            username: user.username,
            challengeId: completion.challengeId,
            challengeTitle: challenge ? challenge.title : 'Unknown Challenge',
            photoUrl: completion.photoUrl,
            completedAt: completion.completedAt,
            points: challenge ? challenge.points : 0
          });
        }
      }
    }
    
    res.json(pendingApprovals);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Approve/reject challenge completion (admin only)
app.post('/api/admin/approve-challenge', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId, challengeId, approved } = req.body;
    
    const user = await User.findById(userId);
    const challenge = await Challenge.findById(challengeId);
    
    if (!user || !challenge) {
      return res.status(404).json({ message: 'User or challenge not found.' });
    }

    // Find the completion record
    const completionIndex = user.completedChallenges.findIndex(
      comp => comp.challengeId === challengeId && !comp.approved
    );
    
    if (completionIndex === -1) {
      return res.status(404).json({ message: 'Completion record not found.' });
    }

    if (approved) {
      // Approve and award points
      user.completedChallenges[completionIndex].approved = true;
      user.points += challenge.points;
      
      // Calculate level (every 100 points = 1 level)
      const oldLevel = user.level;
      user.level = Math.floor(user.points / 100) + 1;
      
      // Check for new achievements
      const completedCount = user.completedChallenges.filter(c => c.approved).length;
      const newAchievements = [];
      
      // First challenge achievement
      if (completedCount === 1 && !user.achievements.find(a => a.achievementId === 'first_challenge')) {
        user.achievements.push({ achievementId: 'first_challenge' });
        newAchievements.push('First Steps');
      }
      
      // Five challenges achievement
      if (completedCount === 5 && !user.achievements.find(a => a.achievementId === 'five_challenges')) {
        user.achievements.push({ achievementId: 'five_challenges' });
        newAchievements.push('Getting Started');
      }
      
      // Ten challenges achievement
      if (completedCount === 10 && !user.achievements.find(a => a.achievementId === 'ten_challenges')) {
        user.achievements.push({ achievementId: 'ten_challenges' });
        newAchievements.push('Eco Warrior');
      }
      
      // Level achievements
      if (user.level >= 5 && oldLevel < 5 && !user.achievements.find(a => a.achievementId === 'level_5')) {
        user.achievements.push({ achievementId: 'level_5' });
        newAchievements.push('Rising Star');
      }
      
      if (user.level >= 10 && oldLevel < 10 && !user.achievements.find(a => a.achievementId === 'level_10')) {
        user.achievements.push({ achievementId: 'level_10' });
        newAchievements.push('Eco Champion');
      }
      
      // Points achievement
      if (user.points >= 500 && !user.achievements.find(a => a.achievementId === 'points_500')) {
        user.achievements.push({ achievementId: 'points_500' });
        newAchievements.push('Point Master');
      }
    } else {
      // Remove the completion record if rejected
      user.completedChallenges.splice(completionIndex, 1);
    }

    await user.save();

    res.json({ 
      message: approved ? 'Challenge approved!' : 'Challenge rejected!',
      user: {
        id: user._id,
        username: user.username,
        points: user.points,
        level: user.level
      },
      newAchievements: approved ? newAchievements : []
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user (admin only)
app.delete('/api/admin/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Prevent admin from deleting themselves
    if (userId === req.user.userId) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // Prevent deleting other admin accounts
    if (user.isAdmin) {
      return res.status(403).json({ message: 'Cannot delete admin accounts.' });
    }
    
    // Delete user's uploaded photos if any
    if (user.profilePicture && user.profilePicture.startsWith('/uploads/')) {
      const photoPath = path.join(__dirname, user.profilePicture);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }
    
    // Delete challenge completion photos
    for (const completion of user.completedChallenges) {
      if (completion.photoUrl && completion.photoUrl.startsWith('/uploads/')) {
        const photoPath = path.join(__dirname, completion.photoUrl);
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
        }
      }
    }
    
    await User.findByIdAndDelete(userId);
    
    res.json({ 
      message: `User "${user.username}" has been successfully removed from the platform.`,
      success: true
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Initialize default challenges
async function initializeChallenges() {
  try {
    const challengeCount = await Challenge.countDocuments();
    if (challengeCount === 0) {
      const defaultChallenges = [
        {
          title: "Plant a Tree",
          description: "Plant a tree in your neighborhood or garden and take a photo",
          points: 50,
          type: "weekly",
          category: "Environment"
        },
        {
          title: "Sort Your Waste",
          description: "Sort garbage into dry, wet, recyclable, and electronic waste categories",
          points: 20,
          type: "daily",
          category: "Waste Management"
        },
        {
          title: "Reuse Packaging",
          description: "Find a creative way to reuse a packaging box or container",
          points: 30,
          type: "weekly",
          category: "Recycling"
        },
        {
          title: "Best Out of Waste",
          description: "Create something useful from waste materials",
          points: 40,
          type: "weekly",
          category: "Creativity"
        },
        {
          title: "Use Public Transport",
          description: "Use public transportation instead of private vehicle for a day",
          points: 25,
          type: "daily",
          category: "Transportation"
        },
        {
          title: "Save Water",
          description: "Implement a water-saving technique in your daily routine",
          points: 15,
          type: "daily",
          category: "Conservation"
        }
      ];

      await Challenge.insertMany(defaultChallenges);
      console.log('Default challenges initialized');
    }
  } catch (error) {
    console.error('Error initializing challenges:', error);
  }
}

// Create admin user if doesn't exist
async function createAdminUser() {
  try {
    const adminExists = await User.findOne({ isAdmin: true });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new User({
        username: 'admin',
        email: 'admin@ecoquest.com',
        password: hashedPassword,
        isAdmin: true
      });
      await admin.save();
      console.log('Admin user created: admin@ecoquest.com / admin123');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Start server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Access locally at: http://localhost:${PORT}`);
  console.log(`Access from network at: http://<your-ip>:${PORT}`);
  await initializeChallenges();
  await createAdminUser();
});

module.exports = app;