require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// DB Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'mysql.railway.internal',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'railway',
    waitForConnections: true,
    connectionLimit: 10
});

// Create tables on startup
async function initDB() {
    const conn = await pool.getConnection();
    try {
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS assets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(100) NOT NULL,
                value DECIMAL(12, 2) NOT NULL DEFAULT 0,
                dateAdded DATE NOT NULL,
                warrantyDate DATE,
                description TEXT,
                assignedTo INT,
                assignmentDate DATE,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await conn.execute(`
            CREATE TABLE IF NOT EXISTS employees (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                department VARCHAR(100) NOT NULL,
                role VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                status VARCHAR(50) DEFAULT 'Active',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ Database tables ready.');
    } finally {
        conn.release();
    }
}

// ─── ASSETS ───────────────────────────────────────────────────

// GET all assets
app.get('/api/assets', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM assets ORDER BY createdAt DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create asset
app.post('/api/assets', async (req, res) => {
    const { name, category, value, dateAdded, warrantyDate, description } = req.body;
    try {
        const [result] = await pool.execute(
            'INSERT INTO assets (name, category, value, dateAdded, warrantyDate, description) VALUES (?, ?, ?, ?, ?, ?)',
            [name, category, value, dateAdded, warrantyDate || null, description]
        );
        const [rows] = await pool.execute('SELECT * FROM assets WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update asset
app.put('/api/assets/:id', async (req, res) => {
    const { name, category, value, warrantyDate, description, assignedTo, assignmentDate } = req.body;
    try {
        await pool.execute(
            'UPDATE assets SET name=?, category=?, value=?, warrantyDate=?, description=?, assignedTo=?, assignmentDate=? WHERE id=?',
            [name, category, value, warrantyDate || null, description, assignedTo || null, assignmentDate || null, req.params.id]
        );
        const [rows] = await pool.execute('SELECT * FROM assets WHERE id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH update only assignment
app.patch('/api/assets/:id/assign', async (req, res) => {
    const { assignedTo, assignmentDate } = req.body;
    try {
        await pool.execute(
            'UPDATE assets SET assignedTo=?, assignmentDate=? WHERE id=?',
            [assignedTo || null, assignmentDate || null, req.params.id]
        );
        const [rows] = await pool.execute('SELECT * FROM assets WHERE id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE asset
app.delete('/api/assets/:id', async (req, res) => {
    try {
        await pool.execute('DELETE FROM assets WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── EMPLOYEES ───────────────────────────────────────────────

// GET all employees
app.get('/api/employees', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM employees ORDER BY createdAt DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create employee
app.post('/api/employees', async (req, res) => {
    const { name, department, role, email } = req.body;
    try {
        const [result] = await pool.execute(
            'INSERT INTO employees (name, department, role, email, status) VALUES (?, ?, ?, ?, ?)',
            [name, department, role, email, 'Active']
        );
        const [rows] = await pool.execute('SELECT * FROM employees WHERE id = ?', [result.insertId]);
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update employee
app.put('/api/employees/:id', async (req, res) => {
    const { name, department, role, email } = req.body;
    try {
        await pool.execute(
            'UPDATE employees SET name=?, department=?, role=?, email=? WHERE id=?',
            [name, department, role, email, req.params.id]
        );
        const [rows] = await pool.execute('SELECT * FROM employees WHERE id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE employee
app.delete('/api/employees/:id', async (req, res) => {
    try {
        await pool.execute('DELETE FROM employees WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Start
initDB().then(() => {
    app.listen(PORT, () => console.log(`🚀 API running on port ${PORT}`));
}).catch(err => {
    console.error('❌ DB init failed:', err);
    process.exit(1);
});
