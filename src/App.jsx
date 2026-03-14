import { useState } from "react";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";

function App() {
  const [page, setPage] = useState("home");

  const handleLogin = (user) => {
    console.log("User logged in:", user);
    setPage("home"); // redirect to home after login
  };

  return (
    <>
      {page === "home" && <HomePage onNav={setPage} />}
      {page === "login" && <LoginPage onNav={setPage} onLogin={handleLogin} />}
    </>
  );
}

export default App;