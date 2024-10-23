const Banner = require('../models/bannerModel');
const { putObject } = require("../config/putObject");
const { deleteObject } = require("../config/deleteObject");


const getBanners = async (req, res) => {
    try {
        const banners = await Banner.find();
        res.json({ data: banners });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


const getBannerById = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }
        res.json(banner);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


const createBanner = async (req, res) => {
    try {
        const { title, content, offer, discount, type } = req.body;

        const { pictures } = req.files;

        if (!pictures) {
            return res.status(400).json({
                error: { fileError: "No pictures uploaded or invalid file type" },
            });
        }

        const fileName = `images/${Date.now()}`;

        const { url, key } = await putObject(pictures.data, fileName);
        console.log('url key', url, key);

        const newBanner = new Banner({
            title,
            content,
            offer,
            discount,
            type,
            imageUrl: url,
        });

        const savedBanner = await newBanner.save();
        res.status(201).json({ data: savedBanner });
    } catch (error) {
        res.status(500).json({ message: 'Error creating banner' });
    }
};


const updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, offer, discount, type } = req.body;
        const { imageUrl } = req.files;

        const existingBanner = await Banner.findById(id);
        if (!existingBanner) {
            return res.status(404).json({ error: "Banner not found" });
        }

        if (imageUrl && existingBanner.imageUrl) {

            const imageKey = existingBanner.imageUrl.split("/").slice(-2).join("/");
            console.log("setrdfvbhj:", imageKey);
            await deleteObject(imageKey);
        }

        if (title) existingBanner.title = title;
        if (content) existingBanner.content = content;
        if (offer) existingBanner.offer = offer;
        if (type) existingBanner.type = type;

        if (discount !== undefined) {
            if (discount === null || discount === '') {
                existingBanner.discount = null;
            } else if (!isNaN(discount)) {
                existingBanner.discount = Number(discount);
            } else {
                return res.status(400).json({ error: "Invalid discount value" });
            }
        }

        if (imageUrl) {
            let newImageUrl;

            const fileName = `images/${Date.now()}`;
            const { url } = await putObject(imageUrl.data, fileName);
            newImageUrl = url;

            existingBanner.imageUrl = newImageUrl;
        }

        await existingBanner.save();

        return res.status(200).json({
            message: "Banner updated successfully",
            banner: existingBanner,
        });
    } catch (error) {
        console.error("Error updating banner:", error);
        return res.status(500).json({ error: "Server Error" });
    }
};


const deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }

        const imageKey = banner.imageUrl.split('/').pop();

        await deleteObject(imageKey);

        await Banner.findByIdAndDelete(req.params.id);

        return res.json({ message: 'Banner and image deleted successfully' });
    } catch (error) {
        console.error('Error deleting banner:', error);
        return res.status(500).json({ message: 'Error deleting banner' });
    }
};


module.exports = { getBanners, getBannerById, createBanner, deleteBanner, updateBanner }