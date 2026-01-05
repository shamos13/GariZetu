import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import VehiclesPage from "./pages/VehiclesPage";
import VehicleDetailsPage from "./pages/VehicleDetailsPage";
import { Layout } from "./components/Layout.tsx";

function App() {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/vehicles" element={<VehiclesPage />} />
                <Route path="/vehicles/:id" element={<VehicleDetailsPage />} />
            </Routes>
        </Layout>
    );
}

export default App;
