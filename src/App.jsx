import { Routes, Route } from "react-router-dom";
import { useState } from "react";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CoursePage from "./pages/CoursePage";

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (data) => {
    setUser(data);
  };

  const handleRegister = (data) => {
    console.log("User registered:", data);
    setUser(data);
  };

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
      <Route path="/register" element={<RegisterPage onRegister={handleRegister} />} />
      
      <Route path="/courses" element={<CoursePage user={user} onCourseSelect={(courses) => console.log(courses)} />
} />
    </Routes>
  );
}

export default App;