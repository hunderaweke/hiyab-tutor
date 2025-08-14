import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Testimonials from "./components/Testimonials";
import Testimonial from "./components/Testimonial";
import CreateTestimonial from "./components/CreateTestimonial";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/testimonials/:id" element={<Testimonial />} />
            <Route path="/create-testimonial" element={<CreateTestimonial />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
