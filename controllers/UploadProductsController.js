
// const mongoose = require("mongoose");
// const multer = require("multer");
// const xlsx = require("xlsx");

// const Product = require('../models/productModel'); // Adjust the path as necessary

// const storage = multer.memoryStorage(); // Use memory storage for Excel files
// const upload = multer({ storage }).single("excelFile");

// const uploadExcel = async (req, res) => {
//   try {
//     // Validate if a file was uploaded
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     // Read the Excel file
//     const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
//     const sheetName = workbook.SheetNames[0]; // Get the first sheet
//     const worksheet = workbook.Sheets[sheetName];

//     // Convert sheet to JSON
//     const products = xlsx.utils.sheet_to_json(worksheet);

//     console.log('products from xl sheet',products)

//     // Process each product entry
//     for (const productData of products) {
//       const newProduct = new Product({
//         title: productData.title,
//         description: productData.description,
//         price: productData.price,
//         category: productData.category,
//         quantity: productData.quantity,
//         images: productData.images ? productData.images.split(",") : [], // Assuming images are comma-separated in Excel
//       });

//       await newProduct.save();
//     }

//     return res.status(201).json({
//       message: "Products created successfully",
//       count: products.length,
//     });
//   } catch (error) {
//     console.error("Error uploading Excel file:", error);
//     return res.status(500).json({ error: "Server Error" });
//   }
// };

// module.exports = { uploadExcel, upload };






const mongoose = require("mongoose");
const multer = require("multer");
const xlsx = require("xlsx");
const cloudinary = require("../middleware/cloudinaryConfig"); // Adjust the path as necessary
const Product = require('../models/productModel'); // Adjust the path as necessary
const fs = require("fs"); // To handle file system operations
const path = require("path");

const upload = multer({ storage: multer.memoryStorage() }).single("excelFile");

const uploadExcel = async (req, res) => {
  try {
    // Validate if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log('Request file:', req.file);

    // Read the Excel file
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0]; // Get the first sheet
    const worksheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    const products = xlsx.utils.sheet_to_json(worksheet);

    // Log the products for debugging
    console.log('Products from Excel sheet:', JSON.stringify(products, null, 2));

    // Process each product entry
    for (const productData of products) {
      const imageData = productData.images; // This should contain the pasted image

      // Check if image data exists
      if (imageData) {
        try {
          // Create a temporary file to hold the image data
          const tempFilePath = path.join(__dirname, "tempImage.png"); // Adjust as necessary
          fs.writeFileSync(tempFilePath, imageData); // Write the image data to a file

          // Upload the temporary image file to Cloudinary
          const uploadResult = await cloudinary.uploader.upload(tempFilePath, {
            folder: 'products',
            resource_type: 'image',
          });

          console.log('Uploaded image URL:', uploadResult.secure_url);

          const newProduct = new Product({
            title: productData.title,
            description: productData.description,
            price: productData.price,
            category: productData.category,
            quantity: productData.quantity,
            images: [uploadResult.secure_url], // Store the Cloudinary URL
          });

          await newProduct.save();
        // Remove the temporary file after uploading;
          fs.unlinkSync(tempFilePath);
        } catch (uploadError) {
          console.error(`Error uploading image for product ${productData.title}:`, uploadError);
        }
      } else {
        console.log(`No image provided for product ${productData.title}`);
      }
    }

    return res.status(201).json({
      message: "Products created successfully",
      count: products.length,
    });
  } catch (error) {
    console.error("Error uploading Excel file:", error);
    return res.status(500).json({ error: "Server Error" });
  }
};

module.exports = { uploadExcel, upload };
