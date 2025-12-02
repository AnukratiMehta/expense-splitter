const groupModel = require("../models/groupModel");
const userModel = require("../models/userModel");
const expenseModel = require("../models/expenseModel");
const { calculateBalances } = require("../utils/calculateBalances");
const { calculateSettlements } = require("../utils/calculateSettlements");



module.exports = {
  async listGroups(req, res) {
    const userId = req.session.user.id;
    const groups = await groupModel.listUserGroups(userId);
    res.render("groups/list", { groups });
  },

  showCreateGroup(req, res) {
    res.render("groups/create", { error: null });
  },

  async createGroup(req, res) {
    const name = req.body.name.trim();
    const userId = req.session.user.id;

    if (!name) {
      return res.render("groups/create", { error: "Group name is required." });
    }

    const group = await groupModel.createGroup(name, userId);

    // Add creator as member
    await groupModel.addMember(group.id, userId);

    res.redirect("/groups");
  },

   async viewGroup(req, res) {
    const groupId = req.params.id;
    const userId = req.session.user.id;

    const isMember = await groupModel.isMember(groupId, userId);
    if (!isMember) return res.status(403).send("Access denied.");

    const group = await groupModel.findById(groupId);
    const members = await groupModel.listMembers(groupId);
    const expenses = await expenseModel.listByGroup(groupId);

const splits = await expenseModel.getSplitsByGroup(groupId);

const { balances, paid, owes } =
  calculateBalances(members, expenses, splits);

  const settlements = calculateSettlements(members, balances);

// Map user IDs to usernames for displaying settlements nicely
const userMap = {};
members.forEach((m) => {
  userMap[m.id] = m.username;
});


res.render("groups/view", {
  group,
  members,
  expenses,
  balances,
  paid,
  owes,
  settlements,
  userMap,
});

  },


 async addMember(req, res) {
  const groupId = req.params.id;
  const username = req.body.username.trim();
  const userId = req.session.user.id;

  // Check member access
  const isMember = await groupModel.isMember(groupId, userId);
  if (!isMember) return res.status(403).send("Access denied.");

  const group = await groupModel.findById(groupId);

  // Only owner can add members
  if (group.ownerId !== userId) {
    return res.status(403).send("Only the owner can add members.");
  }

  // Validate user exists
  const userToAdd = await userModel.findByUsername(username);
  if (!userToAdd) {
    // Rebuild full page context so the view works correctly
    const members = await groupModel.listMembers(groupId);
    const expenses = await expenseModel.listByGroup(groupId);
    const splits = await expenseModel.getSplitsByGroup(groupId);

    const { balances, paid, owes } =
      calculateBalances(members, expenses, splits);

    const settlements = calculateSettlements(members, balances);

    // Map user IDs → username for settlement display
    const userMap = {};
    members.forEach((m) => {
      userMap[m.id] = m.username;
    });

    return res.render("groups/view", {
      group,
      members,
      expenses,
      balances,
      paid,
      owes,
      settlements,
      userMap,
      error: "User does not exist." // <-- YOUR FLASH MESSAGE HERE
    });
  }

  // Prevent duplicate membership
  const alreadyMember = await groupModel.isMember(groupId, userToAdd.id);
  if (alreadyMember) {
    return res.redirect(`/groups/${groupId}`);
  }

  await groupModel.addMember(groupId, userToAdd.id);

  res.redirect(`/groups/${groupId}`);
},
};
