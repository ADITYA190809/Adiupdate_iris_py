const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./financial_app.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) console.error('Error creating users table:', err);
  });

  // Categories table
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
    color TEXT DEFAULT '#3B82F6',
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`, (err) => {
    if (err) {
      console.error('Error creating categories table:', err);
      return;
    }

    // Insert default categories after table is created
    const defaultCategories = [
      { name: 'Salary', type: 'income', color: '#10B981' },
      { name: 'Freelance', type: 'income', color: '#059669' },
      { name: 'Food & Dining', type: 'expense', color: '#EF4444' },
      { name: 'Transportation', type: 'expense', color: '#F59E0B' },
      { name: 'Shopping', type: 'expense', color: '#8B5CF6' },
      { name: 'Entertainment', type: 'expense', color: '#EC4899' },
      { name: 'Bills & Utilities', type: 'expense', color: '#6B7280' },
      { name: 'Healthcare', type: 'expense', color: '#DC2626' }
    ];

    defaultCategories.forEach(category => {
      db.run(`INSERT OR IGNORE INTO categories (name, type, color, user_id) VALUES (?, ?, ?, NULL)`,
        [category.name, category.type, category.color], (err) => {
          if (err) console.error('Error inserting default category:', category.name, err);
        });
    });
  });

  // Transactions table
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    description TEXT,
    category_id INTEGER,
    type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
    date DATE NOT NULL,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`, (err) => {
    if (err) console.error('Error creating transactions table:', err);
  });

  // Budgets table
  db.run(`CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER,
    amount REAL NOT NULL,
    period TEXT CHECK(period IN ('monthly', 'weekly', 'yearly')) DEFAULT 'monthly',
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`, (err) => {
    if (err) console.error('Error creating budgets table:', err);
  });
}

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/register', [
  body('username').isLength({ min: 3 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
      [username, email, hashedPassword], function(err) {
        if (err) {
          return res.status(400).json({ error: 'User already exists' });
        }
        
        const token = jwt.sign({ userId: this.lastID, username }, JWT_SECRET);
        res.json({ token, user: { id: this.lastID, username, email } });
      });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET);
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  });
});

// Transaction routes
app.get('/api/transactions', authenticateToken, (req, res) => {
  const { startDate, endDate, category, type } = req.query;
  let query = `
    SELECT t.*, c.name as category_name, c.color as category_color 
    FROM transactions t 
    LEFT JOIN categories c ON t.category_id = c.id 
    WHERE t.user_id = ?
  `;
  const params = [req.user.userId];

  if (startDate) {
    query += ' AND t.date >= ?';
    params.push(startDate);
  }
  if (endDate) {
    query += ' AND t.date <= ?';
    params.push(endDate);
  }
  if (category) {
    query += ' AND t.category_id = ?';
    params.push(category);
  }
  if (type) {
    query += ' AND t.type = ?';
    params.push(type);
  }

  query += ' ORDER BY t.date DESC, t.created_at DESC';

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/api/transactions', authenticateToken, [
  body('amount').isFloat({ min: 0.01 }),
  body('type').isIn(['income', 'expense']),
  body('date').isISO8601()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { amount, description, category_id, type, date } = req.body;
  
  db.run(`INSERT INTO transactions (amount, description, category_id, type, date, user_id) 
           VALUES (?, ?, ?, ?, ?, ?)`,
    [amount, description, category_id, type, date, req.user.userId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, message: 'Transaction created successfully' });
    });
});

app.put('/api/transactions/:id', authenticateToken, (req, res) => {
  const { amount, description, category_id, type, date } = req.body;
  
  db.run(`UPDATE transactions SET amount = ?, description = ?, category_id = ?, type = ?, date = ? 
           WHERE id = ? AND user_id = ?`,
    [amount, description, category_id, type, date, req.params.id, req.user.userId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      res.json({ message: 'Transaction updated successfully' });
    });
});

app.delete('/api/transactions/:id', authenticateToken, (req, res) => {
  db.run(`DELETE FROM transactions WHERE id = ? AND user_id = ?`, 
    [req.params.id, req.user.userId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      res.json({ message: 'Transaction deleted successfully' });
    });
});

// Categories routes
app.get('/api/categories', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM categories WHERE user_id IS NULL OR user_id = ? ORDER BY type, name`, 
    [req.user.userId], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    });
});

app.post('/api/categories', authenticateToken, (req, res) => {
  const { name, type, color } = req.body;
  
  db.run(`INSERT INTO categories (name, type, color, user_id) VALUES (?, ?, ?, ?)`,
    [name, type, color || '#3B82F6', req.user.userId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, message: 'Category created successfully' });
    });
});

// Dashboard stats
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  const { period } = req.query; // 'month', 'week', 'year'
  let dateFilter = '';
  
  switch(period) {
    case 'week':
      dateFilter = "AND date >= date('now', '-7 days')";
      break;
    case 'year':
      dateFilter = "AND date >= date('now', '-1 year')";
      break;
    default: // month
      dateFilter = "AND date >= date('now', '-1 month')";
  }

  const queries = [
    `SELECT COALESCE(SUM(amount), 0) as total_income FROM transactions 
     WHERE user_id = ? AND type = 'income' ${dateFilter}`,
    `SELECT COALESCE(SUM(amount), 0) as total_expense FROM transactions 
     WHERE user_id = ? AND type = 'expense' ${dateFilter}`,
    `SELECT c.name, c.color, COALESCE(SUM(t.amount), 0) as total 
     FROM categories c 
     LEFT JOIN transactions t ON c.id = t.category_id AND t.user_id = ? ${dateFilter}
     WHERE (c.user_id IS NULL OR c.user_id = ?) AND c.type = 'expense'
     GROUP BY c.id, c.name, c.color 
     ORDER BY total DESC`
  ];

  Promise.all([
    new Promise((resolve, reject) => {
      db.get(queries[0], [req.user.userId], (err, row) => {
        if (err) reject(err);
        else resolve(row.total_income);
      });
    }),
    new Promise((resolve, reject) => {
      db.get(queries[1], [req.user.userId], (err, row) => {
        if (err) reject(err);
        else resolve(row.total_expense);
      });
    }),
    new Promise((resolve, reject) => {
      db.all(queries[2], [req.user.userId, req.user.userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    })
  ]).then(([totalIncome, totalExpense, categoryBreakdown]) => {
    res.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      categoryBreakdown
    });
  }).catch(err => {
    res.status(500).json({ error: 'Database error' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;