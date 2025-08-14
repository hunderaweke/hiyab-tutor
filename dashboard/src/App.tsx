import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Testimonials from "./components/Testimonials";
import Testimonial from "./components/Testimonial";
import CreateTestimonial from "./components/CreateTestimonial";
import Admins from "./components/Admins";
import CreateAdmin from "./components/CreateAdmin";
import OtherServices from "./components/OtherServices";
import CreateOtherService from "./components/CreateOtherService";
import OtherServiceDetail from "./components/OtherServiceDetail";
import Partners from "./components/Partners";
import PartnerDetail from "./components/PartnerDetail";
import CreatePartner from "./components/CreatePartner";

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
            <Route path="/admins" element={<Admins />} />
            <Route path="/create-admin" element={<CreateAdmin />} />
            <Route path="/other-services" element={<OtherServices />} />
            <Route
              path="/other-services/:id"
              element={<OtherServiceDetail />}
            />
            <Route
              path="/create-other-service"
              element={<CreateOtherService />}
            />
            <Route path="/partners" element={<Partners />} />
            <Route path="/partners/:id" element={<PartnerDetail />} />
            <Route path="/create-partner" element={<CreatePartner />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
