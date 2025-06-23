const express = require('express');
const cors = require('cors');
const mysql = require('mysql');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // serves index.html, JS, CSS from /public

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'pranjal.077',
    database: 'dbms'
  });
  
db.connect(err => {
    if (err) {
        console.error('❌ MySQL connection error:', err);
        return;
    }
    console.log('✅ Connected to MySQL');
});

// 🔁 GET all transactions with category names
app.get('/api/finance', (req, res) => {
    const sql = `
        SELECT t.*, c.name AS category_name
        FROM Transactions t
        LEFT JOIN Categories c ON t.category_id = c.category_id
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching finance data:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, data: results });
    });
});

// ➕ POST a new transaction
app.post('/api/finance', (req, res) => {
    const { user_id, category_id, account_id, title, amount, transaction_date, type } = req.body;
    const sql = `
        INSERT INTO Transactions (user_id, category_id, account_id, title, amount, transaction_date, type)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [user_id, category_id, account_id, title, amount, transaction_date, type], (err, result) => {
        if (err) {
            console.error('Error adding transaction:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, data: { id: result.insertId, ...req.body } });
    });
});

// ✏️ PUT (update) a transaction
app.put('/api/finance/:id', (req, res) => {
    const id = req.params.id;
    const { title, amount, transaction_date, type } = req.body;
    const sql = `
        UPDATE Transactions
        SET title = ?, amount = ?, transaction_date = ?, type = ?
        WHERE transaction_id = ?
    `;
    db.query(sql, [title, amount, transaction_date, type, id], (err) => {
        if (err) {
            console.error('Error updating transaction:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, message: 'Record updated successfully' });
    });
});

// ❌ DELETE a transaction
app.delete('/api/finance/:id', (req, res) => {
    const id = req.params.id;
    db.query('DELETE FROM Transactions WHERE transaction_id = ?', [id], (err) => {
        if (err) {
            console.error('Error deleting transaction:', err);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, message: 'Record deleted successfully' });
    });
});
// ✅ Make sure this exists exactly like this
app.get('/api/categories', (req, res) => {
    db.query('SELECT * FROM categories', (err, results) => {
      if (err) {
        console.error('Error fetching categories:', err);
        return res.status(500).json({ success: false, error: err.message });
      }
      res.json(results); // ← must send the full results array
    });
  });
  
// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
