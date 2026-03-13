import HomePage from "./pages/HomePage";

export default function App() {

  const nav = (page) => {
    console.log("Navigate to:", page);
  };

  return (
    <HomePage onNav={nav} />
  );
}