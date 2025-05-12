import { Route, Routes } from "react-router-dom";
import DashboardPage from "./features/pdf/pages/DashboardPage";
import PdfMergePage from "./features/pdf/pages/PdfMergePage";
import PdfSplitPage from "./features/pdf/pages/PdfSplitPage";
import PdfRemovePage from "./features/pdf/pages/PdfRemovePage";
import Layout from "./components/Layout";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { ProtectedRoute } from "./features/auth/components/ProtectedRoute";
import { RedirectIfAuthenticated } from "./features/auth/components/RedirectIfAuthenticated";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route element={<ProtectedRoute />}>
            <Route index element={<DashboardPage />} />
            <Route path="merge" element={<PdfMergePage />} />
            <Route path="split" element={<PdfSplitPage />} />
            <Route path="remove" element={<PdfRemovePage />} />
          </Route>
          
          <Route element={<RedirectIfAuthenticated />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
