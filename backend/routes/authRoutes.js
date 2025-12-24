// Import Express to create router
const express = require('express');
// Import User model to interact with database
const User = require('../models/User');
// Import bcryptjs to hash passwords
const bcrypt = require('bcryptjs');
// Import jsonwebtoken to create authentication tokens
const jwt = require('jsonwebtoken');

// Create router to handle routes
const router = express.Router();

// Password validation function
const validatePassword = (password) => {
    if (!password || password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false; // At least 1 uppercase
    if (!/[a-z]/.test(password)) return false; // At least 1 lowercase
    if (!/[0-9]/.test(password)) return false; // At least 1 number
    if (!/[@#$%!&*^()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false; // At least 1 special char
    return true;
};

// POST /register - Register a new user
router.post('/register', async (req, res) => {
    try {
        // Get name, email, and password from request body
        const { name, email, password } = req.body;

        // Check if all required fields are provided
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and password'
            });
        }

        // Validate password strength
        if (!validatePassword(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
            });
        }

        // Check if user with this email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash the password before saving to database
        // saltRounds = 10 means how many times to hash (more secure but slower)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate username from email if not provided
        const username = email.split('@')[0].toLowerCase();

        // Create new user in database with hashed password
        const user = await User.create({
            name,
            email,
            username,
            password: hashedPassword
        });

        // Return success response (don't send password back)
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone || null,
                username: user.username || null,
                profileImage: user.profileImage || null,
                role: user.role,
                isVerified: user.isVerified,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        // If any error occurs, send error response
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// POST /login - Login an existing user
router.post('/login', async (req, res) => {
    try {
        // Get email and password from request body
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user by email and include password field (needed for comparison)
        // We use .select('+password') because password has select: false in model
        const user = await User.findOne({ email }).select('+password');
        
        // Check if user exists
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Compare provided password with hashed password in database
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        
        // If password doesn't match, return error
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // If password matches, create JWT token
        // Token contains user ID, expires in 30 days
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        // Return success response with token
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token: token,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                username: user.username,
                profileImage: user.profileImage,
                role: user.role,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        // If any error occurs, send error response
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
});

// Import protect middleware for /me endpoint
const protect = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const { 
    generateVerificationToken, 
    generatePasswordResetToken,
    sendVerificationEmail, 
    sendPasswordResetEmail,
    sendSecurityAlertEmail 
} = require('../services/emailService');

// Configure multer for profile image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/profiles/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

// GET /auth/me - return current authenticated user (token required)
router.get('/me', protect, (req, res) => {
    res.status(200).json({ success: true, data: req.user || null });
});

// PUT /auth/profile - Update user profile
router.put('/profile', protect, upload.single('profileImage'), async (req, res) => {
    try {
        const { name, email, phone, username } = req.body;
        const userId = req.user._id;

        // Validation
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: 'Name and email are required'
            });
        }

        // Validate email format
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address'
            });
        }

        // Validate username format if provided
        if (username) {
            const usernameRegex = /^[a-zA-Z0-9_]+$/;
            if (!usernameRegex.test(username)) {
                return res.status(400).json({
                    success: false,
                    message: 'Username can only contain letters, numbers, and underscores'
                });
            }
            if (username.length < 3 || username.length > 20) {
                return res.status(400).json({
                    success: false,
                    message: 'Username must be between 3 and 20 characters'
                });
            }
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use'
                });
            }
            user.email = email;
        }

        // Check if username is being changed and if it's already taken
        if (username) {
            const normalizedUsername = username.toLowerCase();
            // Only check for duplicates if username is actually changing
            if (normalizedUsername !== (user.username || '').toLowerCase()) {
                const existingUsername = await User.findOne({ 
                    username: normalizedUsername,
                    _id: { $ne: userId } // Exclude current user
                });
                if (existingUsername) {
                    return res.status(400).json({
                        success: false,
                        message: 'Username already taken'
                    });
                }
                user.username = normalizedUsername;
            }
        }

        // Update fields safely
        if (name) user.name = name.trim();
        if (phone !== undefined) user.phone = phone.trim();
        
        // Update profile image if uploaded
        if (req.file) {
            user.profileImage = `/uploads/profiles/${req.file.filename}`;
        }

        await user.save();
        
        console.log('Profile updated successfully:', {
            name: user.name,
            username: user.username,
            email: user.email,
            phone: user.phone
        });

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                username: user.username,
                profileImage: user.profileImage,
                role: user.role,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating profile',
            error: error.message
        });
    }
});

// PUT /auth/change-password - Change user password
router.put('/change-password', protect, async (req, res) => {
    try {
        console.log('=== Password Change Request ===');
        console.log('User ID:', req.user._id);
        console.log('Request body:', { ...req.body, currentPassword: '***', newPassword: '***' });
        
        const { currentPassword, newPassword } = req.body;
        const userId = req.user._id;

        // Validation
        if (!currentPassword || !newPassword) {
            console.log('Missing passwords');
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            });
        }

        if (!validatePassword(newPassword)) {
            console.log('Password does not meet requirements');
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
            });
        }

        // Find user with password
        const user = await User.findById(userId).select('+password');
        if (!user) {
            console.log('User not found');
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('User found:', user.email);

        // Verify current password
        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
        console.log('Current password correct:', isPasswordCorrect);
        
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Check if new password is same as current
        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        console.log('New password same as current:', isSamePassword);
        
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: 'New password must be different from current password'
            });
        }

        // Hash new password
        console.log('Hashing new password...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        user.password = hashedPassword;
        await user.save();

        console.log('Password changed successfully!');
        
        // Send security alert email
        await sendSecurityAlertEmail(
            user.email,
            user.name,
            'Your password was changed successfully. If you did not make this change, please contact support immediately.'
        );
        
        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while changing password',
            error: error.message
        });
    }
});

// POST /auth/send-verification - Send or resend email verification
router.post('/send-verification', protect, async (req, res) => {
    try {
        const userId = req.user._id;

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if already verified
        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified'
            });
        }

        // Generate verification token
        const { token, expiry } = generateVerificationToken();
        
        user.emailVerificationToken = token;
        user.emailVerificationExpire = expiry;
        await user.save();

        // Send verification email
        await sendVerificationEmail(user.email, token, user.name);

        res.status(200).json({
            success: true,
            message: 'Verification email sent successfully. Please check your inbox.'
        });

    } catch (error) {
        console.error('Send verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while sending verification email',
            error: error.message
        });
    }
});

// GET /auth/verify-email/:token - Verify email with token
router.get('/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;

        // Find user with valid token
        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token'
            });
        }

        // Mark as verified and clear token
        user.isVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Email verified successfully!',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified
            }
        });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during email verification',
            error: error.message
        });
    }
});

// POST /auth/request-password-reset - Request password reset email
router.post('/request-password-reset', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide your email address'
            });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        
        // Always return success to prevent email enumeration
        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'If that email exists, a password reset link has been sent'
            });
        }

        // Generate reset token
        const { token, expiry } = generatePasswordResetToken();
        
        user.passwordResetToken = token;
        user.passwordResetExpire = expiry;
        await user.save();

        // Send reset email
        await sendPasswordResetEmail(user.email, token, user.name);

        res.status(200).json({
            success: true,
            message: 'If that email exists, a password reset link has been sent'
        });

    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while processing password reset request',
            error: error.message
        });
    }
});

// POST /auth/reset-password/:token - Reset password with token
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a new password'
            });
        }

        if (!validatePassword(newPassword)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character'
            });
        }

        // Find user with valid reset token
        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired password reset token'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        user.password = hashedPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpire = undefined;
        await user.save();

        // Send security alert
        await sendSecurityAlertEmail(
            user.email,
            user.name,
            'Your password was reset successfully. If you did not make this change, please contact support immediately.'
        );

        res.status(200).json({
            success: true,
            message: 'Password reset successfully. You can now login with your new password.'
        });

    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while resetting password',
            error: error.message
        });
    }
});

// GET /auth/account-activity - Get account security activity
router.get('/account-activity', protect, async (req, res) => {
    try {
        const user = req.user;

        const activity = {
            lastLogin: user.lastLogin,
            accountCreated: user.createdAt,
            emailVerified: user.isVerified,
            lastPasswordChange: user.updatedAt, // Approximate - password changes update the user
            accountAge: Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))
        };

        res.status(200).json({
            success: true,
            data: activity
        });

    } catch (error) {
        console.error('Account activity error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching account activity',
            error: error.message
        });
    }
});

// Export router to use in server.js
module.exports = router;

