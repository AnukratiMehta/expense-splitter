const express = require("express");
const router = express.Router();
const { requireLogin } = require("../middleware/authMiddleware");
const expenseController = require("../controllers/expenseController");

router.post("/groups/:id/expenses/add", requireLogin, expenseController.addExpense);

router.get("/groups/:groupId/expenses/:expenseId/edit", requireLogin, expenseController.showEditExpense);
router.post("/groups/:groupId/expenses/:expenseId/edit", requireLogin, expenseController.editExpense);

router.post("/groups/:groupId/expenses/:expenseId/delete", requireLogin, expenseController.deleteExpense);

module.exports = router;
