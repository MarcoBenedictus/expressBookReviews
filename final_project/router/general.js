const Axios = require("axios");
const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: "Check username and password" });
    }

    const exists = users.some((user) => user.username === username);
    if (exists) {
        return res.status(400).json({ message: "Username already exists" });
    }

    users.push({ username, password });
    return res.status(201).json({ message: "User created successfully" });
});


public_users.get('/', function (req, res) {
    return res.status(200).send(JSON.stringify(books, null, 4));
});

public_users.get("/books-promise", (req, res) => {
    new Promise((resolve) => {
        setTimeout(() => resolve(books), 500); // Simulating delay
    })
    .then(data => res.json(data))
    .catch(() => res.status(500).json({ error: "Error" }));
});

public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn; 
    
    if (books[isbn]) {
        return res.status(200).json(books[isbn]); 
    } else {
        return res.status(404).json({ message: "Book not found." }); 
    }
});

public_users.get("/books-promise/isbn/:isbn", (req, res) => {
    const { isbn } = req.params;

    new Promise((resolve, reject) => {
        setTimeout(() => {
            if (books[isbn]) {
                resolve(books[isbn]);
            } else {
                reject(new Error("Error"));
            }
        }, 500);
    })
    .then(data => res.json(data))
    .catch(() => res.status(404).json({ error: "Error" }));
});

public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    const booksByAuthor = Object.values(books).filter(book => book.author === author);

    if (booksByAuthor.length > 0) {
        return res.status(200).json(booksByAuthor);
    } else {
        return res.status(404).json({ message: "Book not found." });
    }
});

public_users.get("/books-promise/author/:author", (req, res) => {
    const { author } = req.params;

    new Promise((resolve, reject) => {
        setTimeout(() => {
            const filteredBooks = Object.values(books).filter(book => book.author === author);
            filteredBooks.length > 0 ? resolve(filteredBooks) : reject(new Error("Error"));
        }, 500);
    })
    .then(data => res.json(data))
    .catch(() => res.status(404).json({ error: "Error" }));
});

public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;
    const booksByTitle = Object.values(books).filter(book => book.title === title);

    if (booksByTitle.length > 0) {
        return res.status(200).json(booksByTitle);
    } else {
        return res.status(404).json({ message: "Book not found." });
    }
});

public_users.get("/books-promise/title/:title", (req, res) => {
    const { title } = req.params;

    new Promise((resolve, reject) => {
        setTimeout(() => {
            const filteredBooks = Object.values(books).filter(book => book.title === title);
            filteredBooks.length > 0 ? resolve(filteredBooks) : reject(new Error("Error"));
        }, 500);
    })
    .then(data => res.json(data))
    .catch(() => res.status(404).json({ error: "Error" }));
});

public_users.get("/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    res.json(books[isbn]?.reviews || { message: "Null" });
});

module.exports.general = public_users;
