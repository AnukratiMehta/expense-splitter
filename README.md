# Secure Expense Splitter Application

## Project Title and Overview

This project is a secure web-based Expense Splitter application developed as part of the **Secure Web Development** module. The application allows authenticated users to record shared expenses, manage groups, and view balance and settlement summaries. An SSDLC-based approach was used to embed security across all stages of the project, with security integrated throughout development rather than added retrospectively to ensure data confidentiality and integrity.

---

## Features and Security Objectives

### Core Features
- User registration and login
- Group creation and membership management
- Expense creation and split calculation
- Balance and settlement calculation per group

### Security Objectives
- Prevent unauthorised access to group and expense data
- Ensure secure session handling and authentication
- Protect against SQL injection, XSS, and CSRF attacks
- Enforce server-side validation and authorisation checks

---

## Project Structure

The repository is organised to separate concerns and improve maintainability:

---

## Setup and Installation

### Prerequisites
- Node.js (v18 or later recommended)

### Installation Steps

1. Clone or extract the project files.
2. Navigate to the project directory.
3. Install dependencies:

```
npm install
```

4. Start the application:

```
npm start
```

5. The application will be available at:

```
http://localhost:3000
```

---
### Optional Deployment

A deployed instance of the application is available at:

https://expense-splitter-2dzn.onrender.com

This deployment is provided for demonstration purposes only. The application can be fully run and tested locally by following the setup instructions above.

---

## Project Structure

The repository is organised to separate concerns and improve maintainability:

```

├── controllers/
│   ├── authController.js        # Authentication logic
│   ├── groupController.js       # Group-related operations
│   └── expenseController.js     # Expense handling logic
│
├── models/
│   ├── db.js                    # SQLite database connection
│   ├── userModel.js             # User data access
│   ├── groupModel.js            # Group data access
│   └── expenseModel.js          # Expense data access
│
├── routes/
│   ├── auth.js                  # Authentication routes
│   ├── groups.js                # Group routes
│   └── expenses.js              # Expense routes
│
├── views/
│   ├── login.ejs                # Login page
│   ├── register.ejs             # Registration page
│   ├── home.ejs                 # Dashboard
│   └── groups/                  # Group-related views
│
├── public/
│   └── styles.css               # Application styling
│
├── app.js                       # Main application entry point
├── package.json                 # Dependencies and scripts
└── README.md                    # Project documentation

````

---

## Usage Guidelines

1. Register a new user account.
2. Log in using valid credentials.
3. Create a group and add members.
4. Add expenses and define how they are split.
5. View balances and settlement calculations.

Only authorised users can access group and expense data. Direct URL access to unauthorised resources is rejected.

---

## Security Improvements

The following security controls were implemented to address common web application vulnerabilities:

* Session-based authentication using secure cookies
* Server-side authorisation and ownership enforcement
* CSRF protection on all state-changing requests
* Input validation and business rule enforcement
* Parameterised SQL queries to prevent SQL injection
* Output escaping to mitigate XSS attacks
* Rate limiting on authentication endpoints

All security controls are enforced server-side.

---

## Testing Process

Security testing was performed using a combination of:

* Manual testing of authentication and authorisation flows
* Input manipulation to test validation and business rules
* Injection testing for SQL injection and XSS
* Verification of CSRF token enforcement
* Route access testing to ensure server-side protection

Testing confirmed that unauthorised access attempts, malicious input, and injection attacks are correctly rejected.

---

## Contributions and References

The following frameworks and libraries were used:

* Node.js
* Express.js
* SQLite3
* EJS
* express-session
* csurf
* express-rate-limit

---