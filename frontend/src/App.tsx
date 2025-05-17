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
import PdfExtractPage from "./features/pdf/pages/PdfExtractPage";
import PdfReorderPage from "./features/pdf/pages/PdfReorderPage";
import PdfAddPasswordPage from "./features/pdf/pages/PdfAddPasswordPage";
import PdfRemovePasswordPage from "./features/pdf/pages/PdfRemovePasswordPage";
import PdfToImagesPage from "./features/pdf/pages/PdfToImagesPage";
import PdfAddWatermarkPage from "./features/pdf/pages/PdfAddWatermarkPage";
import PdfRotatePagesPage from "./features/pdf/pages/PdfRotatePagesPage";
import AdminHistoryPage from "./features/history/pages/AdminHistoryPage";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route element={<ProtectedRoute />}>
            <Route index element={<DashboardPage />} />
            <Route path="/pdf/merge" element={<PdfMergePage />} />
            <Route path="/pdf/split" element={<PdfSplitPage />} />
            <Route path="/pdf/remove-page" element={<PdfRemovePage />} />
            <Route path="/pdf/extract-pages" element={<PdfExtractPage />} />
            <Route path="/pdf/reorder-pages" element={<PdfReorderPage />} />
            <Route path="/pdf/add-password" element={<PdfAddPasswordPage />} />
            <Route path="/pdf/remove-password" element={<PdfRemovePasswordPage />} />
            <Route path="/pdf/to-images" element={<PdfToImagesPage />} />
            <Route path="/pdf/add-watermark" element={<PdfAddWatermarkPage />} />
            <Route path="/pdf/rotate-pages" element={<PdfRotatePagesPage />} />
            <Route path="admin/history" element={<AdminHistoryPage />} />
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
