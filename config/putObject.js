const { s3Client } = require("./s3-Credentials")
const {PutObjectCommand} = require("@aws-sdk/client-s3")


exports.putObject = async (file, fileName) => {
    try {
        console.log(process.env.AWS_S3_BUCKET);

        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: `${fileName}`,
            Body: file,
            ContentType: "image/jpg,jpeg,png",
        };

        const command = new PutObjectCommand(params);
        const data = await s3Client.send(command);

        console.log('data from aws', data);

        if (data.$metadata.httpStatusCode !== 200) {
            return;
        }

        // Get the current timestamp for the URL
        const timestamp = new Date().getTime();
        let url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
        console.log(url);
        
        return { url, key: params.Key }; // Make sure to return params.Key

    } catch (err) {
        console.error("Error uploading to S3:", err);
    }
};
