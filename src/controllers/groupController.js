const groupModel = require("../models/groupModel");
const userModel = require("../models/userModel");

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

    res.render("groups/view", { group, members });
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

    const userToAdd = await userModel.findByUsername(username);
    if (!userToAdd) {
      return res.status(400).send("User not found.");
    }

    await groupModel.addMember(groupId, userToAdd.id);

    res.redirect(`/groups/${groupId}`);
  }
};
