import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Search, Download, Play, Lock, CheckCircle, ChevronRight, X } from 'lucide-react';
import toast from 'react-hot-toast';

const API = '/api';

function CoursesPage({ loggedUser }) {
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | free | paid
  const [purchasingId, setPurchasingId] = useState('');
  const [quizMode, setQuizMode] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState('');
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token') || '';
  const authHeaders = useMemo(() => token ? { Authorization: `Bearer ${token}` } : {}, [token]);

  // Fetch all courses — public
  useEffect(() => {
    const loadAll = async () => {
      try {
        const res = await fetch(`${API}/courses`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed');
        setCourses(Array.isArray(data) ? data : []);
      } catch (e) {
        toast.error('Could not load courses.');
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  // Fetch enrolled courses
  useEffect(() => {
    if (!loggedUser || loggedUser.role !== 'student' || !token) return;
    const loadEnrolled = async () => {
      try {
        const res = await fetch(`${API}/myCourses`, { headers: authHeaders });
        const data = await res.json();
        if (res.ok) setMyCourses(Array.isArray(data) ? data : []);
      } catch { }
    };
    loadEnrolled();
  }, [authHeaders, loggedUser, token]);

  const enrolled = (courseId) =>
    myCourses.find(m => m.courseId === courseId || m.courseId?._id === courseId);

  const handleEnroll = async (course) => {
    if (!loggedUser) { toast.error('Please login to enroll.'); navigate('/login'); return; }
    if (loggedUser.role !== 'student') { toast.error('Only students can enroll.'); return; }

    setPurchasingId(course._id);
    try {
      const res = await fetch(`${API}/myCourses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ courseId: course._id }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Enrollment failed'); return; }
      if (data.myCourse) {
        setMyCourses(prev => {
          const exists = prev.find(m => m._id === data.myCourse._id);
          return exists ? prev : [data.myCourse, ...prev];
        });
      }
      setCourses(prev => prev.map(c =>
        c._id === course._id ? { ...c, students: (c.students || 0) + (res.status === 201 ? 1 : 0) } : c
      ));
      toast.success(data.message || 'Enrolled successfully! 🎉');
      navigate('/my-learning');
    } catch { toast.error('Server error.'); }
    finally { setPurchasingId(''); }
  };

  const downloadFiles = (files) => {
    if (!files?.length) { toast.error('No files available.'); return; }
    files.forEach(file => {
      const a = document.createElement('a');
      a.href = file.url || file.content || '#';
      a.download = file.originalName || file.name || 'file';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
    toast.success('Download started!');
  };

  const startQuiz = (myCourse) => {
    if (!myCourse.quiz?.length) { toast.error('No quiz available.'); return; }
    setQuizMode(myCourse);
    setCurrentQ(0);
    setSelectedOpt('');
    setScore(0);
  };

  const submitAnswer = async () => {
    if (!selectedOpt) { toast.error('Select an option first.'); return; }
    const q = quizMode.quiz[currentQ];
    const nextScore = selectedOpt === q.answer ? score + 1 : score;

    if (currentQ + 1 < quizMode.quiz.length) {
      setCurrentQ(currentQ + 1);
      setSelectedOpt('');
      setScore(nextScore);
      return;
    }

    setSubmitting(true);
    try {
      const passed = nextScore === quizMode.quiz.length;
      const progress = passed ? 100 : Math.round((nextScore / quizMode.quiz.length) * 100);
      const res = await fetch(`${API}/myCourses/${quizMode._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ progress, completed: passed, certificate: passed }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'Failed to save quiz.'); return; }
      if (data.myCourse) setMyCourses(prev => prev.map(m => m._id === data.myCourse._id ? data.myCourse : m));
      toast.success(passed ? `🎉 Quiz passed! Score: ${nextScore}/${quizMode.quiz.length}` : `Score: ${nextScore}/${quizMode.quiz.length}. Need all correct for certificate.`);
      setQuizMode(null);
    } catch { toast.error('Server error.'); }
    finally { setSubmitting(false); }
  };

  const filtered = courses.filter(c => {
    const matchSearch = c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (filter === 'free' ? c.price === 'Free' || !c.price : c.price !== 'Free' && c.price);
    return matchSearch && matchFilter;
  });

  // Quiz UI
  if (quizMode) {
    const q = quizMode.quiz[currentQ];
    const options = Array.isArray(q.options) && q.options.length > 0 ? q.options : [q.a, q.b].filter(Boolean);
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center px-4 bg-[#0f0a0b]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl bg-gradient-to-br from-[#1a0f12] to-[#0f0a0b] border border-[#6B0F1A]/40 rounded-3xl p-8 shadow-2xl"
        >
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-[#A82030]">Course Quiz</span>
            <button onClick={() => setQuizMode(null)} className="text-[#c5b4b8] hover:text-white">
              <X size={20} />
            </button>
          </div>
          <h2 className="text-xl font-bold text-white mb-1">{quizMode.courseTitle}</h2>
          <div className="flex justify-between text-sm text-[#c5b4b8] mb-4">
            <span>Question {currentQ + 1} / {quizMode.quiz.length}</span>
            <span>Score: {score}</span>
          </div>
          <div className="h-2 bg-[#2a1218] rounded-full mb-6 overflow-hidden">
            <motion.div
              animate={{ width: `${((currentQ + 1) / quizMode.quiz.length) * 100}%` }}
              className="h-full bg-gradient-to-r from-[#6B0F1A] to-[#A82030] rounded-full"
            />
          </div>
          <p className="text-lg font-semibold text-white mb-5">{q.question}</p>
          <div className="space-y-3">
            {options.map((opt, i) => (
              <motion.label
                key={i}
                whileHover={{ scale: 1.01 }}
                className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedOpt === opt
                    ? 'border-[#A82030] bg-[#6B0F1A]/20'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <input type="radio" name="q" value={opt} checked={selectedOpt === opt}
                  onChange={e => setSelectedOpt(e.target.value)} className="hidden" />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selectedOpt === opt ? 'border-[#A82030]' : 'border-white/30'
                }`}>
                  {selectedOpt === opt && <div className="w-2.5 h-2.5 rounded-full bg-[#A82030]" />}
                </div>
                <span className="text-white text-sm">{opt}</span>
              </motion.label>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={submitAnswer}
            disabled={submitting}
            className="w-full mt-6 py-3 bg-gradient-to-r from-[#6B0F1A] to-[#A82030] text-white font-semibold rounded-xl disabled:opacity-50"
          >
            {submitting ? 'Saving…' : currentQ + 1 === quizMode.quiz.length ? 'Submit Quiz' : 'Next →'}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen px-4 py-12 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold font-['Poppins'] text-white mb-2">
          Explore <span className="text-[#A82030]">Courses</span>
        </h1>
        <p className="text-[#c5b4b8]">
          {loggedUser ? `Welcome back, ${loggedUser.name}!` : 'Browse freely — login to enroll.'}
        </p>
      </motion.div>

      {/* Search + Filter */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c5b4b8]" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search courses…"
            className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#c5b4b8]/60 focus:outline-none focus:border-[#6B0F1A] transition-all text-sm"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'free', 'paid'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-[#6B0F1A] text-white'
                  : 'bg-white/5 border border-white/10 text-[#c5b4b8] hover:border-white/20'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        {loggedUser?.role === 'student' && (
          <Link to="/my-learning"
            className="px-4 py-2 rounded-xl text-sm font-medium bg-[#6B0F1A]/30 border border-[#6B0F1A]/50 text-[#F8C1B8] hover:bg-[#6B0F1A]/50 transition-all">
            My Courses
          </Link>
        )}
      </motion.div>

      {/* Loading */}
      {loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center py-24 text-center">
          <BookOpen size={48} className="text-[#6B0F1A]/50 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No courses found</h3>
          <p className="text-[#c5b4b8]">Try a different search or filter.</p>
        </motion.div>
      )}

      {/* Course Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filtered.map((course, i) => {
            const myEnroll = enrolled(course._id);
            const isExpanded = expandedId === course._id;
            return (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                whileHover={{ y: -4 }}
                className="group relative bg-gradient-to-br from-[#1a0f12] to-[#0f0a0b] border border-white/10 hover:border-[#6B0F1A]/50 rounded-2xl overflow-hidden transition-all duration-300"
              >
                {/* Top gradient strip */}
                <div className="h-1.5 w-full bg-gradient-to-r from-[#6B0F1A] to-[#A82030]" />

                <div className="p-6">
                  {/* Price badge */}
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      course.price === 'Free' || !course.price
                        ? 'bg-green-900/40 text-green-400 border border-green-900'
                        : 'bg-[#6B0F1A]/40 text-[#F8C1B8] border border-[#6B0F1A]/50'
                    }`}>
                      {course.price === 'Free' || !course.price ? 'FREE' : `৳${course.price}`}
                    </span>
                    {myEnroll && (
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <CheckCircle size={12} /> Enrolled
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-[#F8C1B8] transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-[#c5b4b8] mb-4 line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-[#c5b4b8]/60 mb-4">
                    <span>{course.students || 0} students</span>
                    <span>{course.files?.length || 0} materials</span>
                    {course.quiz?.length > 0 && <span>{course.quiz.length} quiz questions</span>}
                  </div>

                  {/* Files preview */}
                  {course.files?.length > 0 && (
                    <div className="mb-4">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : course._id)}
                        className="text-xs text-[#c5b4b8] hover:text-[#F8C1B8] flex items-center gap-1 transition-colors"
                      >
                        <ChevronRight size={12} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        {isExpanded ? 'Hide' : 'View'} materials ({course.files.length})
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-2 space-y-1"
                          >
                            {course.files.map((f, fi) => (
                              <div key={fi} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/5">
                                <span className="text-xs text-[#c5b4b8] truncate flex-1">
                                  {getFileIcon(f.type)} {f.originalName || f.name}
                                </span>
                                {myEnroll && (
                                  <a href={f.url} download={f.originalName || f.name} target="_blank" rel="noreferrer"
                                    className="ml-2 text-xs text-[#A82030] hover:text-[#F8C1B8] transition-colors">
                                    <Download size={12} />
                                  </a>
                                )}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="space-y-2">
                    {!myEnroll ? (
                      !loggedUser ? (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigate('/login')}
                          className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 text-[#c5b4b8] rounded-xl text-sm font-medium hover:border-[#6B0F1A]/50 hover:text-white transition-all"
                        >
                          <Lock size={14} /> Login to Enroll
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleEnroll(course)}
                          disabled={purchasingId === course._id}
                          className="w-full py-2.5 bg-gradient-to-r from-[#6B0F1A] to-[#A82030] text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-[#6B0F1A]/40 transition-all disabled:opacity-50"
                        >
                          {purchasingId === course._id ? 'Enrolling…' : 'Enroll Now'}
                        </motion.button>
                      )
                    ) : (
                      <div className="space-y-2">
                        {myEnroll.files?.length > 0 && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => downloadFiles(myEnroll.files)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1a3a1a] border border-green-800/50 text-green-400 rounded-xl text-sm font-medium hover:bg-green-900/40 transition-all"
                          >
                            <Download size={14} /> Download Materials
                          </motion.button>
                        )}
                        {myEnroll.quiz?.length > 0 && !myEnroll.certificate && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => startQuiz(myEnroll)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#6B0F1A]/20 border border-[#6B0F1A]/40 text-[#F8C1B8] rounded-xl text-sm font-medium hover:bg-[#6B0F1A]/30 transition-all"
                          >
                            <Play size={14} /> Take Quiz
                          </motion.button>
                        )}
                        {myEnroll.certificate && (
                          <div className="flex items-center justify-center gap-2 py-2.5 px-3 bg-green-900/20 border border-green-800/30 rounded-xl text-green-400 text-sm">
                            <CheckCircle size={14} /> Certificate Unlocked
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

function getFileIcon(type = '') {
  if (type.includes('pdf')) return '📄';
  if (type.includes('image')) return '🖼️';
  if (type.includes('video')) return '🎬';
  return '📁';
}

export default CoursesPage;
