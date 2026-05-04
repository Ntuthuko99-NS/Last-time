import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.substring(1);

  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setIsAuthenticated(false);
          setIsLoaded(true);
          return;
        }

        const res = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Not authenticated");

        const data = await res.json();

        setUser(data);
        setIsAuthenticated(true);
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoaded(true);
      }
    };

    checkUser();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full">
        <div className="text-center space-y-6">

          {/* 404 */}
          <div>
            <h1 className="text-7xl text-slate-300">404</h1>
            <div className="h-0.5 w-16 bg-slate-200 mx-auto mt-2"></div>
          </div>

          {/* Message */}
          <div>
            <h2 className="text-2xl text-slate-800">Page Not Found</h2>
            <p className="text-slate-600 mt-2">
              The page <span className="font-medium">"{pageName}"</span> does not exist.
            </p>
          </div>

          {/* Admin Message */}
          {isLoaded && isAuthenticated && user?.role === "admin" && (
            <div className="mt-6 p-4 bg-slate-100 border rounded">
              <p className="text-sm font-medium">Admin Note</p>
              <p className="text-sm text-slate-600">
                This page has not been created yet. You can implement it.
              </p>
            </div>
          )}

          {/* Button */}
          <div className="pt-4">
            <button
              onClick={() => (window.location.href = "/")}
              className="px-4 py-2 border rounded hover:bg-slate-100"
            >
              Go Home
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
