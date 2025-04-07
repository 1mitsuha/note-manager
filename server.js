const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
// 数据库连接 - 支持 PostgreSQL 和 SQLite
let db;
let pool;
let isPostgres = false;

const app = express();
const port = process.env.PORT || 5000;
const host = '0.0.0.0'; // 允许外部访问

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 根据环境变量选择数据库
if (process.env.DATABASE_URL) {
  // 使用 PostgreSQL (Railway 部署)
  isPostgres = true;
  const { Pool } = require('pg');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  console.log('Using PostgreSQL database');
  
  // 初始化 PostgreSQL 数据库
  const initPostgresDB = async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS notes (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('PostgreSQL database initialized successfully');
    } catch (err) {
      console.error('Error initializing PostgreSQL database:', err);
    }
  };
  
  initPostgresDB();
} else {
  // 使用 SQLite (本地开发)
  const sqlite3 = require('sqlite3').verbose();
  db = new sqlite3.Database('./notes.db', (err) => {
    if (err) {
      console.error('Error connecting to the SQLite database:', err);
    } else {
      console.log('Connected to the SQLite database.');
      // 创建notes表
      db.run(`CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
    }
  });
}

// API 路由

// 获取所有笔记
app.get('/api/notes', async (req, res) => {
  try {
    if (isPostgres) {
      const result = await pool.query('SELECT * FROM notes ORDER BY updated_at DESC');
      res.json(result.rows);
    } else {
      db.all('SELECT * FROM notes ORDER BY updated_at DESC', [], (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(rows);
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 创建新笔记
app.post('/api/notes', async (req, res) => {
  const { title, content } = req.body;
  try {
    if (isPostgres) {
      const result = await pool.query(
        'INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING *',
        [title, content]
      );
      res.json(result.rows[0]);
    } else {
      db.run('INSERT INTO notes (title, content) VALUES (?, ?)', [title, content], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ id: this.lastID, title, content });
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 更新笔记
app.put('/api/notes/:id', async (req, res) => {
  const { title, content } = req.body;
  try {
    if (isPostgres) {
      const result = await pool.query(
        'UPDATE notes SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
        [title, content, req.params.id]
      );
      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Note not found' });
      } else {
        res.json(result.rows[0]);
      }
    } else {
      db.run('UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [title, content, req.params.id], (err) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json({ id: req.params.id, title, content });
        });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 删除笔记
app.delete('/api/notes/:id', async (req, res) => {
  try {
    if (isPostgres) {
      const result = await pool.query('DELETE FROM notes WHERE id = $1', [req.params.id]);
      if (result.rowCount === 0) {
        res.status(404).json({ error: 'Note not found' });
      } else {
        res.json({ message: 'Note deleted successfully' });
      }
    } else {
      db.run('DELETE FROM notes WHERE id = ?', req.params.id, (err) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: 'Note deleted successfully' });
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 搜索笔记
app.get('/api/notes/search', async (req, res) => {
  const query = req.query.q;
  try {
    if (isPostgres) {
      const result = await pool.query(
        'SELECT * FROM notes WHERE title ILIKE $1 OR content ILIKE $1',
        [`%${query}%`]
      );
      res.json(result.rows);
    } else {
      db.all('SELECT * FROM notes WHERE title LIKE ? OR content LIKE ?',
        [`%${query}%`, `%${query}%`], (err, rows) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          res.json(rows);
        });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 添加一个健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 添加根路径响应
app.get('/', (req, res) => {
  res.send('Note Manager API is running. Use /api/notes to access the API.');
});

app.listen(port, host, () => {
  console.log(`Server running on http://${host}:${port}`);
}); 