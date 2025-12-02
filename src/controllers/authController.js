const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");

module.exports = {

  showRegister(req, res) {
    res.render("auth/register", { error: null });
  },

async register(req, res) {
  let { username, password } = req.body;

  username = username.trim();

  if (!username || !password) {
    return res.render("auth/register", { error: "All fields are required." });
  }

  if (username.length < 3) {
    return res.render("auth/register", { error: "Username must be at least 3 characters." });
  }

  if (password.length < 6) {
    return res.render("auth/register", { error: "Password must be at least 6 characters long." });
  }

  try {
    const existing = await userModel.findByUsername(username);
    if (existing) {
      return res.render("auth/register", { error: "Username already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await userModel.createUser(username, passwordHash);

    return res.redirect("/login");

  } catch (err) {
    console.error("REGISTRATION ERROR:", err);

    if (err.message.includes("UNIQUE") || err.code === "SQLITE_CONSTRAINT") {
      return res.render("auth/register", {
        error: "This username already exists. Try a different one."
      });
    }

    return res.render("auth/register", {
      error: "Registration failed: " + err.message
    });
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

    res.redirect("/");
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
