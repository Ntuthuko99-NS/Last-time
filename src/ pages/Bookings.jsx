import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, User, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { formatPrice } from "@/lib/constants";
import EmptyState from "@/components/shared/EmptyState";

/**
 * Replace these with your real backend (Supabase, Firebase, REST API, etc.)
 */
const api = {
  getCurrentUser: async () => {
    // Example: fetch("/api/auth/me")
    return JSON.parse(localStorage.getItem("user"));
  },

  getCustomerBookings: async (email) => {
    const res = await fetch(`/api/bookings?customer_email=${email}`);
    return res.json();
  },

  getProviderBookings: async (email) => {
    const res = await fetch(`/api/bookings?provider_email=${email}`);
    return res.json();
  },

  updateBookingStatus: async ({ id, status }) => {
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    return res.json();
  },
};

const statusConfig = {
  pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Pending" },
  confirmed: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "Confirmed" },
  completed: { color: "bg-green-100 text-green-800 border-green-200", label: "Completed" },
  cancelled: { color: "bg-red-100 text-red-800 border-red-200", label: "Cancelled" },
};

export default function Bookings() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("customer");
  const queryClient = useQueryClient();

  // Load user
  useEffect(() => {
    api.getCurrentUser().then(setUser).catch(() => {});
  }, []);

  // Customer bookings
  const { data: customerBookings = [], isLoading: loadingCustomer } = useQuery({
    queryKey: ["customer-bookings", user?.email],
    queryFn: () => api.getCustomerBookings(user.email),
    enabled: !!user?.email,
  });

  // Provider bookings
  const { data: providerBookings = [], isLoading: loadingProvider } = useQuery({
    queryKey: ["provider-bookings", user?.email],
    queryFn: () => api.getProviderBookings(user.email),
    enabled: !!user?.email,
  });

  // Update booking status
  const updateStatus = useMutation({
    mutationFn: api.updateBookingStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["provider-bookings"] });
    },
  });

  const bookings = view === "customer" ? customerBookings : providerBookings;
  const isLoading = view === "customer" ? loadingCustomer : loadingProvider;

  if (!user) return null;

  return (
    <div className="pb-20">
      <h1 className="font-heading font-bold text-2xl mb-6">Bookings</h1>

      {/* Tabs */}
      <Tabs value={view} onValueChange={setView} className="mb-6">
        <TabsList>
          <TabsTrigger value="customer">My Bookings</TabsTrigger>
          <TabsTrigger value="provider">Service Requests</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Loading */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const status = statusConfig[booking.status] || statusConfig.pending;

            return (
              <Card key={booking.id} className="p-5">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  
                  {/* Booking Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{booking.service_title}</h3>
                      <Badge className={`${status.color} border text-xs`}>
                        {status.label}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {booking.date
                          ? format(new Date(booking.date), "dd MMM yyyy")
                          : "TBD"}
                      </span>

                      {booking.time_slot && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {booking.time_slot}
                        </span>
                      )}

                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {view === "customer"
                          ? booking.provider_name
                          : booking.customer_name}
                      </span>

                      {booking.price_agreed && (
                        <span className="font-medium text-foreground">
                          {formatPrice(booking.price_agreed)}
                        </span>
                      )}
                    </div>

                    {booking.notes && (
                      <p className="text-sm text-muted-foreground">
                        {booking.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    
                    {/* Provider actions */}
                    {view === "provider" && booking.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 gap-1"
                          onClick={() =>
                            updateStatus.mutate({
                              id: booking.id,
                              status: "confirmed",
                            })
                          }
                        >
                          <CheckCircle className="w-4 h-4" /> Accept
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 gap-1"
                          onClick={() =>
                            updateStatus.mutate({
                              id: booking.id,
                              status: "cancelled",
                            })
                          }
                        >
                          <XCircle className="w-4 h-4" /> Decline
                        </Button>
                      </>
                    )}

                    {view === "provider" && booking.status === "confirmed" && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 gap-1"
                        onClick={() =>
                          updateStatus.mutate({
                            id: booking.id,
                            status: "completed",
                          })
                        }
                      >
                        <CheckCircle className="w-4 h-4" /> Complete
                      </Button>
                    )}

                    {/* Customer cancel */}
                    {view === "customer" && booking.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 gap-1"
                        onClick={() =>
                          updateStatus.mutate({
                            id: booking.id,
                            status: "cancelled",
                          })
                        }
                      >
                        <XCircle className="w-4 h-4" /> Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Calendar}
          title={
            view === "customer"
              ? "No bookings yet"
              : "No service requests yet"
          }
          description={
            view === "customer"
              ? "Book a service to get started"
              : "Your bookings from customers will appear here"
          }
          actionLabel={view === "customer" ? "Find Services" : undefined}
          actionLink={view === "customer" ? "/services" : undefined}
        />
      )}
    </div>
  );
}
