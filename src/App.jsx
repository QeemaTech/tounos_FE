import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './hooks/useAuth';
import AdminLayout from './layouts/AdminLayout';
import { Toaster } from 'react-hot-toast';


import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import MembersPage from './pages/members/MembersPage';
import AddMemberPage from './pages/members/AddMemberPage';
import MemberDetailPage from './pages/members/MemberDetailPage';
import BookingsPage from './pages/bookings/BookingsPage';
import SubscriptionsPage from './pages/subscriptions/SubscriptionsPage';
import PaymentsPage from './pages/payments/PaymentsPage';
import ClassesPage from './pages/classes/ClassesPage';
import TrainersPage from './pages/trainers/TrainersPage';
import TherapistsPage from './pages/therapists/TherapistsPage';
import PackagesPage from './pages/packages/PackagesPage';
import ProductsPage from './pages/inventory/ProductsPage';
import PromoCodesPage from './pages/offers/PromoCodesPage';
import OrdersPage from './pages/orders/OrdersPage';
import FreezesPage from './pages/freezes/FreezesPage';
import SupportTicketsPage from './pages/support/SupportTicketsPage';
import TicketChatPage from './pages/support/TicketChatPage';
import BranchesPage from './pages/branches/BranchesPage';
import ReportsPage from './pages/reports/ReportsPage';
import SettingsPage from './pages/settings/SettingsPage';
import ServicesPage from './pages/services/ServicesPage';
import CategoriesPage from './pages/services/CategoriesPage';
import TrainerProfilePage from './pages/trainers/TrainerProfilePage';
import TherapistProfilePage from './pages/therapists/TherapistProfilePage';
import AdminsPage from './pages/admins/AdminsPage';
import AttendancePage from './pages/attendance/AttendancePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30000 },
  },
});

function AuthGuard({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function GuestGuard({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

/** Blocks branch-restricted admins from super-admin-only pages */
function SuperAdminGuard({ children }) {
  const { isSuperAdmin } = useAuth();
  if (!isSuperAdmin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" reverseOrder={false} />
          <Routes>
            <Route path="/login" element={<GuestGuard><LoginPage /></GuestGuard>} />

            <Route element={<AuthGuard><AdminLayout /></AuthGuard>}>
              <Route index element={<DashboardPage />} />
              
              {/* General */}
              <Route path="members">
                <Route index element={<MembersPage />} />
                <Route path="new" element={<AddMemberPage />} />
                <Route path=":id" element={<MemberDetailPage />} />
              </Route>
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="subscriptions" element={<SubscriptionsPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="attendance" element={<AttendancePage />} />

              {/* Catalog */}
              <Route path="services" element={<ServicesPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="classes" element={<ClassesPage />} />
              <Route path="trainers" element={<TrainersPage />} />
              <Route path="trainers/:trainerId" element={<TrainerProfilePage />} />
              <Route path="therapists" element={<TherapistsPage />} />
              <Route path="therapists/:therapistId" element={<TherapistProfilePage />} />
              <Route path="packages" element={<PackagesPage />} />

              {/* Commerce */}
              <Route path="products" element={<ProductsPage />} />
              <Route path="promo-codes" element={<PromoCodesPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="freezes" element={<FreezesPage />} />

              {/* System */}
              <Route path="support" element={<SupportTicketsPage />} />
              <Route path="support/:ticketId" element={<TicketChatPage />} />
              <Route path="branches" element={<SuperAdminGuard><BranchesPage /></SuperAdminGuard>} />
              <Route path="admins" element={<AdminsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
