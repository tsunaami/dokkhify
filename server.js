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
import adminRoutes from './routes/adminRoutes.js';
import tuitionRoutes from './routes/tuitionRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../..', '.env') });

const app = express();
const distDir = path.resolve(__dirname, '../../dist');

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  return res.status(200).json({ message: 'Dokkhify API is running.' });
});

// Specific API Routes first
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tuition', tuitionRoutes);

// General API Routes after
app.use('/api', protectedRoutes);
app.use('/api', coursesRoutes);
app.use('/api', enrollmentsRoutes);
app.use('/api', myCoursesRoutes);



// Serve frontend in production
app.use(express.static(distDir));

// Catch-all for SPA (Express 5 compatibility)
app.use((req, res, next) => {
  // Don't serve index.html for missing API routes
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  const indexPath = path.join(distDir, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // Fallback for dev mode where dist might not exist yet
      res.status(404).send('Frontend not built. Run npm run build first.');
    }
  });
});

const startServer = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error('MONGO_URI is missing in environment variables.');
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();
