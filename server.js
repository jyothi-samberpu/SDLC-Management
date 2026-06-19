// const express = require('express');
// const sqlite3 = require('sqlite3').verbose();
// const path = require('path');

// const app = express();
// const PORT = 3000;
// const db = new sqlite3.Database('./sdlc_dashboard.db');

// app.use(express.json());
// app.use(express.static(path.join(__dirname, 'public')));

// // === AUTOMATIC DATABASE INITIALIZATION ===
// db.serialize(() => {
//     // 1. Create Users Table
//     db.run(`CREATE TABLE IF NOT EXISTS users (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         username TEXT UNIQUE NOT NULL,
//         role TEXT CHECK(role IN ('Project Manager', 'Employee')) NOT NULL
//     )`);

//     // 2. Create Tasks Table
//     db.run(`CREATE TABLE IF NOT EXISTS tasks (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         title TEXT NOT NULL,
//         phase TEXT CHECK(phase IN ('Requirements', 'Design', 'Development', 'Testing', 'Deployment')) NOT NULL DEFAULT 'Requirements',
//         status TEXT CHECK(status IN ('To Do', 'In Progress', 'Completed')) NOT NULL DEFAULT 'To Do',
//         assigned_to TEXT
//     )`);

//     // 3. Insert Default Mock Users safely if they don't exist
//     const stmtUser = db.prepare(`INSERT OR IGNORE INTO users (username, role) VALUES (?, ?)`);
//     stmtUser.run('manager1', 'Project Manager');
//     stmtUser.run('alex_dev', 'Employee');
//     stmtUser.run('sam_qa', 'Employee');
//     stmtUser.finalize(); // FIXED: Changed from .close() to .finalize()
    
//     console.log("⚙️ SQLite Tables validated and ready.");
// });


// // === API ENDPOINTS ===

// // 1. Mock Sign-In Profiles Configuration Switcher Node
// app.post('/api/login', (req, res) => {
//     const { username } = req.body;
//     db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
//         if (err) return res.status(500).json({ error: err.message });
//         if (!user) return res.status(404).json({ error: "User profile context not found" });
//         res.json(user);
//     });
// });

// // 2. Fetch Tasks list matching contextual permissions authorization filters
// app.get('/api/tasks', (req, res) => {
//     const { username, role } = req.query;

//     if (role === 'Project Manager') {
//         db.all('SELECT * FROM tasks ORDER BY id DESC', [], (err, rows) => {
//             if (err) return res.status(500).json({ error: err.message });
//             res.json(rows || []);
//         });
//     } else {
//         // Employees see tasks explicitly assigned to them
//         db.all('SELECT * FROM tasks WHERE assigned_to = ? ORDER BY id DESC', [username], (err, rows) => {
//             if (err) return res.status(500).json({ error: err.message });
//             res.json(rows || []);
//         });
//     }
// });

// // 3. Create a New Target Task Entity Node
// app.post('/api/tasks', (req, res) => {
//     const { title, phase, status, assigned_to, userRole } = req.body;
    
//     if (userRole !== 'Project Manager') {
//         return res.status(403).json({ error: "Access Denied. Scope restricted to Project Managers." });
//     }

//     // Map 'Unassigned' back to a clean null value inside SQLite rows
//     const dbAssignee = (assigned_to === 'Unassigned' || !assigned_to) ? null : assigned_to;

//     db.run(
//         `INSERT INTO tasks (title, phase, status, assigned_to) VALUES (?, ?, ?, ?)`,
//         [title, phase || 'Requirements', status || 'To Do', dbAssignee],
//         function(err) {
//             if (err) return res.status(500).json({ error: err.message });
//             res.json({ id: this.lastID, title, phase, status, assigned_to: dbAssignee });
//         }
//     );
// });

// // 4. Mutate and Save Task Entity State Modifications
// app.put('/api/tasks/:id', (req, res) => {
//     const taskId = req.params.id;
//     const { title, phase, status, assigned_to, userRole } = req.body;

//     if (userRole === 'Project Manager') {
//         const dbAssignee = (assigned_to === 'Unassigned' || !assigned_to) ? null : assigned_to;
//         db.run(
//             `UPDATE tasks SET title = ?, phase = ?, status = ?, assigned_to = ? WHERE id = ?`,
//             [title, phase, status, dbAssignee, taskId],
//             function(err) {
//                 if (err) return res.status(500).json({ error: err.message });
//                 res.json({ message: "Task update successfully executed by Project Manager" });
//             }
//         );
//     } else {
//         db.run(
//             `UPDATE tasks SET status = ? WHERE id = ?`,
//             [status, taskId],
//             function(err) {
//                 if (err) return res.status(500).json({ error: err.message });
//                 res.json({ message: "Status state modified successfully by Assigned Employee" });
//             }
//         );
//     }
// });

// app.listen(PORT, () => {
//     console.log(`🚀 Production Dashboard running at http://localhost:${PORT}`);
// });

















const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
// Render sets process.env.PORT dynamically. Falls back to 3000 locally.
const PORT = process.env.PORT || 3000; 

// === PERSISTENT DATABASE DISK ENVIRONMENT CONFIGURATION ===
// Render mounts persistent disks to /var/data. We check if that folder exists.
const IS_PRODUCTION = fs.existsSync('/var/data');
const DB_PATH = IS_PRODUCTION 
    ? '/var/data/sdlc_dashboard.db' 
    : path.join(__dirname, 'sdlc_dashboard.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) console.error("❌ Database connection error:", err.message);
    else console.log(`💾 Connected to database at: ${DB_PATH}`);
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// === AUTOMATIC DATABASE INITIALIZATION ===
db.serialize(() => {
    // 1. Create Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        role TEXT CHECK(role IN ('Project Manager', 'Employee')) NOT NULL
    )`);

    // 2. Create Tasks Table
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        phase TEXT CHECK(phase IN ('Requirements', 'Design', 'Development', 'Testing', 'Deployment')) NOT NULL DEFAULT 'Requirements',
        status TEXT CHECK(status IN ('To Do', 'In Progress', 'Completed')) NOT NULL DEFAULT 'To Do',
        assigned_to TEXT
    )`);

    // 3. Insert Default Mock Users safely if they don't exist
    const stmtUser = db.prepare(`INSERT OR IGNORE INTO users (username, role) VALUES (?, ?)`);
    stmtUser.run('manager1', 'Project Manager');
    stmtUser.run('alex_dev', 'Employee');
    stmtUser.run('sam_qa', 'Employee');
    stmtUser.finalize();
    
    console.log("⚙️ SQLite Tables validated and ready.");
});


// === API ENDPOINTS ===

// 1. Mock Sign-In Profiles Configuration Switcher Node
app.post('/api/login', (req, res) => {
    const { username } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: "User profile context not found" });
        res.json(user);
    });
});

// 2. Fetch Tasks list matching contextual permissions authorization filters
app.get('/api/tasks', (req, res) => {
    const { username, role } = req.query;

    if (role === 'Project Manager') {
        db.all('SELECT * FROM tasks ORDER BY id DESC', [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows || []);
        });
    } else {
        // Employees see tasks explicitly assigned to them
        db.all('SELECT * FROM tasks WHERE assigned_to = ? ORDER BY id DESC', [username], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows || []);
        });
    }
});

// 3. Create a New Target Task Entity Node
app.post('/api/tasks', (req, res) => {
    const { title, phase, status, assigned_to, userRole } = req.body;
    
    if (userRole !== 'Project Manager') {
        return res.status(403).json({ error: "Access Denied. Scope restricted to Project Managers." });
    }

    // Map 'Unassigned' back to a clean null value inside SQLite rows
    const dbAssignee = (assigned_to === 'Unassigned' || !assigned_to) ? null : assigned_to;

    db.run(
        `INSERT INTO tasks (title, phase, status, assigned_to) VALUES (?, ?, ?, ?)`,
        [title, phase || 'Requirements', status || 'To Do', dbAssignee],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, title, phase, status, assigned_to: dbAssignee });
        }
    );
});

// 4. Mutate and Save Task Entity State Modifications
app.put('/api/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    const { title, phase, status, assigned_to, userRole } = req.body;

    if (userRole === 'Project Manager') {
        const dbAssignee = (assigned_to === 'Unassigned' || !assigned_to) ? null : assigned_to;
        db.run(
            `UPDATE tasks SET title = ?, phase = ?, status = ?, assigned_to = ? WHERE id = ?`,
            [title, phase, status, dbAssignee, taskId],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: "Task update successfully executed by Project Manager" });
            }
        );
    } else {
        db.run(
            `UPDATE tasks SET status = ? WHERE id = ?`,
            [status, taskId],
            function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: "Status state modified successfully by Assigned Employee" });
            }
        );
    }
});

app.listen(PORT, () => {
    console.log(`🚀 System running on port ${PORT}`);
});