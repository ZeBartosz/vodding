import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import { FeedbackBoard } from "./components/FeedbackBoard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/feedback/*" element={<FeedbackBoard />} />
        <Route path="/feedback/:boardType" element={<FeedbackBoard />} />
      </Routes>
    </Router>
  );
}

export default App;
