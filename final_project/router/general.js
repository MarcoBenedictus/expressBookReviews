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


public_users.get("/", (req, res) => {
    const getBooks = () => new Promise((resolve) => {
        setTimeout(() => resolve(books), 1000);
    });

    getBooks()
        .then((books) => res.json(books))
        .catch(() => res.status(500).json({ error: "Error" }));
});

public_users.get("/books-promise", (req, res) => {
    new Promise((resolve) => {
        setTimeout(() => resolve(books), 500); // Simulating delay
    })
    .then(data => res.json(data))
    .catch(() => res.status(500).json({ error: "Error retrieving books" }));
});

public_users.get("/isbn/:isbn", (req, res) => {
    const { isbn } = req.params;

    const getBookByISBN = (isbn) => new Promise((resolve, reject) => {
        setTimeout(() => {
            const book = books[isbn];
            book ? resolve(book) : reject(new Error("Error"));
        }, 1000);
    });

    getBookByISBN(isbn)
        .then((book) => res.json(book))
        .catch(() => res.status(400).json({ error: "Error" }));
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

public_users.get("/author/:author", (req, res) => {
    const { author } = req.params;

    const getBooksByAuthor = (author) => new Promise((resolve, reject) => {
        setTimeout(() => {
            const filteredBooks = Object.values(books).filter((b) => b.author === author);
            filteredBooks.length > 0 ? resolve(filteredBooks) : reject(new Error("Error"));
        }, 1000);
    });

    getBooksByAuthor(author)
        .then((books) => res.json(books))
        .catch(() => res.status(400).json({ error: "Error" }));
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

public_users.get("/title/:title", (req, res) => {
    const { title } = req.params;

    const getBooksByTitle = (title) => new Promise((resolve, reject) => {
        setTimeout(() => {
            const filteredBooks = Object.values(books).filter((b) => b.title === title);
            filteredBooks.length > 0 ? resolve(filteredBooks) : reject(new Error("Error"));
        }, 1000);
    });

    getBooksByTitle(title)
        .then((books) => res.json(books))
        .catch(() => res.status(400).json({ error: "Error" }));
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
