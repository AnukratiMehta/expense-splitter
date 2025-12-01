const groupModel = require("../models/groupModel");
const expenseModel = require("../models/expenseModel");

module.exports = {
  async addExpense(req, res) {
    const groupId = req.params.id;
    const userId = req.session.user.id;

    const { description, amount } = req.body;

    // Access control — must be member
    const isMember = await groupModel.isMember(groupId, userId);
    if (!isMember) return res.status(403).send("Access denied.");

    // Validation
    if (!description || !amount || isNaN(amount)) {
      return res.status(400).send("Invalid input.");
    }

    await expenseModel.addExpense(groupId, description.trim(), parseFloat(amount), userId);

    res.redirect(`/groups/${groupId}`);
  },

  async showEditExpense(req, res) {
    const groupId = req.params.groupId;
    const expenseId = req.params.expenseId;
    const userId = req.session.user.id;

    const isMember = await groupModel.isMember(groupId, userId);
    if (!isMember) return res.status(403).send("Access denied.");

    const group = await groupModel.findById(groupId);
    const expense = await expenseModel.findById(expenseId);

    const isOwner = group.ownerId === userId;
    const isCreator = expense.paidBy === userId;

    if (!isOwner && !isCreator) {
      return res.status(403).send("Permission denied.");
    }

    res.render("expenses/edit", { expense, group });
  },

  async editExpense(req, res) {
    const groupId = req.params.groupId;
    const expenseId = req.params.expenseId;
    const userId = req.session.user.id;

    const { description, amount } = req.body;

    const isMember = await groupModel.isMember(groupId, userId);
    if (!isMember) return res.status(403).send("Access denied.");

    const group = await groupModel.findById(groupId);
    const expense = await expenseModel.findById(expenseId);

    const isOwner = group.ownerId === userId;
    const isCreator = expense.paidBy === userId;

    if (!isOwner && !isCreator) {
      return res.status(403).send("Permission denied.");
    }

    if (!description || !amount || isNaN(amount)) {
      return res.status(400).send("Invalid input.");
    }

    await expenseModel.updateExpense(expenseId, description.trim(), parseFloat(amount));

    res.redirect(`/groups/${groupId}`);
  },

  async deleteExpense(req, res) {
    const groupId = req.params.groupId;
    const expenseId = req.params.expenseId;
    const userId = req.session.user.id;

    const isMember = await groupModel.isMember(groupId, userId);
    if (!isMember) return res.status(403).send("Access denied.");

    const group = await groupModel.findById(groupId);
    const expense = await expenseModel.findById(expenseId);

    const isOwner = group.ownerId === userId;
    const isCreator = expense.paidBy === userId;

    if (!isOwner && !isCreator) {
      return res.status(403).send("Permission denied.");
    }

    await expenseModel.deleteExpense(expenseId);

    res.redirect(`/groups/${groupId}`);
  }
};
