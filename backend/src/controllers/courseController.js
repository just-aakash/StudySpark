import Course from '../models/Course.js';

// @desc   Get all available courses
// @route  GET /api/courses
// @access Private
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({}).lean();
    
    // Seed default courses if empty for UX test purposes
    if (courses.length === 0) {
      const defaultCourses = [
        { icon: "🌐", title: "Full Stack Web Dev", color: "#6366f1" },
        { icon: "🤖", title: "Machine Learning", color: "#f59e0b" },
        { icon: "📡", title: "Computer Networks", color: "#a855f7" },
        { icon: "🐍", title: "Python Programming", color: "#22c55e" },
        { icon: "☁️", title: "Cloud & DevOps", color: "#38bdf8" },
        { icon: "☕", title: "Java & OOP", color: "#f97316" }
      ];
      const inserted = await Course.insertMany(defaultCourses);
      return res.json(inserted);
    }

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
