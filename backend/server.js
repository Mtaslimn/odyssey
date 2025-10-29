const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

// Import PostgreSQL model instead of MongoDB
const { pool, initTable, saveContact, getAllContacts } = require("./models/Contact");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, images)
app.use(express.static(path.join(__dirname, "..")));

// Initialize database table
const connectDB = async () => {
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected successfully');
    
    // Create table if not exists
    await initTable();
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error);
    process.exit(1);
  }
};

connectDB();

// Contact form submission route
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }
    
    // Save to database
    const contact = await saveContact(name, email, subject, message);
    
    console.log("✅ Contact saved:", { name, email, subject });
    res.status(201).json({ 
      message: "Contact saved successfully!",
      contact: { id: contact.id, name, email, subject }
    });
  } catch (err) {
    console.error("❌ Error saving contact:", err);
    res.status(500).json({ error: "Failed to save contact." });
  }
});

// Get all contacts (optional - for testing/admin)
app.get("/api/contacts", async (req, res) => {
  try {
    const contacts = await getAllContacts();
    res.json({ contacts, count: contacts.length });
  } catch (err) {
    console.error("❌ Error fetching contacts:", err);
    res.status(500).json({ error: "Failed to fetch contacts." });
  }
});

// Health check
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: "ok", 
      message: "Server is running",
      database: "connected",
      timestamp: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({ 
      status: "error", 
      message: "Database connection failed",
      database: "disconnected"
    });
  }
});

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Visit: http://localhost:${PORT}`);
});