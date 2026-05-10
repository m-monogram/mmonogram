import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import logoMmonogram from "@/assets/logo-mmonogram.webp";

// Premium branded loading fallback — large softly pulsing M-Monogram logo
const PageLoader = () => (
  <div className="fixed inset-0 z-50 bg-premium-black flex items-center justify-center">
    <img
      src={logoMmonogram}
      alt="M-Monogram"
      width={320}
      height={320}
      decoding="async"
      fetchPriority="high"
      className="w-56 sm:w-72 md:w-80 lg:w-96 max-w-[70vw] opacity-95 animate-logo-pulse will-change-[opacity,transform]"
    />
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
const RepresentativesPage = lazy(() => import("./pages/RepresentativesPage"));
const RepresentativeDetailPage = lazy(() => import("./pages/RepresentativeDetailPage"));
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
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const ProtectedRoute = lazy(() => import("./components/admin/ProtectedRoute"));

const App = () => (
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
              <Route path="/representatives" element={<RepresentativesPage />} />
              <Route path="/representatives/:id" element={<RepresentativeDetailPage />} />
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
);

export default App;
