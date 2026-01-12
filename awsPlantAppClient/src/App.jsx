import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import MyPlants from "./pages/MyPlants";
import LoginGoogle from "./pages/LoginGoogle";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/my-plants" element={<MyPlants />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
