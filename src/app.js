const express = require("express");
const path = require("path");
const session = require("express-session");
const helmet = require("helmet");
const csrf = require("csurf");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

app.use(express.static(path.join(__dirname, "..", "public")));

app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "change-this-secret-later",
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

app.use(helmet());

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

const authRoutes = require("./routes/auth");
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
