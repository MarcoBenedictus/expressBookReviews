const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const fs = require('fs'); 
let books = require("./booksdb.js");
const regd_users = express.Router();

const USERS_FILE = "./users.json";

// Load users from a file
const loadUsers = () => {
    try {
        return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    } catch (error) {
        return {};
    }
};

// Save users to a file
const saveUsers = (users) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 4));
};

let users = loadUsers(); 

const isValid = (username) => {
    return !users[username];
};

const authenticatedUser = (username, password) => {
    return users[username] && users[username].password === password;
};

regd_users.use(session({ secret: "secretkey", resave: true, saveUninitialized: true }));

regd_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    if (!isValid(username)) {
        return res.status(409).json({ message: "Username already exists." });
    }

    users[username] = { password };
    saveUsers(users); 

    return res.status(201).json({ message: "User registered successfully!" });
});

regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign({ username }, "secretkey", { expiresIn: '1h' });

    req.session.authorization = { accessToken: token, username }; 
    
    return res.status(200).json({ message: "Login successful!", token });
});

regd_users.get("/auth/check", (req, res) => {
    if (req.session.authorization) {
        return res.status(200).json({ message: "User is logged in", token: req.session.authorization.accessToken });
    }
    return res.status(401).json({ message: "User not logged in" });
});

regd_users.post("/auth/logout", (req, res) => {
    req.session.destroy();
    return res.status(200).json({ message: "Logout successful" });
});

// **🔹 Fixed Review Route (JWT Verification)**
regd_users.post("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.query;
    const token = req.headers.authorization?.split(" ")[1]; // Extract token

    if (!token) {
        return res.status(401).json({ message: "Unauthorized. Token missing." });
    }

    // Verify token before proceeding
    jwt.verify(token, "secretkey", (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid Token" });
        }

        const username = decoded.username; // Extract username from token

        if (!review) {
            return res.status(400).json({ message: "Review cannot be empty." });
        }

        if (!books[isbn]) {
            return res.status(404).json({ message: "Book not found." });
        }

        // Store or update review
        if (!books[isbn].reviews) {
            books[isbn].reviews = {};
        }

        books[isbn].reviews[username] = review;

        return res.status(200).json({ message: "Review added/updated successfully!", reviews: books[isbn].reviews });
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
