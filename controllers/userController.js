const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const User = require("../models/userModel");
const Address = require("../models/addressModel");
const { generateToken } = require("../config/jwtToken");

const createUser = async (req, res) => {
  const { email, firstname, lastname, mobile, password, role } = req.body;
  const saltRounds = 10;

  try {
    if (!email || !firstname || !lastname || !mobile || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const findUserByEmail = await User.findOne({ email });
    if (findUserByEmail) {
      return res
        .status(409)
        .json({ error: "Email already exists. Please login." });
    }

    const findUserByMobile = await User.findOne({ mobile });
    if (findUserByMobile) {
      return res
        .status(409)
        .json({ error: "Mobile number already exists. Please login." });
    }

    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);

    const userRole = role && role.toLowerCase() === "admin" ? "admin" : "user";

    const newUser = await User.create({
      firstname,
      lastname,
      email,
      mobile,
      password: passwordHash,
      role: userRole,
    });

    return res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
};

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const findAdmin = await User.findOne({ email });
    console.log("Admin: ", findAdmin);

    if (!findAdmin) {
      return res.status(401).json({ message: "Incorrect Email." });
    }

    if (findAdmin.role !== "admin") {
      return res.status(403).json({ message: "Not Authorised" });
    }

    const isPasswordMatched = await bcrypt.compare(
      password,
      findAdmin.password
    );
    if (!isPasswordMatched) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    const refreshToken = generateToken(findAdmin._id);
    await User.findByIdAndUpdate(
      findAdmin.id,
      { token: refreshToken },
      { new: true }
    );

    return res.status(200).json({
      _id: findAdmin._id,
      firstname: findAdmin.firstname,
      lastname: findAdmin.lastname,
      email: findAdmin.email,
      mobile: findAdmin.mobile,
      token: generateToken(findAdmin._id),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const loginUserCtrl = async (req, res) => {
  const { email, mobile, password } = req.body;

  try {
    const findUser = await User.findOne({
      $or: [{ email }, { mobile }],
    });

    if (!findUser) {
      return res.status(401).json({ error: "Incorrect Email or Mobile." });
    }

    // Check if the password is correct
    const isPasswordMatched = await bcrypt.compare(password, findUser.password);
    if (!isPasswordMatched) {
      return res.status(401).json({ error: "Incorrect password." });
    }

    // Generate a token and update it in the user's record
    const token = generateToken(findUser._id);
    await User.findByIdAndUpdate(findUser._id, { token }, { new: true });

    return res.status(200).json({
      _id: findUser._id,
      firstname: findUser.firstname,
      lastname: findUser.lastname,
      email: findUser.email,
      mobile: findUser.mobile,
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updatedUser = async (req, res) => {
  try {
    const userId = req.user;

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    let profilePicUrl = existingUser.profilepic;

    if (req.file) {
      if (existingUser.profilepic) {
        const publicId = existingUser.profilepic.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }

      const uploadResponse = await cloudinary.uploader.upload(req.file.path);
      profilePicUrl = uploadResponse.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstname: req.body.firstname || existingUser.firstname,
        lastname: req.body.lastname || existingUser.lastname,
        email: req.body.email || existingUser.email,
        mobile: req.body.mobile || existingUser.mobile,
        profilepic: profilePicUrl,
      },
      { new: true }
    );

    if (updatedUser) {
      return res.status(200).json({
        message: "User updated successfully",
        user: updatedUser,
      });
    } else {
      return res.status(400).json({ error: "Failed to update user" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Server error", details: error.message });
  }
};

const deleteaUser = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndUpdate(
      id,
      {
        isDeleted: true,
      },
      { new: true }
    );

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User marked as deleted successfully",
      deletedUser,
    });
  } catch (error) {
    console.error("Error marking user as deleted:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const restoreUser = async (req, res) => {
  const { id } = req.params;

  try {
    const restoredUser = await User.findByIdAndUpdate(
      id,
      {
        isDeleted: false,
      },
      { new: true }
    );

    if (!restoredUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User restored successfully",
      restoredUser,
    });
  } catch (error) {
    console.error("Error restoring user:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getallUser = async (req, res) => {
  try {
    const getUsers = await User.find({ isDeleted: false });
    res.json(getUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getaUser = async (req, res) => {
  const id = req.user._id;
  try {
    const getaUser = await User.findById(id);
    res.json({
      getaUser,
    });
  } catch (error) {
    console.log('eerrr', error)
  }
};

const addAddress = async (req, res) => {
  try {
    const userId = req.user;

    const {
      addressLine1,
      addressLine2,
      city,
      state,
      country,
      postalCode,
      phone,
      isDefault,
    } = req.body;

    const newAddress = new Address({
      user: userId,
      addressLine1,
      addressLine2,
      city,
      state,
      country,
      postalCode,
      phone,
      isDefault: isDefault || false,
    });

    const savedAddress = await newAddress.save();

    await User.findByIdAndUpdate(userId, {
      $push: { address: savedAddress._id },
    });

    res
      .status(201)
      .json({ message: "Address added successfully", address: savedAddress });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to add address", details: error.message });
  }
};

const getAllAddresses = async (req, res) => {
  try {
    const userId = req.user;

    const addresses = await Address.find({ user: userId });

    res
      .status(200)
      .json({ message: "Addresses fetched successfully", addresses });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch addresses", details: error.message });
  }
};


const updateAddress = async (req, res) => {
  try {
    const { id, isDefault, ...addressData } = req.body;
    console.log("address", id, isDefault, addressData);
    const userId = req.body.userId;

    if (isDefault) {
      await Address.updateMany(
        { user: userId, isDefault: true },
        { isDefault: false }
      );
    }

    const updatedAddress = await Address.findOneAndUpdate(
      { _id: id, user: userId },
      { ...addressData, isDefault },
      { new: true }
    );

    if (!updatedAddress) {
      return res
        .status(404)
        .json({ error: "Address not found or does not belong to user" });
    }

    res.status(200).json({
      message: "Address updated successfully",
      address: updatedAddress,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to update address", details: error.message });
  }
};


// Using request body
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.body;
    const userId = req.body.userId;
    const deletedAddress = await Address.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!deletedAddress) {
      return res
        .status(404)
        .json({ error: "Address not found or does not belong to user" });
    }
    await User.findByIdAndUpdate(userId, {
      $pull: { address: id },
    });

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to delete address", details: error.message });
  }
};

const blockUser = async (req, res) => {
  const { id } = req.params;

  try {
    const blockusr = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
    res.json(blockusr);
  } catch (error) {
    throw new Error(error);
  }
};

const unblockUser = async (req, res) => {
  const { id } = req.params;

  try {
    const unblock = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
    res.json({
      message: "User UnBlocked",
    });
  } catch (error) {
    throw new Error(error);
  }
};

const updatePassword = async (req, res) => {
  const id = req.user;
  const { password } = req.body;
  const saltRounds = 10;

  const user = await User.findById(id);

  const salt = await bcrypt.genSalt(saltRounds);
  const passwordHash = await bcrypt.hash(password, salt);

  if (password) {
    user.password = passwordHash;
    const updatedPassword = await user.save();
    res.json(updatedPassword);
  } else {
    res.json(user);
  }
};


module.exports = { createUser, loginAdmin, loginUserCtrl, updatedUser, deleteaUser, restoreUser, getaUser, getallUser, blockUser, unblockUser, addAddress, getAllAddresses, updateAddress, deleteAddress, updatePassword };