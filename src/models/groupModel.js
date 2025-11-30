const db = require("./db");

module.exports = {
  createGroup(name, ownerId) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO groups (name, ownerId) VALUES (?, ?)`;
      db.run(sql, [name, ownerId], function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID });
      });
    });
  },

  addMember(groupId, userId) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT OR IGNORE INTO group_members (groupId, userId) VALUES (?, ?)`;
      db.run(sql, [groupId, userId], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  },

  listUserGroups(userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT g.*
        FROM groups g
        JOIN group_members gm ON g.id = gm.groupId
        WHERE gm.userId = ?
      `;
      db.all(sql, [userId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },

  findById(groupId) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM groups WHERE id = ?`;
      db.get(sql, [groupId], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  isMember(groupId, userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 1 FROM group_members
        WHERE groupId = ? AND userId = ?
      `;
      db.get(sql, [groupId, userId], (err, row) => {
        if (err) return reject(err);
        resolve(!!row); // convert to boolean
      });
    });
  },

  listMembers(groupId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT u.id, u.username
        FROM users u
        JOIN group_members gm ON u.id = gm.userId
        WHERE gm.groupId = ?
      `;
      db.all(sql, [groupId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }
};
