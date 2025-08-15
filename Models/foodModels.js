const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ============================
// User Schema (No Admin Role)
// ============================
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verifyToken: String,
  verifyTokenExpiry: Date,
  resetPasswordToken: String,
 resetPasswordExpiry: Date,
  passwordChangedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Remove the pre-save password hashing since you're already hashing in the controller
// This prevents double hashing
// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// Add a method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ============================
// Menu Item Schema
// ============================
const MenuItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner'],
    required: true
  },
  available: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });


// ============================
// Reservation Schema
// ============================
const ReservationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String},
    email: { type: String },
    phoneNumber: { type: String },
    numberOfPersons: { type: Number, required: true },
    tableNumber: { type: String },
    reservationDate: { type: Date, required: true },
    reservationTime: { type: String, required: true },
    specialRequest: { type: String },
    message: { type: String }, // <-- Message box added here
}, { timestamps: true });


// Add validation to prevent past date reservations
ReservationSchema.pre('save', function(next) {
  if (this.date < new Date()) {
    next(new Error('Reservation date cannot be in the past'));
  } else {
    next();
  }
});

// ============================
// Model Registration
// ============================
const User = mongoose.model('User', userSchema);
const MenuItem = mongoose.model('MenuItem', MenuItemSchema);
const Reservation = mongoose.model('Reservation', ReservationSchema);

// ============================
// Export Models
// ============================
module.exports = {
  User,
  MenuItem,
  Reservation,
};