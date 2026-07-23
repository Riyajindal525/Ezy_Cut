import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

// Public Pages
import Home from "../pages/public/Home";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";
import Salons from "../pages/public/Salons";
import SalonDetails from "../pages/public/SalonDetails";
import QueueTracker from "../pages/public/QueueTracker";
import Terms from "../pages/public/Terms";

// Customer Pages
import Booking from "../pages/public/Booking";
import MyBookings from "../pages/customer/MyBookings";
import PaymentHistory from "../pages/customer/PaymentHistory";
import MyReviews from "../pages/customer/MyReviews";
import Notifications from "../pages/customer/Notifications";
import MyQueue from "../pages/customer/MyQueue";
import Profile from "../pages/customer/Profile";
import CustomerDashboard from "../pages/customer/Dashboard";
import AiMentor from "../pages/AI-Mentor/AiMentor"

// Owner Pages
import OwnerDashboard from "../pages/owner/Dashboard";
import OwnerBookings from "../pages/owner/Bookings";
import OwnerServices from "../pages/owner/Services";
import OwnerQueue from "../pages/owner/Queue";
import OwnerPayments from "../pages/owner/Payments";
import OwnerSalonProfile from "../pages/owner/SalonProfile";

// Admin Pages
import AdminDashboard from "../pages/admin/Dashboard";
import AdminSalons from "../pages/admin/Salons";
import AdminUsers from "../pages/admin/Users";
import AdminPayments from "../pages/admin/Payments";
import AdminAnalytics from "../pages/admin/Analytics";
import AdminKYC from "../pages/admin/KYC";
import AdminRefundRequests from "../pages/admin/RefundRequests";

// Layouts & Guards
import ProtectedRoute from "../components/common/ProtectedRoute";
import CustomerLayout from "../components/layout/CustomerLayout";
import OwnerLayout from "../components/layout/OwnerLayout";
import AdminLayout from "../components/layout/AdminLayout";
import AboutUs from "../pages/public/AboutUs";
import PartnerWithUs from "../pages/public/PartnerWithUs";
import PolicyPages from "../pages/public/PolicyPages";
import Sitemap from "../pages/public/Sitemap";
import GoogleAnalytics from "../components/common/GoogleAnalytics";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      {/* GA4 page-view tracker — fires on every React Router navigation */}
      <GoogleAnalytics />
      <Routes>
        {/* Public Routes with CustomerLayout (Navbar & Footer) */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/salons" element={<Salons />} />
          <Route path="/salons/:id" element={<SalonDetails />} />
          <Route path="/track" element={<QueueTracker />} />
          <Route path="/track/:tokenCode" element={<QueueTracker />} />
          <Route path="/about" element={<AboutUs />} />
         <Route path="/partner-with-us" element={<PartnerWithUs />} />   
          <Route path="/terms" element={<Terms />} />
          <Route path="/policy" element={<PolicyPages />} />
          <Route path="/sitemap" element={<Sitemap />}/>
        </Route>

        {/* Auth routes (no Navbar/Footer layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Customer Routes */}
        <Route element={<ProtectedRoute allowedRoles={["customer", "admin"]} />}>
          <Route element={<CustomerLayout />}>
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/booking/:serviceId" element={<Booking />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/payment-history" element={<PaymentHistory />} />
            <Route path="/my-reviews" element={<MyReviews />} />
            <Route path="/my-queue" element={<MyQueue />} />
              <Route path="/ai-mentor" element={<AiMentor />} />
          </Route>
        </Route>

        {/* Shared Authenticated Routes — accessible by all logged-in roles */}
        <Route element={<ProtectedRoute allowedRoles={["customer", "salon_owner", "admin"]} />}>
          <Route element={<CustomerLayout />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>
        </Route>

        {/* Protected Owner Routes */}
        <Route element={<ProtectedRoute allowedRoles={["salon_owner", "admin"]} />}>
          <Route element={<OwnerLayout />}>
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            <Route path="/owner/bookings" element={<OwnerBookings />} />
            <Route path="/owner/services" element={<OwnerServices />} />
            <Route path="/owner/queue" element={<OwnerQueue />} />
            <Route path="/owner/payments" element={<OwnerPayments />} />
            <Route path="/owner/salon" element={<OwnerSalonProfile />} />
            <Route path="/owner/profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/salons" element={<AdminSalons />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/kyc" element={<AdminKYC />} />
            <Route path="/admin/refund-requests" element={<AdminRefundRequests />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;