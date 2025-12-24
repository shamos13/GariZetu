import {useState} from "react";
import {AdminDashboard} from "./dashboard/admin/AdminDashboard.tsx";


function App() {
    const [isAdminView, setIsAdminView] = useState<boolean>(false);

  return (
    <>
        <AdminDashboard onBack={() => setIsAdminView(true)}/>
    </>
  )
}

export default App
