import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  User,
  ShoppingBag,
  Wrench,
  LogOut,
  MapPin,
  Save,
  Pencil,
  Trash2,
} from "lucide-react";
import { PROVINCES, getProvinceLabel } from "@/lib/constants";
import ListingCard from "@/components/shared/ListingCard";

/**
 * Replace with Supabase / Firebase / REST API
 */
const api = {
  getCurrentUser: async () => {
    return JSON.parse(localStorage.getItem("user"));
  },

  updateProfile: async (data) => {
    return fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  logout: async () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  getMyProducts: async (email) => {
    const res = await fetch(`/api/products?seller_email=${email}`);
    return res.json();
  },

  getMyServices: async (email) => {
    const res = await fetch(`/api/services?provider_email=${email}`);
    return res.json();
  },

  deleteProduct: async (id) => {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
  },

  deleteService: async (id) => {
    await fetch(`/api/services/${id}`, { method: "DELETE" });
  },
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);

  const [profileData, setProfileData] = useState({
    phone: "",
    province: "",
    city: "",
  });

  // Load user
  useEffect(() => {
    api.getCurrentUser().then((u) => {
      setUser(u);
      setProfileData({
        phone: u.phone || "",
        province: u.province || "",
        city: u.city || "",
      });
    });
  }, []);

  // My products
  const { data: myProducts = [] } = useQuery({
    queryKey: ["my-products", user?.email],
    queryFn: () => api.getMyProducts(user.email),
    enabled: !!user?.email,
  });

  // My services
  const { data: myServices = [] } = useQuery({
    queryKey: ["my-services", user?.email],
    queryFn: () => api.getMyServices(user.email),
    enabled: !!user?.email,
  });

  const saveProfile = async () => {
    await api.updateProfile(profileData);
    setEditing(false);
  };

  const handleLogout = async () => {
    await api.logout();
  };

  const removeProduct = async (id) => {
    await api.deleteProduct(id);
    window.location.reload();
  };

  const removeService = async (id) => {
    await api.deleteService(id);
    window.location.reload();
  };

  if (!user) return null;

  return (
    <div className="pb-20 max-w-4xl mx-auto">

      {/* ================= PROFILE CARD ================= */}
      <Card className="mb-8">
        <CardContent className="p-6">

          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>

            <div className="flex-1">
              <h1 className="font-bold text-xl">{user.full_name}</h1>
              <p className="text-sm text-muted-foreground">
                {user.email}
              </p>

              {(profileData.province || user.province) && (
                <p className="text-sm flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {profileData.city
                    ? `${profileData.city}, `
                    : ""}
                  {getProvinceLabel(
                    profileData.province || user.province
                  )}
                </p>
              )}

              {/* EDIT MODE */}
              {editing ? (
                <div className="mt-4 space-y-3">

                  <Input
                    placeholder="Phone"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        phone: e.target.value,
                      })
                    }
                  />

                  <Select
                    value={profileData.province}
                    onValueChange={(v) =>
                      setProfileData({
                        ...profileData,
                        province: v,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Province" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVINCES.map((p) => (
                        <SelectItem
                          key={p.value}
                          value={p.value}
                        >
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="City"
                    value={profileData.city}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        city: e.target.value,
                      })
                    }
                  />

                  <div className="flex gap-2">
                    <Button onClick={saveProfile}>
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    onClick={() => setEditing(true)}
                  >
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>

        </CardContent>
      </Card>

      {/* ================= LISTINGS ================= */}
      <Tabs defaultValue="products">

        <TabsList>
          <TabsTrigger value="products">
            My Products ({myProducts.length})
          </TabsTrigger>

          <TabsTrigger value="services">
            My Services ({myServices.length})
          </TabsTrigger>
        </TabsList>

        {/* PRODUCTS */}
        <TabsContent value="products">
          {myProducts.length ? (
            <div className="grid md:grid-cols-3 gap-4">
              {myProducts.map((p) => (
                <div key={p.id} className="relative group">
                  <ListingCard item={p} type="product" />

                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                    onClick={() => removeProduct(p.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No products yet
            </p>
          )}
        </TabsContent>

        {/* SERVICES */}
        <TabsContent value="services">
          {myServices.length ? (
            <div className="grid md:grid-cols-3 gap-4">
              {myServices.map((s) => (
                <div key={s.id} className="relative group">
                  <ListingCard item={s} type="service" />

                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                    onClick={() => removeService(s.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No services yet
            </p>
          )}
        </TabsContent>

      </Tabs>
    </div>
  );
}
