const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");

module.exports = {

  showRegister(req, res) {
    // Always pass error, even if null
    res.render("auth/register", { error: null });
  },

  async register(req, res) {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
      return res.render("auth/register", { error: "All fields required." });
    }

    if (password.length < 6) {
      return res.render("auth/register", { error: "Password too short." });
    }

    try {
      const existing = await userModel.findByUsername(username);
      if (existing) {
        return res.render("auth/register", { error: "Username already taken." });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      await userModel.createUser(username, passwordHash);

      res.redirect("/login");
    } catch (err) {
      console.error(err);
      res.render("auth/register", { error: "Error creating account." });
    }
  },

  showLogin(req, res) {
  res.render("auth/login", { error: null });
},

async login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.render("auth/login", { error: "All fields required." });
  }

  try {
    const user = await userModel.findByUsername(username);
    if (!user) {
      return res.render("auth/login", { error: "Incorrect username or password." });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.render("auth/login", { error: "Incorrect username or password." });
    }

    // Store user in session (never store password)
    req.session.user = {
      id: user.id,
      username: user.username,
    };

    res.redirect("/"); // home will now show "logged in as"
  } catch (err) {
    console.error(err);
    res.render("auth/login", { error: "Login error. Try again." });
  }
},

logout(req, res) {
  req.session.destroy(() => {
    res.redirect("/");
  });
}

};
