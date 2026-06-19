const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./sdlc_dashboard.db');

db.serialize(() => {
    // Create Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        role TEXT CHECK(role IN ('Project Manager', 'Employee')) NOT NULL
    )`);

    // Create Tasks Table
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        phase TEXT CHECK(phase IN ('Requirements', 'Design', 'Development', 'Testing', 'Deployment')) NOT NULL DEFAULT 'Requirements',
        status TEXT CHECK(status IN ('To Do', 'In Progress', 'Completed')) NOT NULL DEFAULT 'To Do',
        assigned_to TEXT
    )`);

    // Populate Initial Mock Users
    const stmtUser = db.prepare(`INSERT OR IGNORE INTO users (id, username, role) VALUES (?, ?, ?)`);
    stmtUser.run(1, 'manager1', 'Project Manager');
    stmtUser.run(2, 'alex_dev', 'Employee');
    stmtUser.run(3, 'sam_qa', 'Employee');
    stmtUser.close();

    // Populate Initial Sample Tasks
    const stmtTask = db.prepare(`INSERT OR IGNORE INTO tasks (id, title, phase, status, assigned_to) VALUES (?, ?, ?, ?, ?)`);
    stmtTask.run(1, 'Database Schema Design', 'Design', 'In Progress', 'alex_dev');
    stmtTask.run(2, 'Auth Flow Implementation', 'Development', 'To Do', 'alex_dev');
    stmtTask.run(3, 'Write Unit Tests', 'Testing', 'To Do', 'sam_qa');
    stmtTask.close();

    console.log("✅ Database initialized successfully with mock data!");
});

db.close();