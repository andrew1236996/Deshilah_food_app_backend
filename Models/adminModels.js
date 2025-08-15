const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ============================
// Admin Schema
// ============================
const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isSuperAdmin: { type: Boolean, default: false }, 
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Hash password before saving
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password during login
adminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ============================
// Admin Model Registration
// ============================
const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
