const expenseModel = require("../models/expenseModel");
const groupModel = require("../models/groupModel");
const { calculateBalances } = require("../utils/calculateBalances");
const { calculateSettlements } = require("../utils/calculateSettlements");

module.exports = {

 async addExpense(req, res) {
  const groupId = req.params.id;
  const userId = req.session.user.id;
  const { description, amount } = req.body;

  const members = await groupModel.listMembers(groupId);

  console.log("BODY RECEIVED:", req.body);

  let splitsObj = {};

  if (Array.isArray(req.body.splits)) {
    console.log("Detected ARRAY form of splits");
    members.forEach((m, index) => {
      splitsObj[m.id] = req.body.splits[index];
    });
  }

  else if (req.body.splits && typeof req.body.splits === "object") {
    console.log("Detected OBJECT form of splits");
    splitsObj = req.body.splits;
  }

  else {
    console.log("Detected FLATTENED form of splits");
    for (const [key, value] of Object.entries(req.body)) {
      if (key.startsWith("splits[") && key.endsWith("]")) {
        const memberId = key.slice(7, -1).trim();
        splitsObj[memberId] = value;
      }
    }
  }

  console.log("NORMALIZED SPLITS:", splitsObj);

  const isMember = await groupModel.isMember(groupId, userId);
  if (!isMember) return res.status(403).send("Access denied.");

  const totalAmount = parseFloat(amount);
  if (!description || isNaN(totalAmount) || totalAmount <= 0) {
    return res.status(400).send("Invalid description or amount.");
  }

  let totalSplit = 0;
  const splitEntries = [];

  for (const m of members) {
    const raw = splitsObj[m.id];

    if (raw === undefined) {
      return res.status(400).send("Missing split for member " + m.username);
    }

    const parsedAmount = parseFloat(raw);

    if (isNaN(parsedAmount) || parsedAmount < 0) {
      return res.status(400).send("Invalid split amount for " + m.username);
    }

    totalSplit += parsedAmount;
    splitEntries.push({ memberId: m.id, amount: parsedAmount });
  }

  if (Math.abs(totalSplit - totalAmount) > 0.001) {
    return res.status(400).send("Split amounts must sum to total amount.");
  }

  const expense = await expenseModel.addExpense(
    groupId,
    description.trim(),
    totalAmount,
    userId
  );

  for (const entry of splitEntries) {
    await expenseModel.addSplit(expense.id, entry.memberId, entry.amount);
  }

  return res.redirect(`/groups/${groupId}`);
},

  async showEditExpense(req, res) {
    const { groupId, expenseId } = req.params;

    const expense = await expenseModel.getExpense(expenseId);
    const members = await groupModel.listMembers(groupId);
    const splits = await expenseModel.getSplits(expenseId);

    const splitMap = {};
    splits.forEach(s => (splitMap[s.userId] = s.amount));

    res.render("expenses/edit", {
      groupId,
      expense,
      members,
      splitMap,
      csrfToken: req.csrfToken()
    });
  },

async editExpense(req, res) {
  const { groupId, expenseId } = req.params;
  const { description, amount } = req.body;

  const members = await groupModel.listMembers(groupId);

  // --------------------------
  // NORMALIZE SPLITS (same logic as addExpense)
  // --------------------------
  let splitsObj = {};

  // CASE 1 — Express parsed splits into an ARRAY (splits[])
  if (Array.isArray(req.body.splits)) {
    console.log("EDIT: Detected ARRAY form of splits");
    members.forEach((m, index) => {
      splitsObj[m.id] = req.body.splits[index];
    });
  }

  // CASE 2 — Parsed correctly as object
  else if (req.body.splits && typeof req.body.splits === "object") {
    console.log("EDIT: Detected OBJECT form of splits");
    splitsObj = req.body.splits;
  }

  // CASE 3 — Flattened fields (splits[1], splits[2], etc)
  else {
    console.log("EDIT: Detected FLATTENED form of splits");
    for (const [key, value] of Object.entries(req.body)) {
      if (key.startsWith("splits[") && key.endsWith("]")) {
        const memberId = key.slice(7, -1).trim();
        splitsObj[memberId] = value;
      }
    }
  }

  console.log("EDIT: NORMALIZED SPLITS:", splitsObj);

  // --------------------------
  // VALIDATE AMOUNT
  // --------------------------
  const totalAmount = parseFloat(amount);
  if (!description || isNaN(totalAmount) || totalAmount <= 0) {
    return res.status(400).send("Invalid description or amount.");
  }

  // --------------------------
  // VALIDATE PER-MEMBER SPLITS
  // --------------------------
  let totalSplit = 0;
  const splitEntries = [];

  for (const m of members) {
    const raw = splitsObj[m.id];

    if (raw === undefined) {
      return res.status(400).send("Missing split for member " + m.username);
    }

    const parsed = parseFloat(raw);

    if (isNaN(parsed) || parsed < 0) {
      return res.status(400).send("Invalid split amount for " + m.username);
    }

    totalSplit += parsed;
    splitEntries.push({ memberId: m.id, amount: parsed });
  }

  if (Math.abs(totalSplit - totalAmount) > 0.001) {
    return res.status(400).send("Split amounts must sum to total amount.");
  }

  // --------------------------
  // UPDATE EXPENSE + SPLITS
  // --------------------------
  await expenseModel.updateExpense(
    expenseId,
    description.trim(),
    totalAmount
  );

  await expenseModel.deleteSplits(expenseId);

  for (const entry of splitEntries) {
    await expenseModel.addSplit(expenseId, entry.memberId, entry.amount);
  }

  res.redirect(`/groups/${groupId}`);
},


  async deleteExpense(req, res) {
    const { groupId, expenseId } = req.params;

    await expenseModel.deleteSplits(expenseId);
    await expenseModel.deleteExpense(expenseId);

    res.redirect(`/groups/${groupId}`);
  }

};
