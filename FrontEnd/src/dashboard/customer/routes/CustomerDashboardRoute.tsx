import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomerDashboard from "../CustomerDashboard.tsx";
import { authService } from "../../../services/AuthService.ts";

export default function CustomerDashboardRoute() {
    const navigate = useNavigate();

    useEffect(() => {
        if (authService.isAuthenticated() && authService.isAdmin()) {
            navigate("/adashboard");
            return;
        }
    }, [navigate]);

    if (authService.isAuthenticated() && authService.isAdmin()) {
        return null;
    }

    return <CustomerDashboard onBack={() => navigate("/")} />;
}
