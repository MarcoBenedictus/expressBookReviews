const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Configure session middleware
app.use("/customer", session({
    secret: "secretkey", // **Fixed to match JWT signing key**
    resave: true,
    saveUninitialized: true
}));

// Authentication middleware using session-based tokens
app.use("/customer/auth/*", function auth(req, res, next) {
    if (!req.session.authorization) {
        return res.status(401).json({ message: "Access Denied: No Token Provided" });
    }

    const token = req.session.authorization.accessToken; // **Fixed token key**

    try {
        const verified = jwt.verify(token, "secretkey"); // **Fixed to match signing key**
        req.user = verified; // Attach user data to request
        next();
    } catch (err) {
        return res.status(403).json({ message: "Invalid Token" });
    }
});

app.post("/customer/auth/review/:id", authenticateToken, (req, res) => {
   res.json({ message: "Review submitted successfully!" });
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    console.log("Authorization Header:", authHeader); // Debugging line

    if (!authHeader) {
        return res.status(401).json({ message: "Access Denied: No Token Provided" });
    }

    const token = authHeader.split(" ")[1]; // Extract token after "Bearer"
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid Token" });
        }
        req.user = user; // Store user data in request
        next();
    });
}

// Routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
