import { Outlet } from "react-router-dom";
import AppNavigation from "@/components/AppNavigation"

function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <AppNavigation />
      <main className="w-full">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;