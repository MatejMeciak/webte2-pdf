import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import DashboardPage from "@/features/pdf/pages/DashboardPage"
import PdfMergePage from "@/features/pdf/pages/PdfMergePage"
import PdfSplitPage from "@/features/pdf/pages/PdfSplitPage"
import PdfRemovePage from "@/features/pdf/pages/PdfRemovePage"

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-svh">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/merge" element={<PdfMergePage />} />
          <Route path="/split" element={<PdfSplitPage />} />
          <Route path="/remove" element={<PdfRemovePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
