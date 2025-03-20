const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    const jwt = require("jsonwebtoken");

    app.use("/customer/auth/*", function auth(req, res, next) {
        const token = req.header("Authorization"); // Get token from request headers
    
        if (!token) {
            return res.status(401).json({ message: "Access Denied: No Token Provided" });
        }
    
        try {
            const verified = jwt.verify(token, "testing"); // Verify token
            req.user = verified; // Add user data to request
            next(); // Move to the next middleware or route
        } catch (err) {
            res.status(400).json({ message: "Invalid Token" });
        }
    });
    
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
