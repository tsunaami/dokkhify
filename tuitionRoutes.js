import express from 'express';
import ServiceRequest from '../models/ServiceRequest.js';

const router = express.Router();

// Public: Submit a tuition/service request
router.post('/request', async (req, res) => {
  try {
    const { studentName, subject, level, message, email } = req.body;
    
    if (!studentName || !subject || !level) {
      return res.status(400).json({ error: 'Name, subject, and level are required.' });
    }

    const request = new ServiceRequest({ studentName, subject, level, message, email });
    await request.save();

    res.status(201).json({ message: 'Tuition request submitted successfully!' });
  } catch (err) {
    console.error('Error submitting tuition request:', err.message);
    res.status(500).json({ error: 'Failed to submit request.' });
  }
});

export default router;
