// Email service for sending verification and notification emails
const crypto = require('crypto');

/**
 * Generate a random verification token
 * @returns {string} - Random hex token
 */
const generateToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate verification token with expiry
 * @returns {Object} - Token and expiry date
 */
const generateVerificationToken = () => {
    const token = generateToken();
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    return { token, expiry };
};

/**
 * Generate password reset token with expiry
 * @returns {Object} - Token and expiry date
 */
const generatePasswordResetToken = () => {
    const token = generateToken();
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    return { token, expiry };
};

/**
 * Send verification email (mock function - replace with actual email service)
 * In production, use services like SendGrid, AWS SES, or Nodemailer with SMTP
 * @param {string} email - User's email address
 * @param {string} token - Verification token
 * @param {string} userName - User's name
 */
const sendVerificationEmail = async (email, token, userName) => {
    try {
        // Generate verification link
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${token}`;
        
        console.log('\n=== EMAIL VERIFICATION ===');
        console.log('To:', email);
        console.log('Subject: Verify Your Email Address');
        console.log('Verification URL:', verificationUrl);
        console.log(`
Dear ${userName},

Thank you for registering! Please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account, please ignore this email.

Best regards,
JobNest Team
        `);
        console.log('========================\n');

        // TODO: Replace with actual email service
        // Example with Nodemailer:
        /*
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        await transporter.sendMail({
            from: `"JobNest" <${process.env.FROM_EMAIL}>`,
            to: email,
            subject: 'Verify Your Email Address',
            html: `
                <h2>Welcome to JobNest!</h2>
                <p>Hi ${userName},</p>
                <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
                <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #8b5cf6; color: white; text-decoration: none; border-radius: 8px;">Verify Email</a>
                <p>Or copy and paste this link: ${verificationUrl}</p>
                <p>This link will expire in 24 hours.</p>
                <p>If you didn't create an account, please ignore this email.</p>
            `
        });
        */

        return { success: true };
    } catch (error) {
        console.error('Error sending verification email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send password reset email (mock function)
 * @param {string} email - User's email address
 * @param {string} token - Reset token
 * @param {string} userName - User's name
 */
const sendPasswordResetEmail = async (email, token, userName) => {
    try {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;
        
        console.log('\n=== PASSWORD RESET EMAIL ===');
        console.log('To:', email);
        console.log('Subject: Reset Your Password');
        console.log('Reset URL:', resetUrl);
        console.log(`
Dear ${userName},

We received a request to reset your password. Click the link below to reset it:

${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email or contact support if you have concerns.

Best regards,
JobNest Team
        `);
        console.log('===========================\n');

        return { success: true };
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send account security alert email
 * @param {string} email - User's email address
 * @param {string} userName - User's name
 * @param {string} activity - Description of security activity
 */
const sendSecurityAlertEmail = async (email, userName, activity) => {
    try {
        console.log('\n=== SECURITY ALERT ===');
        console.log('To:', email);
        console.log('Subject: Security Alert - Account Activity');
        console.log(`
Dear ${userName},

We detected the following activity on your account:

${activity}

If this was you, you can safely ignore this email.
If you didn't perform this action, please secure your account immediately.

Best regards,
JobNest Security Team
        `);
        console.log('======================\n');

        return { success: true };
    } catch (error) {
        console.error('Error sending security alert:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    generateVerificationToken,
    generatePasswordResetToken,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendSecurityAlertEmail
};
