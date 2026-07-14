import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../common/Sidebar";
import Header from "../common/Header";

const titleMap = {
  dashboard: "Dashboard Overview",
  bookings: "Appointments",
  services: "Services Catalog",
  queue: "Live Queue",
  payments: "Earnings",
};

const getTitle = (path) => {
  const segment = path.split("/").pop();
  return titleMap[segment] || "Owner Panel";
};

const OwnerLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7faf9]">
      <div className="md:flex min-h-screen">
        <Sidebar isMobileOpen={isSidebarOpen} onMobileClose={() => setIsSidebarOpen(false)} />

        {isSidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header title={getTitle(location.pathname)} onMenuToggle={() => setIsSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto bg-[#f7faf9] p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto w-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default OwnerLayout;