const express = require("express");
const router = express.Router();
const { requireLogin } = require("../middleware/authMiddleware");
const groupController = require("../controllers/groupController");

// List all groups
router.get("/", requireLogin, groupController.listGroups);

// Create group
router.get("/create", requireLogin, groupController.showCreateGroup);
router.post("/create", requireLogin, groupController.createGroup);

// View group
router.get("/:id", requireLogin, groupController.viewGroup);

// Add member
router.post("/:id/add-member", requireLogin, groupController.addMember);

module.exports = router;
