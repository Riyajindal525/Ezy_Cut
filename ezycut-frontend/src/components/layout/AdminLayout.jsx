import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../common/Sidebar";
import Header from "../common/Header";

const titleMap = {
  dashboard: "Platform Overview",
  salons: "Salons Controller",
  users: "User Directory",
  payments: "Global Ledger",
  analytics: "Revenue Analytics",
};

const getTitle = (path) => {
  const segment = path.split("/").pop();
  return titleMap[segment] || "Admin Panel";
};

const AdminLayout = () => {
  const location = useLocation();

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <Header title={getTitle(location.pathname)} />
        <main className="admin-main">
          <div className="admin-main-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;