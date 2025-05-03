const userModel = require("../models/users");
const bcrypt = require("bcryptjs");

const path = require("path");
const fs = require("fs");
class User {
  async getAllUser(req, res) {
    try {
      let Users = await userModel
        .find({})
        .populate("allProduct.id", "pName pImages pPrice")
        .sort({ _id: -1 });
      if (Users) {
        return res.json({ users: Users });
      }
      return res.json({ users: [] });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  async getSingleUser(req, res) {
    let { uId } = req.body;
    if (!uId) {
      return res.json({ error: "All fields are required" });
    } else {
      try {
        let User = await userModel
          .findById(uId)
          .select("name email phoneNumber userImage updatedAt createdAt");
        if (User) {
          return res.json({ User });
        }
        return res.status(404).json({ error: "User not found" });
      } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Server error" });
      }
    }
  }

  async postAddUser(req, res) {
    let { allProduct, user, amount, transactionId, address, phone } = req.body;
    if (
      !allProduct ||
      !user ||
      !amount ||
      !transactionId ||
      !address ||
      !phone
    ) {
      return res.json({ error: "All fields are required" });
    } else {
      try {
        let newUser = new userModel({
          allProduct,
          user,
          amount,
          transactionId,
          address,
          phone,
        });
        let save = await newUser.save();
        if (save) {
          return res.json({ success: "User created successfully" });
        }
      } catch (err) {
        return res.status(500).json({ error: "Server error" });
      }
    }
  }

  async postEditUser(req, res) {
    let { uId, name, phoneNumber } = req.body;
    if (!uId || !name || !phoneNumber) {
      return res.json({ error: "All fields are required" });
    } else {
      let currentUser = userModel.findByIdAndUpdate(uId, {
        name: name,
        phoneNumber: phoneNumber,
        updatedAt: Date.now(),
      });
      currentUser.exec((err, result) => {
        if (err) console.log(err);
        return res.json({ success: "User updated successfully" });
      });
    }
  }

  async getDeleteUser(req, res) {
    let { oId, status } = req.body;
    if (!oId || !status) {
      return res.json({ error: "All fields are required" });
    } else {
      let currentUser = userModel.findByIdAndUpdate(oId, {
        status: status,
        updatedAt: Date.now(),
      });
      currentUser.exec((err, result) => {
        if (err) console.log(err);
        return res.json({ success: "User status updated successfully" });
      });
    }
  }

  async changePassword(req, res) {
    let { uId, oldPassword, newPassword } = req.body;
    if (!uId || !oldPassword || !newPassword) {
      return res.json({ error: "All fields are required" });
    } else {
      const data = await userModel.findOne({ _id: uId });
      if (!data) {
        return res.json({
          error: "Invalid user",
        });
      } else {
        const oldPassCheck = await bcrypt.compare(oldPassword, data.password);
        if (oldPassCheck) {
          newPassword = bcrypt.hashSync(newPassword, 10);
          let passChange = userModel.findByIdAndUpdate(uId, {
            password: newPassword,
          });
          passChange.exec((err, result) => {
            if (err) console.log(err);
            return res.json({ success: "Password updated successfully" });
          });
        } else {
          return res.json({
            error: "Your old password is wrong!!",
          });
        }
      }
    }
  }

  async uploadProfilePhoto(req, res) {
    try {
      if (!req.files || !req.files.profilePhoto) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const profilePhoto = req.files.profilePhoto;
      const uploadPath = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        "profilePhotos"
      );

      // Ensure upload directory exists
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      // Generate unique filename
      const fileName = `${Date.now()}_${profilePhoto.name}`;
      const filePath = path.join(uploadPath, fileName);

      // Move the file to upload directory
      await new Promise((resolve, reject) => {
        profilePhoto.mv(filePath, (err) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve();
          }
        });
      });

      // Update user document with new profile photo URL
      const userId = req.body.uId;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const photoUrl = `/uploads/profilePhotos/${fileName}`;
      const fullPhotoUrl = `${req.protocol}://${req.get('host')}${photoUrl}`;
      const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        { userImage: fullPhotoUrl, updatedAt: Date.now() },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.json({ success: "Profile photo updated", photoUrl: fullPhotoUrl });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error" });
    }
  }
}

const ordersController = new User();
module.exports = ordersController;
