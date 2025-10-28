const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const Contact = require("./models/Contact");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, JS, images) from the project root
app.use(express.static(path.join(__dirname, "..")));

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/odyssey");

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    const contact = new Contact({ name, email, subject, message });
    await contact.save();
    res.status(201).json({ message: "Contact saved successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save contact." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
