import {Route, Routes} from "react-router-dom";
import HomePage from "./pages/HomePage";
import VehiclesPage from "./pages/VehiclesPage";
import VehicleDetailsPage from "./pages/VehicleDetailsPage";
import BookingPage from "./pages/BookingPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import {Layout} from "./components/Layout.tsx";
import AdminDashboardRoute from "./dashboard/admin/routes/AdminDashboardRoute.tsx";
import CustomerDashboardRoute from "./dashboard/customer/routes/CustomerDashboardRoute.tsx";
import { Toaster } from "sonner";


function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/vehicles" element={<VehiclesPage />} />
                <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/adashboard" element={<AdminDashboardRoute />} />
                <Route path="/dashboard" element={<CustomerDashboardRoute />} />
                <Route path="/dashboard/:section" element={<CustomerDashboardRoute />} />
            </Routes>
            <Toaster richColors position="top-right" />
        </Layout>
    );
}

export default App;
