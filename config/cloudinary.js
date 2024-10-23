// const cloudinary = require('cloudinary').v2;

// cloudinary.config({
//     cloudinary_url: process.env.CLOUDINARY_URL
// });

// module.exports = cloudinary;


const cloudinary = require("cloudinary").v2;

// Check the environment variables are set correctly
if (!process.env.CLOUDINARY_CLOUD_NAME
	|| !process.env.CLOUDINARY_API_KEY
	|| !process.env.CLOUDINARY_API_SECRET) {
	console.error("Environment variables not set");
	return;
}

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
	secure: true
});

// Check the Cloudinary object is correctly set up
if (!cloudinary.config().cloud_name
	|| !cloudinary.config().api_key
	|| !cloudinary.config().api_secret) {
	console.error("Cloudinary config not set up");
	return; // End script upon error
}

// Log the config parameters
const cloudName = cloudinary.config().cloud_name;
const apiKey = cloudinary.config().api_key;
console.log({cloudName, apiKey})