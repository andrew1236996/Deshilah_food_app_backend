const verificationTemplate = (userName, verifyUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Email Verification</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Email Verification</h1>
        </div>
        <div class="content">
          <h2>Hi ${userName},</h2>
          <p>Thank you for registering with our app! Please verify your email address by clicking the button below:</p>
          <a href="${verifyUrl}" class="button">Verify Email Address</a>
          <p>Or copy and paste this link into your browser:</p>
          <p><a href="${verifyUrl}">${verifyUrl}</a></p>
          <p>If you didn't request this verification, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>Best regards,<br>Your App Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const forgotPasswordTemplate = (userName, verifyUrl) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Reset Your Password</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #FF6B6B; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background-color: #FF6B6B; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset</h1>
        </div>
        <div class="content">
          <h2>Hi ${userName},</h2>
          <p>You requested to reset your password. Click the button below to set a new one:</p>
          <a href="${verifyUrl}" class="button">Reset Password</a>
          <p>Or copy and paste this link into your browser:</p>
          <p><a href="${verifyUrl}">${verifyUrl}</a></p>
          <p>If you did not request this password reset, simply ignore this message.</p>
          <p><strong>Note:</strong> This link will expire in 1 hour for security reasons.</p>
        </div>
        <div class="footer">
          <p>Thanks,<br>Your App Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
// Add this to your existing utility/emailTemplate.js file

const passwordResetTemplate = (userName, verifyUrl) => {
  return `
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2c3e50; margin-bottom: 10px;">Password Reset Request</h1>
        <p style="color: #7f8c8d; font-size: 16px;">Your App Name</p>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin-bottom: 15px; font-size: 16px;">Hi <strong>${userName}</strong>,</p>
        <p style="margin-bottom: 15px;">You requested a password reset for your account. Click the button below to reset your password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" 
             style="background-color: #3498db; 
                    color: white; 
                    padding: 12px 30px; 
                    text-decoration: none; 
                    border-radius: 5px; 
                    font-weight: bold; 
                    display: inline-block;
                    font-size: 16px;">
            Reset My Password
          </a>
        </div>
        
        <p style="margin-bottom: 15px; font-size: 14px; color: #e74c3c;">
          <strong>⏰ This link will expire in 15 minutes for security reasons.</strong>
        </p>
        
        <p style="margin-bottom: 10px; font-size: 14px; color: #7f8c8d;">
          If the button doesn't work, you can copy and paste this link into your browser:
        </p>
        <p style="word-break: break-all; background-color: #ecf0f1; padding: 10px; border-radius: 4px; font-size: 12px;">
          ${verifyUrl}
        </p>
      </div>
      
      <div style="border-top: 1px solid #ecf0f1; padding-top: 20px; font-size: 14px; color: #7f8c8d;">
        <p><strong>Security Note:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure.</p>
        <p style="margin-top: 15px;">
          Best regards,<br>
          <strong>Your App Team</strong>
        </p>
      </div>
    </div>
  `;
};
const createConfirmationEmail = (reservation) => {
  return {
    from: process.env.EMAIL_USER,
    to: reservation.email,
    subject: 'Reservation Confirmation - Table Booking',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Reservation Confirmed!</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #495057; margin-top: 0;">Reservation Details:</h3>
          <p><strong>Name:</strong> ${reservation.name}</p>
          <p><strong>Date:</strong> ${new Date(reservation.reservationDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <p><strong>Number of Persons:</strong> ${reservation.numberOfPersons}</p>
          ${reservation.tableNumber ? `<p><strong>Table Number:</strong> ${reservation.tableNumber}</p>` : ''}
          ${reservation.phoneNumber ? `<p><strong>Phone:</strong> ${reservation.phoneNumber}</p>` : ''}
          ${reservation.specialRequest ? `<p><strong>Special Request:</strong> ${reservation.specialRequest}</p>` : ''}
          ${reservation.message ? `<p><strong>Message:</strong> ${reservation.message}</p>` : ''}
        </div>
        <p style="color: #6c757d; text-align: center; margin-top: 30px;">
          Thank you for choosing our restaurant! We look forward to serving you.
        </p>
        <p style="color: #6c757d; text-align: center; font-size: 12px;">
          If you need to make any changes, please contact us as soon as possible.
        </p>
      </div>
    `
  };
};


module.exports = { verificationTemplate, forgotPasswordTemplate, passwordResetTemplate,createConfirmationEmail };