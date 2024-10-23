const express = require("express");
const { uploadExcel, upload } = require("../controllers/UploadProductsController");
const router = express.Router();
// const { uploadExcel, upload } = require("./controllers/excelController"); // Adjust the path as necessary

// Route for uploading Excel file
router.post("/upload-excel", upload, uploadExcel);

module.exports = router;
