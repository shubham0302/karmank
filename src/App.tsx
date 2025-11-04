// src/App.tsx
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppStore } from "@/store/appStore";
import { ReportProvider } from "@/context/ReportContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Eager-loaded pages (critical for initial render)
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Lazy-loaded pages (code splitting for better performance)
const AppShell = lazy(() => import("./pages/AppShell"));
const Welcome = lazy(() => import("./pages/Welcome"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Refund = lazy(() => import("./pages/Refund"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));
const ModulesStack = lazy(() => import("./pages/landing/ModulesStack"));

// App feature pages (lazy-loaded)
const NumerologyPage = lazy(() => import("./pages/app/NumerologyPage"));
const CompatibilityPage = lazy(() => import("./pages/app/CompatibilityPage"));
const NameAnalysisPage = lazy(() => import("./pages/app/NameAnalysisPage"));
const GitaGyanPage = lazy(() => import("./pages/app/GitaGyanPage"));

// Configure React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-cosmic-blue">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-auric-gold mx-auto"></div>
      <p className="text-stardust">Loading...</p>
    </div>
  </div>
);

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAppStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Root redirect logic
const RootRedirect = () => {
  const { isAuthenticated } = useAppStore();
  return <Navigate to={isAuthenticated ? "/welcome" : "/login"} replace />;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ReportProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/refund" element={<Refund />} />
                <Route path="/return" element={<Refund />} />
                <Route path="/disclaimer" element={<Disclaimer />} />

                {/* Welcome Gateway */}
                <Route
                  path="/welcome"
                  element={
                    <ProtectedRoute>
                      <Welcome />
                    </ProtectedRoute>
                  }
                />

                {/* Optional modules list page */}
                <Route
                  path="/modules"
                  element={
                    <ProtectedRoute>
                      <ModulesStack />
                    </ProtectedRoute>
                  }
                />

                {/* Legacy redirects */}
                <Route path="/numerology" element={<Navigate to="/app/numerology" replace />} />
                <Route path="/name-analysis" element={<Navigate to="/app/name-analysis" replace />} />
                <Route path="/compatibility" element={<Navigate to="/app/compatibility" replace />} />
                <Route path="/gita-gyan" element={<Navigate to="/app/gita-gyan" replace />} />

                {/* Main App Shell with nested routes */}
                <Route
                  path="/app"
                  element={
                    <ProtectedRoute>
                      <AppShell />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="numerology" replace />} />
                  <Route path="numerology" element={<NumerologyPage />} />
                  <Route path="compatibility" element={<CompatibilityPage />} />
                  <Route path="name-analysis" element={<NameAnalysisPage />} />
                  <Route path="gita-gyan" element={<GitaGyanPage />} />
                </Route>

                {/* Galaxy placeholder */}
                <Route
                  path="/galaxy"
                  element={
                    <ProtectedRoute>
                      <div className="min-h-screen flex items-center justify-center">
                        <h1 className="text-4xl font-serif text-white">🌌 Akash Ganga - Coming Soon</h1>
                      </div>
                    </ProtectedRoute>
                  }
                />
                <Route path="/akash-ganga" element={<Navigate to="/galaxy" replace />} />

                {/* Root → dynamic */}
                <Route path="/" element={<RootRedirect />} />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ReportProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
