import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function Home() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
  if (isAuthenticated) {
    setLocation("/tickets");
  } else {
    // window.location.href = getLoginUrl();
    setLocation("/tickets");
  }
}
  }, [isAuthenticated, loading, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Cargando...</p>
      </div>
    </div>
  );
}
