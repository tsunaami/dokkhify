import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const API_BASE_URL = 'http://localhost:5000';

function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceType, setPriceType] = useState('free');
  const [price, setPrice] = useState('');
  const [files, setFiles] = useState([]);
  const [quiz, setQuiz] = useState([
    { question: '', a: '', b: '', answer: '' },
  ]);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);
  const loggedUser = JSON.parse(localStorage.getItem('loggedUser') || 'null');
  const token = localStorage.getItem('token') || '';

  const authHeaders = useMemo(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/courses`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to fetch courses');
      }

      const filteredCourses = (Array.isArray(data) ? data : []).filter(
        (course) => course.uploadedBy === loggedUser?.email
      );
      setCourses(filteredCourses);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  }, [loggedUser?.email]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const addQuizQuestion = () => {
    setQuiz((prev) => [...prev, { question: '', a: '', b: '', answer: '' }]);
  };

  const removeQuizQuestion = (index) => {
    setQuiz((prev) => {
      if (prev.length === 1) {
        return [{ question: '', a: '', b: '', answer: '' }];
      }

      return prev.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const updateQuizQuestion = (index, field, value) => {
    setQuiz((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  const addCourse = async () => {
    if (!loggedUser || loggedUser.role !== 'instructor' || !token) {
      alert('Login as an instructor first.');
      return;
    }

    if (!title || !description || files.length === 0) {
      alert('Please fill all fields and upload files.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', priceType === 'free' ? 'Free' : price);

      const normalizedQuiz = quiz
        .filter((item) => item.question && item.answer)
        .map((item) => ({
          question: item.question,
          options: [item.a, item.b].filter(Boolean),
          a: item.a,
          b: item.b,
          answer: item.answer,
        }));

      formData.append('quiz', JSON.stringify(normalizedQuiz));
      Array.from(files).forEach((file) => formData.append('files', file));

      const res = await fetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: authHeaders,
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Upload failed');
      }

      setTitle('');
      setDescription('');
      setPriceType('free');
      setPrice('');
      setFiles([]);
      setQuiz([{ question: '', a: '', b: '', answer: '' }]);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      await fetchCourses();
      alert('Course uploaded successfully.');
    } catch (error) {
      console.error(error);
      alert(error.message || 'Upload failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (id) => {
    if (!token) {
      alert('Login first.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Delete failed');
      }

      await fetchCourses();
    } catch (error) {
      console.error(error);
      alert(error.message || 'Failed to delete course.');
    }
  };

  const getFileIcon = (type = '') => {
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('image')) return 'IMG';
    if (type.includes('video')) return 'VID';
    if (type.includes('zip')) return 'ZIP';
    if (type.includes('presentation')) return 'PPT';
    return 'FILE';
  };

  return (
    <div style={{ background: '#f5f7fb', minHeight: '100vh', padding: '40px' }}>
      <div style={{ maxWidth: '900px', margin: 'auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
          Instructor Dashboard
        </h2>

        <div style={uploadBox}>
          <h3>Upload New Course</h3>

          <input
            type="text"
            placeholder="Course Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
          />

          <textarea
            placeholder="Course Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={inputStyle}
          />

          <select
            value={priceType}
            onChange={(e) => setPriceType(e.target.value)}
            style={inputStyle}
          >
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>

          {priceType === 'paid' && (
            <input
              type="number"
              placeholder="Enter price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={inputStyle}
            />
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg,.zip,.mp4,.ppt,.pptx"
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            style={{ marginTop: '10px' }}
          />

          <div style={{ marginTop: '18px' }}>
            <h4 style={{ marginBottom: '8px' }}>Quiz</h4>

            {quiz.map((question, index) => (
              <div key={index} style={quizCard}>
                <div style={quizCardHeader}>
                  <h5 style={{ margin: 0 }}>Question {index + 1}</h5>
                  <button
                    type="button"
                    style={removeQuestionBtn}
                    onClick={() => removeQuizQuestion(index)}
                  >
                    Remove
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Question"
                  value={question.question}
                  onChange={(e) =>
                    updateQuizQuestion(index, 'question', e.target.value)
                  }
                  style={inputStyle}
                />

                <input
                  type="text"
                  placeholder="Option A"
                  value={question.a}
                  onChange={(e) =>
                    updateQuizQuestion(index, 'a', e.target.value)
                  }
                  style={inputStyle}
                />

                <input
                  type="text"
                  placeholder="Option B"
                  value={question.b}
                  onChange={(e) =>
                    updateQuizQuestion(index, 'b', e.target.value)
                  }
                  style={inputStyle}
                />

                <input
                  type="text"
                  placeholder="Correct Answer"
                  value={question.answer}
                  onChange={(e) =>
                    updateQuizQuestion(index, 'answer', e.target.value)
                  }
                  style={inputStyle}
                />
              </div>
            ))}

            <button type="button" style={secondaryBtn} onClick={addQuizQuestion}>
              + Add Question
            </button>
          </div>

          <button style={uploadBtn} onClick={addCourse} disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Course'}
          </button>
        </div>

        <h3>Your Uploaded Courses</h3>
        {courses.length === 0 && <p>No courses uploaded yet.</p>}

        {courses.map((course) => (
          <div key={course._id} style={courseCard}>
            <h4>{course.title}</h4>
            <p>{course.description}</p>
            <p>
              <b>Price:</b> {course.price === 'Free' ? 'Free' : `৳${course.price}`}
            </p>
            <p>
              <b>Students Accessed:</b> {course.students || 0}
            </p>

            {course.quiz?.length > 0 && (
              <p>
                <b>Quiz Questions:</b> {course.quiz.length}
              </p>
            )}

            <div style={{ marginTop: '10px' }}>
              <b>Files:</b>
              {course.files?.map((file, index) => (
                <div key={index} style={fileRow}>
                  <span>
                    {getFileIcon(file.type)} {file.originalName}
                  </span>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginLeft: '10px' }}
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>

            <button style={deleteBtn} onClick={() => deleteCourse(course._id)}>
              Delete Course
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px',
  marginTop: '10px',
  borderRadius: '6px',
  border: '1px solid #ccc',
};

const uploadBox = {
  background: 'white',
  padding: '25px',
  borderRadius: '12px',
  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  marginBottom: '40px',
};

const uploadBtn = {
  marginTop: '15px',
  padding: '10px 18px',
  background: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};

const secondaryBtn = {
  marginTop: '10px',
  padding: '8px 14px',
  background: '#1976d2',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};

const deleteBtn = {
  marginTop: '15px',
  padding: '8px 14px',
  background: '#e53935',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};

const courseCard = {
  background: 'white',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 3px 8px rgba(0,0,0,0.08)',
  marginTop: '20px',
};

const fileRow = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '8px',
  alignItems: 'center',
};

const quizCard = {
  marginBottom: '15px',
  padding: '14px',
  borderRadius: '10px',
  background: '#f8fbff',
  border: '1px solid #d9e6f2',
};

const quizCardHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '10px',
};

const removeQuestionBtn = {
  padding: '6px 10px',
  background: '#fff1f1',
  color: '#a11d1d',
  border: '1px solid #efc1c1',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 600,
};

export default InstructorDashboard;
