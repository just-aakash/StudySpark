import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import CoursePage from "./pages/CoursePage";

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (data) => {
    setUser(data);
    console.log("Logged in:", data);
  };

  const handleRegister = (data) => {
    setUser(data);
    console.log("Registered:", data);
  };

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
      <Route path="/register" element={<RegisterPage onRegister={handleRegister} />} />
      <Route path="/dashboard" element={<DashboardPage user={user} />} />
      <Route path="/courses" element={<CoursePage user={user} />} />
    </Routes>
  );
}

export default App;