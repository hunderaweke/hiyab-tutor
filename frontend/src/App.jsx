import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import BookTutor from "./pages/BookTutor";
import TutorApplication from "./pages/TutorApplication";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/book-tutor" element={<BookTutor />} />
        <Route path="/apply-tutor" element={<TutorApplication />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
