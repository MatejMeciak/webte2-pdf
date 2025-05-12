import { Route, Routes } from "react-router-dom";
import DashboardPage from "./features/pdf/pages/DashboardPage";
import PdfMergePage from "./features/pdf/pages/PdfMergePage";
import PdfSplitPage from "./features/pdf/pages/PdfSplitPage";
import PdfRemovePage from "./features/pdf/pages/PdfRemovePage";
import Layout from "./components/Layout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="merge" element={<PdfMergePage />} />
        <Route path="split" element={<PdfSplitPage />} />
        <Route path="remove" element={<PdfRemovePage />} />
      </Route>
    </Routes>
  );
}

export default App;
