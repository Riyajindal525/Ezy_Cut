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

  return (
    <div className="owner-layout">
      <Sidebar />
      <div className="owner-content">
        <Header title={getTitle(location.pathname)} />
        <main className="owner-main">
          <div className="owner-main-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default OwnerLayout;