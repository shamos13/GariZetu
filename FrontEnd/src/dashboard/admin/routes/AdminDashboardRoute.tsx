import {useNavigate} from "react-router-dom";
import AdminDashboard from "../AdminDashboard.tsx";

export default function AdminDashboardRoute(){
    const navigate = useNavigate();
    return(
        <AdminDashboard onBack={()=>navigate("/")}/>
    )
}