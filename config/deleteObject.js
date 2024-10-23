const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client } = require("./s3-Credentials");

exports.deleteObject = async (key) => {
    try {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
        };

        const command = new DeleteObjectCommand(params);
        const data = await s3Client.send(command);

        console.log('Delete successful', data);
        return true; // Indicate success
    } catch (err) {
        console.error("Error deleting object from S3:", err);
        return false; // Indicate failure
    }
};
