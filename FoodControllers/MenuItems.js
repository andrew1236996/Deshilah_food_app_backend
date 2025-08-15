const { MenuItem } = require('../Models/foodModels');


// Get all menu items

// Get all menu items
const getAllMenuItems = async (req, res) => {
  console.log('🛠 Inside getAllMenuItems controller');

  try {
    const menuItems = await MenuItem.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    console.log('✅ Retrieved menu items:', menuItems.length);

    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    console.error('❌ Error in getAllMenuItems:', error.message);

    res.status(500).json({
      success: false,
      message: 'Error fetching menu items',
      error: error.message
    });
  }
};

// Get menu items by category
const getMenuItemsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const menuItems = await MenuItem.find({ 
      category: category,
      available: true 
    }).populate('createdBy', 'name');
    
    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching menu items by category',
      error: error.message
    });
  }
};

// Get single menu item by ID
const getMenuItemById = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching menu item',
      error: error.message
    });
  }
};

// Get available menu items only
const getAvailableMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ available: true })
      .populate('createdBy', 'name')
      .sort({ category: 1, title: 1 });
    
    res.status(200).json({
      success: true,
      count: menuItems.length,
      data: menuItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching available menu items',
      error: error.message
    });
  }
};

// Search menu items

const searchMenuItems = async (req, res) => {
  try {
    const keyword = req.query.keyword;

    if (!keyword || typeof keyword !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Keyword query parameter is required and must be a string'
      });
    }

    const regex = new RegExp(keyword, 'i'); // case-insensitive
    const items = await MenuItem.find({
      $or: [
        { title: { $regex: regex } },
        { description: { $regex: regex } }
      ]
    });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error searching menu items',
      error: error.message
    });
  }
};


module.exports = {
  getAllMenuItems,
  getMenuItemsByCategory,
  getMenuItemById,
  getAvailableMenuItems,
  searchMenuItems
};
