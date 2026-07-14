import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

const CustomerLayout = () => {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--gray-50)" }}>
      <Navbar />
      <main style={{ flex: 1, paddingBottom: "0", background: "#ffffff" }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default CustomerLayout;