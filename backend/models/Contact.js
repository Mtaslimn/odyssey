const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize contacts table
const initTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Contacts table ready');
  } catch (error) {
    console.error('❌ Error creating table:', error);
  }
};

// Save contact
const saveContact = async (name, email, subject, message) => {
  try {
    const result = await pool.query(
      'INSERT INTO contacts (name, email, subject, message) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, subject, message]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Get all contacts (optional - for admin view)
const getAllContacts = async () => {
  try {
    const result = await pool.query('SELECT * FROM contacts ORDER BY created_at DESC');
    return result.rows;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  pool,
  initTable,
  saveContact,
  getAllContacts
};