import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import process from 'node:process';
import path from 'path';
import { fileURLToPath } from 'url';
import { co2 } from '@tgwf/co2';

import authRoutes from './routes/authRoutes.js';
import protectedRoutes from './routes/protectedRoutes.js';
import coursesRoutes from './routes/coursesRoutes.js';
import enrollmentsRoutes from './routes/enrollmentsRoutes.js';
import myCoursesRoutes from './routes/myCoursesRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import tuitionRoutes from './routes/tuitionRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../..', '.env') });

const app = express();  // ✅ app defined FIRST
const distDir = path.resolve(__dirname, '../../dist');

// ✅ Carbon middleware AFTER app
const co2Emission = new co2({ model: 'swd' });

app.use((req, res, next) => {
  let requestBytes = 0;
  let responseBytes = 0;

  if (req.body) requestBytes += Buffer.byteLength(JSON.stringify(req.body), 'utf8');
  if (req.query) requestBytes += Buffer.byteLength(JSON.stringify(req.query), 'utf8');
  if (req.headers) requestBytes += Buffer.byteLength(JSON.stringify(req.headers), 'utf8');

  const originalEnd = res.end;
  res.end = function (chunk) {
    if (chunk) responseBytes += Buffer.byteLength(chunk, 'utf8');
    res.locals.totalBytes = requestBytes + responseBytes;
    const emissions = co2Emission.perByte(res.locals.totalBytes, false);
    console.log(`Route: ${req.method} ${req.url}`);
    console.log(`Data transferred: ${res.locals.totalBytes} bytes`);
    console.log(`CO2 emissions: ${emissions.toFixed(6)} grams`);
    originalEnd.apply(res, arguments);
  };
  next();
});

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  return res.status(200).json({ message: 'Dokkhify API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tuition', tuitionRoutes);

app.use('/api', protectedRoutes);
app.use('/api', coursesRoutes);
app.use('/api', enrollmentsRoutes);
app.use('/api', myCoursesRoutes);

app.use('/api/payment', paymentRoutes);

app.use(express.static(distDir));

app.use((req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  const indexPath = path.join(distDir, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).send('Frontend not built. Run npm run build first.');
    }
  });
});

const startServer = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is missing in environment variables.');
    }
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected');
    const port = process.env.PORT || 5000;
    app.listen(port, () =>
      console.log(`🚀 Server running on port ${port}`)
    );
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();