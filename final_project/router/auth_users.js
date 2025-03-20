const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => users.some(user => user.username === username);

const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

regd_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Check username and password" });
    }

    if (isValid(username)) {
        return res.status(400).json({ message: "User already exists" });
    }

    users.push({ username, password });
    return res.status(201).json({ message: "User created successfully" });
});

regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!authenticatedUser(username, password)) {
        return res.status(403).json({ message: "User not authenticated" });
    }

    const accessToken = jwt.sign({ username }, 'access', { expiresIn: "1h" });

    req.session.authorization = { accessToken, username };
    res.json({ message: "User logged in successfully", token: accessToken });
});

regd_users.post("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.query;
    const username = req.session.authorization?.username; 

    if (!username) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    if (!review) {
        return res.status(400).json({ message: "Review cannot be empty." });
    }

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found." });
    }

    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: "Review added/updated successfully!", reviews: books[isbn].reviews });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const username = req.session.authorization?.username; 
    if (!username) {
        return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    if (!books[isbn] || !books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({ message: "No review found to delete." });
    }

    delete books[isbn].reviews[username];

    return res.status(200).json({ message: "Review has been deleted", reviews: books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
