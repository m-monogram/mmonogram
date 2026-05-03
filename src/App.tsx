import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
// Simple loading fallback component
const PageLoader = () => (
  <div className="fixed inset-0 z-50 bg-premium-black flex items-center justify-center">
    <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-none animate-spin" />
  </div>
);

// Lazy load all pages for better performance
const HomePage = lazy(() => import("./pages/HomePage"));
const BrandPage = lazy(() => import("./pages/BrandPage"));
const ProjectsPage = lazy(() => import("./pages/ProjectsPage"));
const ProjectDetailPage = lazy(() => import("./pages/ProjectDetailPage"));
const ModificationsPage = lazy(() => import("./pages/ModificationsPage"));
const VerifyPage = lazy(() => import("./pages/VerifyPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const OfferAgreement = lazy(() => import("./pages/OfferAgreement"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));

// Admin pages
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProjects = lazy(() => import("./pages/admin/AdminProjects"));
const AdminSections = lazy(() => import("./pages/admin/AdminSections"));
const AdminSectionEditor = lazy(() => import("./pages/admin/AdminSectionEditor"));
const AdminNavigation = lazy(() => import("./pages/admin/AdminNavigation"));
const AdminMedia = lazy(() => import("./pages/admin/AdminMedia"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings"));
import AdminLayout from "./components/admin/AdminLayout";
import ProtectedRoute from "./components/admin/ProtectedRoute";

// Optimized QueryClient for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/brand" element={<BrandPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/commission" element={<ModificationsPage />} />
              <Route path="/modifications" element={<ModificationsPage />} />
              <Route path="/verify" element={<VerifyPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/offer-agreement" element={<OfferAgreement />} />
              {/* Admin routes */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="projects" element={<AdminProjects />} />
                <Route path="sections" element={<AdminSections />} />
                <Route path="sections/:id" element={<AdminSectionEditor />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="navigation" element={<AdminNavigation />} />
                <Route path="media" element={<AdminMedia />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="users" element={<ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
