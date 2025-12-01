const express = require("express");
const path = require("path");
const session = require("express-session");
const helmet = require("helmet");
const csrf = require("csurf");

const app = express();

// Set up View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

// Static files
app.use(express.static(path.join(__dirname, "..", "public")));

// Parse form data
app.use(express.urlencoded({ extended: false }));

// Security headers
app.use(helmet());

// Session configuration
app.use(
  session({
    secret: "change-this-secret-later", // use env var in real apps
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,       // So that JS in the browser can't read the cookie
      sameSite: "lax",      // To help defend against CSRF
      // secure: true       // enable this when behind HTTPS
    },
  })
);

// CSRF protection
const csrfProtection = csrf();
app.use(csrfProtection);

// Make csrfToken & currentUser available in ALL views
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.currentUser = req.session.user || null;
  next();
});

// Basic home route
app.get("/", (req, res) => {
  res.render("home", { title: "Expense Splitter" });
});

// Auth route
const authRoutes = require("./routes/auth");
app.use(authRoutes);

// Group route
const groupRoutes = require("./routes/groups");
app.use(groupRoutes);

// Expnse route
const expenseRoutes = require("./routes/expenses");
app.use(expenseRoutes);



// Error handler for CSRF errors
app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).send("Form tampered with or session expired.");
  }
  next(err);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Expense Splitter app listening on http://localhost:${PORT}`);
});
