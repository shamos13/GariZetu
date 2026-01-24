import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminDashboard from "../AdminDashboard.tsx";
import { authService } from "../../../services/AuthService.ts";

export default function AdminDashboardRoute() {
    const navigate = useNavigate();

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            navigate("/");
            return;
        }
        if (!authService.isAdmin()) {
            navigate("/dashboard");
            return;
        }
    }, [navigate]);

    if (!authService.isAuthenticated() || !authService.isAdmin()) {
        return null;
    }

    return <AdminDashboard onBack={() => navigate("/")} />;
}