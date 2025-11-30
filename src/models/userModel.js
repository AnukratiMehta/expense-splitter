const db = require("./db");

module.exports = {
  createUser(username, passwordHash) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO users (username, passwordHash) VALUES (?, ?)`;
      db.run(sql, [username, passwordHash], function (err) {
        if (err) return reject(err);
        resolve({ id: this.lastID });
      });
    });
  },

  findByUsername(username) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM users WHERE username = ?`;
      db.get(sql, [username], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },

  findById(id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM users WHERE id = ?`;
      db.get(sql, [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  },
};
