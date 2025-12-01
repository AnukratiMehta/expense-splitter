const db = require("./db");

module.exports = {
  addExpense(groupId, description, amount, paidBy) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO expenses (groupId, description, amount, paidBy)
        VALUES (?, ?, ?, ?)
      `;
      db.run(sql, [groupId, description, amount, paidBy], function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID });
      });
    });
  },

  listByGroup(groupId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT e.*, u.username AS paidByName
        FROM expenses e
        JOIN users u ON e.paidBy = u.id
        WHERE e.groupId = ?
        ORDER BY e.createdAt DESC
      `;
      db.all(sql, [groupId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },

  findById(id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM expenses WHERE id = ?`;
      db.get(sql, [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  updateExpense(id, description, amount) {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE expenses
        SET description = ?, amount = ?
        WHERE id = ?
      `;
      db.run(sql, [description, amount, id], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  },

  deleteExpense(id) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM expenses WHERE id = ?`;
      db.run(sql, [id], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
};
