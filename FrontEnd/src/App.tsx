import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout.tsx";
import { Toaster } from "sonner";

const HomePage = lazy(() => import("./pages/HomePage"));
const VehiclesPage = lazy(() => import("./pages/VehiclesPage"));
const VehicleDetailsPage = lazy(() => import("./pages/VehicleDetailsPage"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const AdminDashboardRoute = lazy(() => import("./dashboard/admin/routes/AdminDashboardRoute.tsx"));
const CustomerDashboardRoute = lazy(() => import("./dashboard/customer/routes/CustomerDashboardRoute.tsx"));

function RouteFallback() {
    return (
        <div className="layout-container flex min-h-[40vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
        </div>
    );
}

function App() {
    return (
        <Layout>
            <Suspense fallback={<RouteFallback />}>
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
            </Suspense>
            <Toaster richColors position="top-right" />
        </Layout>
    );
}

export default App;
