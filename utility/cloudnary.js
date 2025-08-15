// config/cloudinary.js
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: 'ddsce1fpd',       // must be a string
  api_key: '146875595673724',    // must be a string
  api_secret: '**********',  // must be a string
});

module.exports = cloudinary;
