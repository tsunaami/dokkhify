import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import process from 'node:process';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import protectedRoutes from './routes/protectedRoutes.js';
import coursesRoutes from './routes/coursesRoutes.js';
import enrollmentsRoutes from './routes/enrollmentsRoutes.js';
import myCoursesRoutes from './routes/myCoursesRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../..', '.env') });

const app = express();
const uploadsDir = path.resolve(__dirname, '../../uploads');
const distDir = path.resolve(__dirname, '../../dist');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', (req, res) => {
  return res.status(200).json({ message: 'ShopStream API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);
app.use('/', coursesRoutes);
app.use('/', enrollmentsRoutes);
app.use('/', myCoursesRoutes);

app.use(express.static(distDir));

app.get('/', (req, res) => {
  return res.sendFile(path.join(distDir, 'index.html'));
});

app.use((req, res) => {
  return res.status(404).json({ message: 'Route not found.' });
});

const startServer = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGO_URI is missing in environment variables.');
    }

    await mongoose.connect(mongoUri);

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();
