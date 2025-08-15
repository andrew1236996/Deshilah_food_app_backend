const bcrypt = require('bcryptjs');
const foodModels = require('../Models/foodModels');// Adjust the path if needed
const crypto = require('crypto');
const { createToken } = require('../utility/createToken');
const {sendEmail} = require('../utility/mailer');
const { verificationTemplate, createConfirmationEmail, passwordResetTemplate} = require('../utility/emailTemplate'); // Fixed: removed extra dots
const validator = require('validator');
// Register

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'required ' });
  }

  try {
    const existingUser = await foodModels.User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyTokenExpiry = Date.now() + 3600000;

    const newUser = new foodModels.User({
      name,
      email,
      password: hashPassword,
      isVerified: false,
      verifyToken,
      verifyTokenExpiry,
    });

    await newUser.save();

    const token = createToken(newUser._id);

    // 🔧 Temporarily disable email sending for testing
    
    const verifyUrl = `http://localhost:5000/api/food/verifyEmail/${verifyToken}`;
     
    const emailContent = verificationTemplate(newUser.name, verifyUrl);

    await sendEmail({
      to: newUser.email,
      subject: 'Email Verification - Your App',
      text: `Hi ${newUser.name},\n\nPlease verify your email by clicking the link below:\n${verifyUrl}`,
      html: emailContent,
    });
    

    res.status(201).json({
      message: 'Registration successful! (Email sending skipped for testing)',
      token: token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        isVerified: newUser.isVerified,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};


const verifyEmail = async (req, res) => {
  const { token } = req.params;
  console.log('Received token:', token);

  try {
    const user = await foodModels.User.findOne({ 
      verifyToken: token, 
      verifyTokenExpiry: { $gt: Date.now() } 
    });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// Login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await foodModels.User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({ error: 'Please verify your email before logging in' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
      
    }

    const token = createToken(user._id);

    res.status(200).json({
      message: 'Login successful',
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Resend verification email
const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await foodModels.User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email is already verified' });
    }

    // Generate new verification token
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const verifyTokenExpiry = Date.now() + 3600000; // 1 hour expiry

    user.verifyToken = verifyToken;
    user.verifyTokenExpiry = verifyTokenExpiry;
    await user.save();

    const verifyUrl = `http://localhost:5000/api/food/verifyEmail/${verifyToken}`;
    const emailContent = verificationTemplate(user.name, verifyUrl);

    await sendEmail({
      to: user.email,
      subject: 'Email Verification - Your App',
      text: `Hi ${user.name},\n\nPlease verify your email by clicking the link below:\n${verifyUrl}\n\nIf you didn't request this, you can ignore this email.\n\nBest regards,\nYour App Team`,
      html: emailContent,
    });

    res.status(200).json({
      message: 'Verification email sent successfully! Please check your email.',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

const logOutUser = (req, res) => {
  // Invalidate the token on the client side
  res.status(200).json({ message: 'User logged out successfully' });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await foodModels.User.findOne({ email });
    
    // Don't reveal if email exists for security
    if (!user) {
      return res.status(200).json({ 
        message: 'If an account with that email exists, a reset link has been sent' 
      });
    }
const userName = user.name || user.username || user.email;
    // Generate password reset token
    const resetPasswordToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpiry = Date.now() + 900000; // 15 minutes expiry

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpiry = resetPasswordExpiry;
    await user.save();

    const verifyUrl = `http://localhost:5000/resetpassword/${resetPasswordToken}`;
    const emailContent = passwordResetTemplate(userName, verifyUrl);

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request - Your App',
      text: `Hi ${userName},\n\nYou requested a password reset. Click the link below to reset your password:\n${verifyUrl}\n\nThis link will expire in 15 minutes.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nYour App Team`,
      html: emailContent,
    });

    res.status(200).json({
      message: 'If an account with that email exists, a reset link has been sent',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};
const verifyResetToken = async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ error: 'Reset token is required' });
  }

  try {
    const user = await foodModels.User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    });
console.log('🔍 Verifying token:', token);
console.log('🕐 Current time:', new Date());
console.log('👤 User found:', user.email);
console.log('⏰ Token expiry:', new Date(user.resetPasswordExpiry));
console.log('🔄 Time remaining:', user.resetPasswordExpiry - Date.now(), 'ms');
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    res.status(200).json({
      message: 'Reset token is valid',
      email: user.email
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Reset token is required' });
  }

  if (!password || !confirmPassword) {
    return res.status(400).json({ error: 'Password and confirmation are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    const user = await foodModels.User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset fields
    user.password = hashPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    user.passwordChangedAt = new Date();

    await user.save();

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Successful - Your App',
      text: `Hi ${user.name},\n\nYour password has been successfully reset.\n\nIf you didn't make this change, please contact support immediately.\n\nBest regards,\nYour App Team`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">Password Reset Successful</h2>
          <p>Hi ${user.name},</p>
          <p>Your password has been successfully reset.</p>
          <p>If you didn't make this change, please contact support immediately.</p>
          <p>Reset time: ${new Date().toLocaleString()}</p>
          <p>Best regards,<br>Your App Team</p>
        </div>
      `,
    });

    res.status(200).json({
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

const createReservation = async (req, res) => {
  try {
    const {
      name,
      email,
      phoneNumber,
    numberOfPersons,
      tableNumber,
      reservationDate,
      reservationTime, 
      specialRequest,
      message,
    } = req.body;

    // === 1. Validate required fields ===
   if (!numberOfPersons || !reservationDate || !reservationTime) {
  return res.status(400).json({ 
    error: 'Number of persons, reservation date, and reservation time are required',
    code: 'MISSING_REQUIRED_FIELDS'
  });
}


    // === 2. Validate number of persons ===
    if (!Number.isInteger(numberOfPersons) || numberOfPersons <= 0) {
      return res.status(400).json({ 
        error: 'Number of persons must be a positive integer',
        code: 'INVALID_PERSON_COUNT'
      });
    }

    // === 3. Validate reservation date ===
    const now = new Date();
    const dateToCheck = new Date(reservationDate);

    if (isNaN(dateToCheck.getTime())) {
      return res.status(400).json({ 
        error: 'Invalid reservation date format',
        code: 'INVALID_DATE_FORMAT'
      });
    }

    if (dateToCheck <= now) {
      return res.status(400).json({ 
        error: 'Reservation date must be in the future',
        code: 'INVALID_DATE_PAST'
      });
    }

    // === 4. Validate email (if provided) ===
    if (email && !validator.isEmail(email)) {
      return res.status(400).json({ 
        error: 'Invalid email address format',
        code: 'INVALID_EMAIL'
      });
    }

    // === 5. Validate phone number (if provided) ===
    if (phoneNumber && !validator.isMobilePhone(phoneNumber, 'any', { strictMode: false })) {
      return res.status(400).json({ 
        error: 'Invalid phone number format',
        code: 'INVALID_PHONE'
      });
    }

    // === 6. Prepare and sanitize reservation data ===
    const reservationData = {
      name: name?.trim() || null,
      email: email?.toLowerCase().trim() || null,
      phoneNumber: phoneNumber?.trim() || null,
      numberOfPersons: parseInt(numberOfPersons),
      tableNumber: tableNumber ? parseInt(tableNumber) : null,
      reservationDate: dateToCheck,
      reservationTime: reservationTime?.trim(),
      specialRequest: specialRequest?.trim() || null,
      message: message?.trim() || null,
    };

    // === 7. Save reservation to database ===
    const reservation = await foodModels.Reservation.create(reservationData);


    // === 8. Send confirmation email if email exists ===
    if (email) {
      try {
        const emailTemplate = createConfirmationEmail(reservation);
        await sendEmail({
          to: email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        });
        console.log(`Confirmation email sent to: ${email}`);
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Optional: Log or queue retry later
      }
    }

    // === 9. Respond with success ===
    return res.status(201).json({ 
      message: 'Reservation created successfully',
      reservation: {
        id: reservation.id,
        name: reservation.name,
        email: reservation.email,
        numberOfPersons: reservation.numberOfPersons,
        reservationDate: reservation.reservationDate,
        tableNumber: reservation.tableNumber,
        status: 'confirmed',
      },
      emailSent: !!email,
    });

  } catch (error) {
    console.error('Reservation creation error:', error);

    // === 10. Specific error handling ===
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: error.message,
        code: 'VALIDATION_ERROR'
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({ 
        error: 'A reservation with this information already exists',
        code: 'DUPLICATE_RESERVATION'
      });
    }

    // === 11. Generic error fallback ===
    return res.status(500).json({ 
      error: 'An unexpected error occurred while creating the reservation',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
};
// In authController.js
// controllers/authController.js



// Get user dashboard data
 









// ===============================
// Add New Menu Item
// ===============================





module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  resendVerificationEmail,
  resetPassword,
  verifyResetToken,
  createReservation,
  forgotPassword,
  logOutUser,
};