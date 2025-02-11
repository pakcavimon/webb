const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./db');  // เชื่อมโยงกับ db.js

const app = express();
const port = 3000;

app.use(express.json());  
app.use('/CSS', express.static(path.join(__dirname, 'CSS')));

// เส้นทางหน้าแรก
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// เส้นทางสำหรับหน้า register
app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

// ✅ สมัครสมาชิก
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // ตรวจสอบว่ามี username นี้อยู่แล้วหรือไม่
    const checkQuery = 'SELECT username FROM users WHERE username = ?';
    db.query(checkQuery, [username], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการตรวจสอบฐานข้อมูล' });
        }

        if (results.length > 0) {
            return res.json({ success: false, message: '❌ ชื่อผู้ใช้งานนี้มีอยู่แล้ว' });
        } else {
            // แฮชรหัสผ่าน
            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการแฮชรหัสผ่าน' });
                }

                // เพิ่มข้อมูลผู้ใช้ใหม่
                const insertQuery = 'INSERT INTO users (username, password) VALUES (?, ?)';
                db.query(insertQuery, [username, hashedPassword], (err, results) => {
                    if (err) {
                        return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูลผู้ใช้' });
                    }
                    res.json({ success: true, message: '✅ สมัครสมาชิกสำเร็จ' });
                });
            });
        }
    });
});

// ✅ ล็อกอิน
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // ค้นหาผู้ใช้ในฐานข้อมูล
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์' });
        }

        if (results.length === 0) {
            return res.json({ success: false, message: '❌ ไม่พบผู้ใช้งานนี้' });
        }

        const user = results[0];

        // ตรวจสอบรหัสผ่านที่ถูกเข้ารหัส
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาด' });
            }
            if (!isMatch) {
                return res.json({ success: false, message: '❌ รหัสผ่านไม่ถูกต้อง' });
            }

            res.json({ success: true, message: '✅ เข้าสู่ระบบสำเร็จ' });
        });
    });
});

// เส้นทางสำหรับหน้า home
app.get('/home.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

// เริ่มต้นเซิร์ฟเวอร์
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
