import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomerDashboard from "../CustomerDashboard.tsx";
import { authService } from "../../../services/AuthService.ts";

export default function CustomerDashboardRoute() {
    const navigate = useNavigate();
    const { section } = useParams();

    const validSections = new Set(["dashboard", "profile", "bookings"]);
    const initialPage = section && validSections.has(section) ? section : "dashboard";

    useEffect(() => {
        if (authService.isAuthenticated() && authService.isAdmin()) {
            navigate("/adashboard");
            return;
        }
    }, [navigate]);

    if (authService.isAuthenticated() && authService.isAdmin()) {
        return null;
    }

    return <CustomerDashboard onBack={() => navigate("/")} initialPage={initialPage} />;
}
