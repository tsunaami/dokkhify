import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Download, Award, BookOpen, CheckCircle, Clock, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

const API = '/api';

function StudentDashboard({ loggedUser }) {
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token') || '';
  const authHeaders = useMemo(() => token ? { Authorization: `Bearer ${token}` } : {}, [token]);

  useEffect(() => {
    const load = async () => {
      if (!loggedUser || loggedUser.role !== 'student' || !token) { setLoading(false); return; }
      try {
        const res = await fetch(`${API}/myCourses`, { headers: authHeaders });
        const data = await res.json();
        if (res.ok) setMyCourses(Array.isArray(data) ? data : []);
      } catch { toast.error('Could not load your courses.'); }
      finally { setLoading(false); }
    };
    load();
  }, [authHeaders, loggedUser, token]);

  const downloadFiles = (files) => {
    if (!files?.length) { toast.error('No files available.'); return; }
    files.forEach(f => {
      const a = document.createElement('a');
      a.href = f.url || f.content || '#';
      a.download = f.originalName || f.name || 'file';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
    toast.success('Download started!');
  };

  const downloadCertificate = (course) => {
    if (!course.certificate) { toast.error('Complete the quiz to unlock certificate.'); return; }
    const doc = new jsPDF('landscape');
    doc.setDrawColor(107, 15, 26);
    doc.setLineWidth(3);
    doc.rect(8, 8, 281, 194);
    doc.setLineWidth(1);
    doc.rect(14, 14, 269, 182);
    doc.setFont('Times', 'Bold');
    doc.setFontSize(40);
    doc.setTextColor(107, 15, 26);
    doc.text('Certificate of Completion', 148, 55, { align: 'center' });
    doc.setFontSize(16);
    doc.setFont('Times', 'Normal');
    doc.setTextColor(50, 50, 50);
    doc.text('This certifies that', 148, 80, { align: 'center' });
    doc.setFontSize(30);
    doc.setFont('Times', 'Bold');
    doc.setTextColor(0, 0, 0);
    doc.text(loggedUser?.name || 'Student', 148, 105, { align: 'center' });
    doc.setFontSize(16);
    doc.setFont('Times', 'Normal');
    doc.setTextColor(50, 50, 50);
    doc.text('has successfully completed the course', 148, 125, { align: 'center' });
    doc.setFontSize(22);
    doc.setFont('Times', 'Bold');
    doc.setTextColor(107, 15, 26);
    doc.text(course.courseTitle, 148, 148, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('Times', 'Normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Issued: ${new Date().toLocaleDateString()} | Dokkhify`, 148, 175, { align: 'center' });
    doc.save(`${course.courseTitle}-certificate.pdf`);
    toast.success('Certificate downloaded! 🏆');
  };

  const completed = myCourses.filter(c => c.certificate).length;
  const inProgress = myCourses.filter(c => !c.certificate).length;

  return (
    <div className="pt-16 min-h-screen bg-[#0f0a0b] px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[#1a0f12] to-[#0f0a0b] border border-[#6B0F1A]/30">
          <h1 className="text-3xl md:text-4xl font-bold font-['Poppins'] text-white mb-1">
            Student <span className="text-[#A82030]">Dashboard</span>
          </h1>
          <p className="text-[#c5b4b8]">Welcome back, {loggedUser?.name}!</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              { label: 'Enrolled', value: myCourses.length, icon: <BookOpen size={18} />, color: 'text-blue-400' },
              { label: 'Completed', value: completed, icon: <CheckCircle size={18} />, color: 'text-green-400' },
              { label: 'In Progress', value: inProgress, icon: <Clock size={18} />, color: 'text-yellow-400' },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="text-center p-3 rounded-2xl bg-white/5">
                <div className={`flex justify-center mb-1 ${color}`}>{icon}</div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-[#c5b4b8]">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <h2 className="text-xl font-bold text-white mb-4">My Enrolled Courses</h2>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse" />)}
          </div>
        )}

        {/* Empty */}
        {!loading && myCourses.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center py-24 text-center">
            <BookOpen size={48} className="text-[#6B0F1A]/40 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No courses yet</h3>
            <p className="text-[#c5b4b8] mb-6">Browse and enroll in courses to start learning.</p>
            <Link to="/courses"
              className="px-6 py-3 bg-gradient-to-r from-[#6B0F1A] to-[#A82030] text-white font-semibold rounded-xl">
              Browse Courses
            </Link>
          </motion.div>
        )}

        {/* Courses */}
        <div className="space-y-4">
          {myCourses.map((course, i) => (
            <motion.div key={course._id}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-gradient-to-br from-[#1a0f12] to-[#0f0a0b] border border-white/10 rounded-2xl p-6"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {course.certificate && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-900/40 text-green-400 border border-green-900/50 flex items-center gap-1">
                        <CheckCircle size={10} /> Completed
                      </span>
                    )}
                    <span className="text-xs text-[#c5b4b8]/60">
                      {course.price === 'Free' ? 'Free Course' : `৳${course.price}`}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{course.courseTitle}</h3>
                  <p className="text-sm text-[#c5b4b8] line-clamp-2 mb-3">{course.courseDescription}</p>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-[#c5b4b8] mb-1">
                      <span>Progress</span>
                      <span>{course.certificate ? '100%' : `${course.progress || 0}%`}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${course.certificate ? 100 : course.progress || 0}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="h-full bg-gradient-to-r from-[#6B0F1A] to-[#A82030] rounded-full"
                      />
                    </div>
                  </div>

                  {/* Files list */}
                  {course.files?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {course.files.map((f, fi) => (
                        <a key={fi} href={f.url} download={f.originalName || f.name} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[#c5b4b8] hover:text-white hover:border-[#6B0F1A]/50 transition-all">
                          {getFileIcon(f.type)} {f.originalName || f.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-row md:flex-col gap-2 flex-shrink-0">
                  {course.files?.length > 0 && (
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => downloadFiles(course.files)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-[#1a3a1a] border border-green-900/50 text-green-400 rounded-xl text-sm font-medium hover:bg-green-900/20 transition-all">
                      <Download size={14} /> Download All
                    </motion.button>
                  )}

                  {!course.certificate && course.quiz?.length > 0 && (
                    <Link to="/courses"
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6B0F1A]/20 border border-[#6B0F1A]/40 text-[#F8C1B8] rounded-xl text-sm font-medium hover:bg-[#6B0F1A]/30 transition-all">
                      <Play size={14} /> Take Quiz
                    </Link>
                  )}

                  {course.certificate && (
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => downloadCertificate(course)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-yellow-900/40 to-yellow-800/20 border border-yellow-800/50 text-yellow-400 rounded-xl text-sm font-semibold hover:shadow-lg transition-all">
                      <Award size={14} /> Download Certificate
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getFileIcon(type = '') {
  if (type?.includes('pdf')) return '📄';
  if (type?.includes('image')) return '🖼️';
  if (type?.includes('video')) return '🎬';
  return '📁';
}

export default StudentDashboard;
