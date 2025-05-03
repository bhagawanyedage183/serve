const express = require("express");
const router = express.Router();
const usersController = require("../controller/users");
const fileUpload = require("express-fileupload");

router.use(fileUpload());

router.get("/all-user", usersController.getAllUser);
router.post("/signle-user", usersController.getSingleUser);

router.post("/add-user", usersController.postAddUser);
router.post("/edit-user", usersController.postEditUser);
router.post("/delete-user", usersController.getDeleteUser);

router.post("/change-password", usersController.changePassword);

// New route for profile photo upload
router.post("/upload-profile-photo", usersController.uploadProfilePhoto);

module.exports = router;
