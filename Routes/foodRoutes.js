const express = require('express');
const router = express.Router();
const { MenuItem } = require('../Models/foodModels') // ✅ Correct!



// 🧠 Controller Imports
const {
  registerUser,
  loginUser,
  logOutUser,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  verifyResetToken,
  createReservation
} = require('../FoodControllers/regController');

const {
  getAllMenuItems,
  getMenuItemsByCategory,
  getMenuItemById,
  getAvailableMenuItems,
  searchMenuItems
} = require('../FoodControllers/MenuItems');


// =================== AUTH ROUTES ===================
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logOutUser);
router.get('/verifyEmail/:token', verifyEmail);
router.post('/resendVerification', resendVerificationEmail);
router.post('/forgotPassword', forgotPassword);
router.post('/resetPassword/:token', resetPassword);
router.post('/verifyResetToken/:token', verifyResetToken);

// =================== RESERVATION ROUTE ===================
router.post('/createReservation', createReservation);

// =================== MENU ROUTES ===================
router.get('/getAllMenuItems', getAllMenuItems);
router.get('/getAvailableMenuItems', getAvailableMenuItems);
router.get('/getMenuItemsByCategory/:category', getMenuItemsByCategory);
router.get('/searchMenuItems', searchMenuItems);
router.get('/getMenuItemById/:id', getMenuItemById);

// =================== SEEDING ROUTE (TEMPORARY) ===================
router.post('/seed', async (req, res) => {
  try {
    const newItem = await MenuItem.create({
      title: "Jollof Rice",
      description: "Spicy tomato rice, a West African classic",
      price: 8.99,
      image: "https://example.com/jollof.jpg",
      category: "Lunch",
      available: true
    });
    res.status(201).json({ success: true, data: newItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
