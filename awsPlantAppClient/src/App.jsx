import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import MyPlants from "./pages/MyPlants";
import "./App.css";
import LoginGoogle from "./pages/LoginGoogle";

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            {/* <Route path="/login" element={<LoginGoogle />} /> */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/my-plants" element={<MyPlants />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
