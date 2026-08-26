const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const db = require('./db');

dotenv.config();
const app = express();
app.use(express.json());

// Register a new user
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Validate input
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into the database
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(query, [username, email, hashedPassword], (err, results) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'Username or email already exists' });
        }
        return res.status(500).json({ message: 'Database error', error: err });
      }
      res.status(201).json({ message: 'User registered successfully' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
});

// Log in a user
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Find user in the database
  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = results[0];

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Login successful', token });
  });
});

// Protected route example
app.post('/protected', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1]; // Extract the token after 'Bearer '
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ message: 'Access granted', user: decoded });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
});

// Create a new schedule
app.post('/add-schedule', (req, res) => {
  const { username, day, subject, period } = req.body;

  // Validate input
  if (!username || !day || !subject || !period) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Insert schedule into the database
  const query = 'INSERT INTO schedules (username, day, subject, period) VALUES (?, ?, ?, ?)';
  db.query(query, [username, day, subject, period], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }
    res.status(201).json({ message: 'Schedule created successfully', schedule: { username, day, subject, period } });
  });
});

// Get schedules for a user
app.get('/view-schedule/:username', (req, res) => {
  const { username } = req.params;

  // Validate input
  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  // Select schedules for a user from the database
  const query = 'SELECT * FROM schedules WHERE username = ?';
  db.query(query, [username], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }

    // Group schedules by day
    const groupedSchedules = results.reduce((acc, schedule) => {
      if (!acc[schedule.day]) {
        acc[schedule.day] = [];
      }
      acc[schedule.day].push(schedule);
      return acc;
    }, {});

    res.status(200).json(groupedSchedules);
  });
});

// API for Senin
app.get('/view-schedule/:username/senin', (req, res) => {
  const { username } = req.params;

  const query = 'SELECT * FROM schedules WHERE username = ? AND day = ?';
  db.query(query, [username, 'Senin'], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }
    res.status(200).json({ day: 'Senin', schedules: results });
  });
});

// API for Selasa
app.get('/view-schedule/:username/selasa', (req, res) => {
  const { username } = req.params;

  const query = 'SELECT * FROM schedules WHERE username = ? AND day = ?';
  db.query(query, [username, 'Selasa'], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }
    res.status(200).json({ day: 'Selasa', schedules: results });
  });
});

// API for Rabu
app.get('/view-schedule/:username/rabu', (req, res) => {
  const { username } = req.params;

  const query = 'SELECT * FROM schedules WHERE username = ? AND day = ?';
  db.query(query, [username, 'Rabu'], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }
    res.status(200).json({ day: 'Rabu', schedules: results });
  });
});

// API for Kamis
app.get('/view-schedule/:username/kamis', (req, res) => {
  const { username } = req.params;

  const query = 'SELECT * FROM schedules WHERE username = ? AND day = ?';
  db.query(query, [username, 'Kamis'], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }
    res.status(200).json({ day: 'Kamis', schedules: results });
  });
});

// API for Jumat
app.get('/view-schedule/:username/jumat', (req, res) => {
  const { username } = req.params;

  const query = 'SELECT * FROM schedules WHERE username = ? AND day = ?';
  db.query(query, [username, 'Jumat'], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }
    res.status(200).json({ day: 'Jumat', schedules: results });
  });
});

// API for Sabtu
app.get('/view-schedule/:username/sabtu', (req, res) => {
  const { username } = req.params;

  const query = 'SELECT * FROM schedules WHERE username = ? AND day = ?';
  db.query(query, [username, 'Sabtu'], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }
    res.status(200).json({ day: 'Sabtu', schedules: results });
  });
});

// API for Minggu
app.get('/view-schedule/:username/minggu', (req, res) => {
  const { username } = req.params;

  const query = 'SELECT * FROM schedules WHERE username = ? AND day = ?';
  db.query(query, [username, 'Minggu'], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }
    res.status(200).json({ day: 'Minggu', schedules: results });
  });
});

// Edit a schedule
app.put('/edit-schedule/:schedule_id', (req, res) => {
  const { schedule_id } = req.params;
  const { username, day, subject, period } = req.body;

  // Validate input
  if (!username || !day || !subject || !period) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Update schedule in the database
  const query = 'UPDATE schedules SET day = ?, subject = ?, period = ? WHERE schedule_id = ? AND username = ?';
  db.query(query, [day, subject, period, schedule_id, username], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Schedule not found or does not belong to the specified user' });
    }

    res.status(200).json({ message: 'Schedule updated successfully', schedule: { schedule_id, username, day, subject, period } });
  });
});

// Delete a schedule
app.delete('/del-schedule/:schedule_id', (req, res) => {
  const { schedule_id } = req.params;
  const { username } = req.body; // Get username from the request body

  // Validate input
  if (!schedule_id || !username) {
    return res.status(400).json({ message: 'Schedule ID and username are required' });
  }

  // Delete schedule from the database
  const query = 'DELETE FROM schedules WHERE schedule_id = ? AND username = ?';
  db.query(query, [schedule_id, username], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error', error: err });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Schedule not found or does not belong to the specified user' });
    }

    res.status(200).json({ message: 'Schedule deleted successfully' });
  });
});

// Route to add an absence log (check role in the database)
app.post('/add-absences', (req, res) => {
  const { username, student_name, class: className, date, status } = req.body;

  if (!username || !student_name || !className || !date || !status) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Check if the username exists and if the role is 'teacher'
  const userCheckSql = 'SELECT role FROM users WHERE username = ?';
  db.query(userCheckSql, [username], (err, results) => {
    if (err) throw err;

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = results[0];
    if (user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can add absences' });
    }

    // Insert the absence log into the database
    const insertSql = 'INSERT INTO absences (student_name, class, date, status) VALUES (?, ?, ?, ?)';
    db.query(insertSql, [student_name, className, date, status], (err, results) => {
      if (err) throw err;

      res.status(201).json({ message: 'Absence added successfully', absenceId: results.insertId });
    });
  });
});

// API endpoint to fetch all data from 'absences' table except 'absence_id'
app.get('/absences', (req, res) => {
  const query = 'SELECT student_name, class, date, status FROM absences';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.status(200).json(results); // Explicitly set status 200 for success
  });
});

// API to update a student's grade
app.put('/grades/:student_name/:subject', (req, res) => {
  const { username, grade } = req.body; // Extract username and grade from the body
  const { student_name, subject } = req.params;

  if (!username) {
    return res.status(400).json({ message: 'Username is required in the request body' });
  }

  // Check if the user is a teacher
  const roleQuery = 'SELECT role FROM users WHERE username = ?';
  db.query(roleQuery, [username], (err, result) => {
    if (err) {
      console.error('Error verifying role:', err);
      return res.status(500).json({ message: 'Error verifying role' });
    }
    if (result.length === 0 || result[0].role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied: Only teachers can perform this action' });
    }

    // Update the grade
    const query = 'UPDATE grades SET grade = ? WHERE student_name = ? AND subject = ?';
    db.query(query, [grade, student_name, subject], (err, result) => {
      if (err) {
        console.error('Error updating grade:', err);
        return res.status(500).json({ message: 'Error updating grade' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Student or subject not found' });
      }
      res.json({ message: 'Grade updated successfully' });
    });
  });
});

// API to initialize grades for all subjects of a student
app.post('/grades/init/:student_name', (req, res) => {
  const { username } = req.body; // Extract username from the body
  const { student_name } = req.params;

  if (!username) {
    return res.status(400).json({ message: 'Username is required in the request body' });
  }

  // Check if the user is a teacher
  const roleQuery = 'SELECT role FROM users WHERE username = ?';
  db.query(roleQuery, [username], (err, result) => {
    if (err) {
      console.error('Error verifying role:', err);
      return res.status(500).json({ message: 'Error verifying role' });
    }
    if (result.length === 0 || result[0].role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied: Only teachers can perform this action' });
    }

    // List of predefined subjects
    const subjects = ['Matematika', 'IPA', 'IPS', 'Bahasa Indonesia', 'Bahasa Inggris', 'PKN', 'Olahraga', 'Agama'];

    const query = 'INSERT INTO grades (student_name, subject) VALUES ?';

    // Prepare data to insert
    const values = subjects.map((subject) => [student_name, subject]);

    db.query(query, [values], (err, result) => {
      if (err) {
        console.error('Error initializing grades:', err);
        return res.status(500).json({ message: 'Error initializing grades' });
      }
      res.json({ message: 'Grades initialized successfully' });
    });
  });
});

// API to get grades of a specific student
app.get('/grades/:student_name', (req, res) => {
  const { student_name } = req.params;

  const query = 'SELECT * FROM grades WHERE student_name = ?';

  db.query(query, [student_name], (err, result) => {
    if (err) {
      console.error('Error fetching grades:', err);
      return res.status(500).json({ message: 'Error fetching grades' });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: 'Grades not found for this student' });
    }
    res.json(result);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
