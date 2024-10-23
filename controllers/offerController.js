const Offers = require("../models/offersModel");
const Product = require("../models/productModel");
const Notification = require('../models/notifcationModel')


const createOffer = async (req, res) => {
    try {
        const { title, offer, discountType, prodCategory } = req.body;

        const categoryExists = await Product.findOne({ category: prodCategory });

        if (!categoryExists) {
            return res.status(400).json({ error: "Category not found" });
        }

        const newOffer = new Offers({
            title,
            offer,
            discountType,
            prodCategory,
        });

        await newOffer.save();

        res.status(201).json({ offer: newOffer });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllOffers = async (req, res) => {
    try {
        const offers = await Offers.find();
        res.status(200).json({ offer: offers });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getOfferById = async (req, res) => {
    try {
        const offer = await Offers.findById(req.params.id);
        if (!offer) {
            return res.status(404).json({ error: "Offer not found" });
        }
        res.status(200).json(offer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateOffer = async (req, res) => {
    try {
        const { title, offer, discountType, prodCategory } = req.body;
        const updatedOffer = await Offers.findByIdAndUpdate(
            req.params.id,
            { title, offer, discountType, prodCategory },
            { new: true }
        );

        if (!updatedOffer) {
            return res.status(404).json({ error: "Offer not found" });
        }

        res.status(200).json(updatedOffer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteOffer = async (req, res) => {
    try {
        const deletedOffer = await Offers.findByIdAndDelete(req.params.id);

        if (!deletedOffer) {
            return res.status(404).json({ error: "Offer not found" });
        }

        await Product.updateMany(
            { offer: deletedOffer._id },
            { $unset: { offer: "" } }
        );

        await Notification.deleteMany({ offerId: deletedOffer._id });

        res.status(200).json({ message: "Offer and related notifications deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const applyOfferToProduct = async (req, res) => {
    const { offerId } = req.body;

    try {
        const offer = await Offers.findById(offerId);
        if (!offer) {
            return res.status(404).json({ error: "Offer not found" });
        }

        const updatedProducts = await Product.updateMany(
            { category: offer.prodCategory },
            { offer: offer._id },
            { new: true }
        );

        const notificationTitle = `New Offer Applied: ${offer.title}`;
        const notificationMessage = `A new offer has been applied to products in the ${offer.prodCategory} category. Discount: ${offer.offer}`;

        const newNotification = new Notification({
            title: notificationTitle,
            message: notificationMessage,
            isGlobal: true,
            offerId: offer._id
        });

        await newNotification.save();

        res.status(200).json({ message: `${updatedProducts} products updated successfully and notification sent to users.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getProductsWithOffers = async (req, res) => {
    const { category } = req.query;

    try {
        const products = await Product.find({ category })
            .populate('offer', 'offer discount discountType')
            .exec();

        if (products.length === 0) {
            return res.status(404).json({ message: "No products found in this category." });
        }

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = { createOffer, getAllOffers, getOfferById, deleteOffer, updateOffer, applyOfferToProduct, getProductsWithOffers }