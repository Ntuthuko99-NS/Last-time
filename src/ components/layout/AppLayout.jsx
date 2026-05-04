import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Home, ShoppingBag, Wrench, MessageCircle, Calendar,
  User, Plus, Menu, X, LogOut
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Navigation links
const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/products", label: "Products", icon: ShoppingBag },
  { path: "/services", label: "Services", icon: Wrench },
  { path: "/messages", label: "Messages", icon: MessageCircle },
  { path: "/bookings", label: "Bookings", icon: Calendar },
  { path: "/profile", label: "Profile", icon: User },
];

export default function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const location = useLocation();

  // Simulate fetching logged-in user
  useEffect(() => {
    // Replace this with your real API later
    const fakeUser = {
      name: "Ntuthuko Mngomezulu",
      email: "Ntuthuko@example.com"
    };

    setUser(fakeUser);
  }, []);

  // Simulate fetching unread messages
  useEffect(() => {
    if (!user) return;

    // Replace with real API call
    const fakeUnreadMessages = 3;
    setUnreadCount(fakeUnreadMessages);

  }, [user]);

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    alert("Logged out");
  };

  return (
    <div className="min-h-screen bg-background">

      {/* ===== TOP NAVBAR ===== */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">LocalMarket</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-2">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={location.pathname === item.path ? "secondary" : "ghost"}
                  size="sm"
                  className="relative flex items-center gap-2"
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}

                  {/* Message Badge */}
                  {item.label === "Messages" && unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2">

            {/* Add Listing */}
            <Link to="/create-listing">
              <Button size="sm" className="flex gap-1">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">List Item</span>
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </header>

      {/* ===== MOBILE MENU ===== */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-white z-40">
          <nav className="p-4 space-y-2">

            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button className="w-full flex justify-start gap-3">
                  <item.icon className="w-5 h-5" />
                  {item.label}

                  {item.label === "Messages" && unreadCount > 0 && (
                    <Badge className="ml-auto">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            ))}

            {/* Logout */}
            <Button
              onClick={handleLogout}
              className="w-full flex justify-start gap-3 text-red-500"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Button>

          </nav>
        </div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <main className="max-w-7xl mx-auto p-4">
        <Outlet />
      </main>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="flex justify-around h-14 items-center">

          {navItems.slice(0, 5).map((item) => (
            <Link key={item.path} to={item.path} className="relative">
              <Button variant="ghost" size="icon">
                <item.icon className="w-5 h-5" />

                {item.label === "Messages" && unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </Link>
          ))}

        </div>
      </nav>

    </div>
  );
}
