const express = require("express");
const router = express.Router();
const { requireLogin } = require("../middleware/authMiddleware");
const groupController = require("../controllers/groupController");

router.get("/groups", requireLogin, groupController.listGroups);

router.get("/groups/create", requireLogin, groupController.showCreateGroup);
router.post("/groups/create", requireLogin, groupController.createGroup);

router.get("/groups/:id", requireLogin, groupController.viewGroup);

router.post("/groups/:id/add-member", requireLogin, groupController.addMember);

module.exports = router;
