import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppStore } from "@/store/appStore";

// Simple guard. Uses store if you have isAuthenticated; otherwise falls back to a localStorage flag.
export default function ProtectedRoute() {
  const loc = useLocation();
  const storeAuthed = useAppStore?.((s) => (s as any).isAuthenticated) ?? false;
  const tokenAuthed = !!localStorage.getItem("karmank_auth"); // we'll set this in Step 3
  const isAuthed = storeAuthed || tokenAuthed;

  if (!isAuthed) return <Navigate to="/login" replace state={{ from: loc }} />;
  return <Outlet />;
}
