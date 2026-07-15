import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../common/Sidebar";
import Header from "../common/Header";

const titleMap = {
  dashboard: "Platform Overview",
  salons: "Salons Controller",
  users: "User Directory",
  payments: "Global Ledger",
  analytics: "Revenue Analytics",
  kyc: "KYC Verifications",
  "refund-requests": "Refund Requests",
};

const getTitle = (path) => {
  const segment = path.split("/").pop();
  return titleMap[segment] || "Admin Panel";
};

const AdminLayout = () => {
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

        <div className="flex-1 flex flex-col min-w-0">
          <Header
            title={getTitle(location.pathname)}
            onMenuToggle={() => setIsSidebarOpen(true)}
          />

          <main className="flex-1 overflow-y-auto">
            <div
              key={location.pathname}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 opacity-0 animate-[ezcFadeUp_0.4s_ease_forwards]"
            >
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;