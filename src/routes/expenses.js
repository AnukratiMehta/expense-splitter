const express = require("express");
const router = express.Router();
const { requireLogin } = require("../middleware/authMiddleware");
const expenseController = require("../controllers/expenseController");

// Add expense
router.post("/:id/expenses/add", requireLogin, expenseController.addExpense);

// Edit expense
router.get("/:groupId/expenses/:expenseId/edit", requireLogin, expenseController.showEditExpense);
router.post("/:groupId/expenses/:expenseId/edit", requireLogin, expenseController.editExpense);

// Delete expense
router.post("/:groupId/expenses/:expenseId/delete", requireLogin, expenseController.deleteExpense);

module.exports = router;
