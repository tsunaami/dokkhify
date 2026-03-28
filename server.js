import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'dokkhify_secret_key_2025';
const DB_NAME = process.env.DB_NAME || 'dokkhify';

const uri =
  process.env.MONGODB_URI ||
  'mongodb://mojumdernamira_db_user:HJWx9m9w6nTDpSLZ@ac-ha3jbpf-shard-00-00.hosssmp.mongodb.net:27017,ac-ha3jbpf-shard-00-01.hosssmp.mongodb.net:27017,ac-ha3jbpf-shard-00-02.hosssmp.mongodb.net:27017/?ssl=true&replicaSet=atlas-3op5a4-shard-0&authSource=admin&appName=dokkhify';

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let coursesCollection;
let usersCollection;
let enrollmentsCollection;

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

const requireDb = (req, res, next) => {
  if (!usersCollection || !coursesCollection || !enrollmentsCollection) {
    return res.status(503).json({ error: 'Database is not ready yet' });
  }
  return next();
};

app.get('/', (req, res) => {
  res.send('Backend running');
});

// ── REGISTER ──────────────────────────────────────────
app.post('/api/auth/register', requireDb, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await usersCollection.findOne({
      email: normalizedEmail,
    });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
      createdAt: new Date(),
    };

    await usersCollection.insertOne(newUser);
    return res.status(201).json({ message: 'Registration successful!' });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── LOGIN ─────────────────────────────────────────────
app.post('/auth/login', requireDb, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await usersCollection.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── COURSES ───────────────────────────────────────────
app.post('/courses', requireDb, upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send({ error: 'No files uploaded' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const filesData = req.files.map((file) => ({
      name: file.filename,
      originalName: file.originalname,
      type: file.mimetype,
      url: `${baseUrl}/uploads/${file.filename}`,
    }));

    const course = {
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      uploadedBy: req.body.uploadedBy,
      students: 0,
      files: filesData,
      createdAt: new Date(),
    };

    const result = await coursesCollection.insertOne(course);
    return res.send(result);
  } catch (error) {
    console.error('Create course error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/courses', requireDb, async (req, res) => {
  try {
    const result = await coursesCollection.find().toArray();
    return res.send(result);
  } catch (error) {
    console.error('Get courses error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/courses/:id', requireDb, async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid course id' });
    }

    const result = await coursesCollection.deleteOne({
      _id: new ObjectId(req.params.id),
    });
    return res.send(result);
  } catch (error) {
    console.error('Delete course error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── ENROLLMENTS ───────────────────────────────────────
app.post('/enrollments', requireDb, async (req, res) => {
  try {
    const { courseTitle, studentEmail } = req.body;

    if (!courseTitle || !studentEmail) {
      return res
        .status(400)
        .json({ error: 'courseTitle and studentEmail are required' });
    }

    const normalizedEmail = String(studentEmail).trim().toLowerCase();
    const normalizedCourseTitle = String(courseTitle).trim();

    const existing = await enrollmentsCollection.findOne({
      courseTitle: normalizedCourseTitle,
      studentEmail: normalizedEmail,
    });

    if (existing) {
      return res.status(200).json({
        message: 'Already enrolled',
        enrollment: existing,
      });
    }

    const enrollment = {
      courseTitle: normalizedCourseTitle,
      studentEmail: normalizedEmail,
      certificate: false,
      createdAt: new Date(),
    };

    const result = await enrollmentsCollection.insertOne(enrollment);
    return res.status(201).json({
      message: 'Enrollment successful',
      enrollment: { ...enrollment, _id: result.insertedId },
    });
  } catch (error) {
    console.error('Create enrollment error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/enrollments', requireDb, async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res
        .status(400)
        .json({ error: 'email query parameter is required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const enrollments = await enrollmentsCollection
      .find({ studentEmail: normalizedEmail })
      .toArray();

    return res.json(enrollments);
  } catch (error) {
    console.error('Get enrollments error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/enrollments/certificate', requireDb, async (req, res) => {
  try {
    const { courseTitle, studentEmail } = req.body;

    if (!courseTitle || !studentEmail) {
      return res
        .status(400)
        .json({ error: 'courseTitle and studentEmail are required' });
    }

    const normalizedEmail = String(studentEmail).trim().toLowerCase();
    const normalizedCourseTitle = String(courseTitle).trim();

    const result = await enrollmentsCollection.updateOne(
      {
        courseTitle: normalizedCourseTitle,
        studentEmail: normalizedEmail,
      },
      {
        $set: {
          certificate: true,
          certificateUpdatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    return res.json({ message: 'Certificate updated successfully' });
  } catch (error) {
    console.error('Update certificate error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Helpful fallback for debugging unmatched routes.
app.use((req, res) => {
  res
    .status(404)
    .json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

async function startServer() {
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    coursesCollection = db.collection('courses');
    usersCollection = db.collection('users');
    enrollmentsCollection = db.collection('enrollments');

    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
}

startServer();
