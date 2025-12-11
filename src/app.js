const express = require("express");
const path = require("path");
const session = require("express-session");
const helmet = require("helmet");
const csrf = require("csurf");
const rateLimit = require("express-rate-limit");


const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

app.use(express.static(path.join(__dirname, "..", "public")));

app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

const csrfProtection = csrf();
app.use(csrfProtection);

app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP because inline EJS can break with it
  crossOriginEmbedderPolicy: false
}));


app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.currentUser = req.session.user || null;
  next();
});

app.use((req, res, next) => {
  res.locals.success = req.session.success || null;
  res.locals.error = req.session.error || null;

  req.session.success = null;
  req.session.error = null;

  next();
});


app.get("/", (req, res) => {
  res.render("home", { title: "Expense Splitter" });
});

// Rate limiting for login route
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,              // login attempts
  message: "Too many login attempts. Please try again in a minute."
});

const authRoutes = require("./routes/auth");

// Apply rate limiter ONLY to POST /login
app.post("/login", loginLimiter);

app.use(authRoutes);


const groupRoutes = require("./routes/groups");
app.use("/groups", groupRoutes);

const expenseRoutes = require("./routes/expenses");
app.use("/groups", expenseRoutes);

app.use((err, req, res, next) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).send("Form tampered with or session expired.");
  }
  next(err);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Expense Splitter running on http://localhost:${PORT}`);
});
