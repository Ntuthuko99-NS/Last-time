import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
} from "@/components/ui/button";
import {
  Badge,
} from "@/components/ui/badge";
import {
  Input,
} from "@/components/ui/input";
import {
  Textarea,
} from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MapPin,
  MessageCircle,
  ArrowLeft,
  CreditCard,
  User,
  Calendar,
  Clock,
  CheckCircle,
} from "lucide-react";
import {
  formatPrice,
  getProvinceLabel,
  getServiceTypeLabel,
} from "@/lib/constants";
import StarRating from "@/components/shared/StarRating";

/**
 * Replace this with Supabase / Firebase / REST API
 */
const api = {
  getCurrentUser: async () =>
    JSON.parse(localStorage.getItem("user")),

  getService: async (id) => {
    const res = await fetch(`/api/services/${id}`);
    return res.json();
  },

  getReviews: async (id) => {
    const res = await fetch(
      `/api/reviews?target_id=${id}&target_type=service`
    );
    return res.json();
  },

  createBooking: async (data) => {
    return fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  createReview: async (data) => {
    return fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  sendMessage: async (data) => {
    return fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },
};

export default function ServiceDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [user, setUser] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  const [bookingData, setBookingData] = useState({
    date: "",
    time_slot: "",
    notes: "",
    price_agreed: "",
  });

  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    api.getCurrentUser().then(setUser);
  }, []);

  const { data: service } = useQuery({
    queryKey: ["service", id],
    queryFn: () => api.getService(id),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => api.getReviews(id),
  });

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length
      : 0;

  const createBooking = useMutation({
    mutationFn: () =>
      api.createBooking({
        service_id: id,
        service_title: service.title,
        provider_email: service.provider_email,
        provider_name: service.provider_name,
        customer_email: user.email,
        customer_name: user.full_name,
        ...bookingData,
        price_agreed: bookingData.price_agreed
          ? Number(bookingData.price_agreed)
          : undefined,
      }),
    onSuccess: () => {
      setBookingOpen(false);
      setBookingData({
        date: "",
        time_slot: "",
        notes: "",
        price_agreed: "",
      });
    },
  });

  const submitReview = useMutation({
    mutationFn: () =>
      api.createReview({
        target_id: id,
        target_type: "service",
        target_owner_email: service.provider_email,
        rating: newRating,
        comment: newComment,
        reviewer_name: user.full_name,
        reviewer_email: user.email,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["reviews", id]);
      setNewRating(0);
      setNewComment("");
    },
  });

  const startChat = async () => {
    if (!user || !service) return;

    const conversationId =
      [user.email, service.provider_email].sort().join("_") + "_" + id;

    await api.sendMessage({
      conversation_id: conversationId,
      sender_email: user.email,
      sender_name: user.full_name,
      receiver_email: service.provider_email,
      content: `Hi, I'm interested in your service: "${service.title}"`,
      listing_id: id,
      listing_type: "service",
      listing_title: service.title,
    });

    window.location.href = "/messages";
  };

  if (!service)
    return (
      <div className="text-center py-20 text-muted-foreground">
        Service not found
      </div>
    );

  const placeholder =
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80";

  return (
    <div className="pb-20 max-w-4xl mx-auto">

      {/* Back */}
      <Link
        to="/services"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Services
      </Link>

      <div className="grid md:grid-cols-2 gap-8">

        {/* IMAGE */}
        <div className="rounded-2xl overflow-hidden aspect-square bg-muted">
          <img
            src={service.images?.[0] || placeholder}
            className="w-full h-full object-cover"
            alt={service.title}
          />
        </div>

        {/* DETAILS */}
        <div className="space-y-6">

          <div>
            <Badge>
              {getServiceTypeLabel(service.service_type)}
            </Badge>

            {service.is_verified && (
              <Badge className="ml-2">Verified</Badge>
            )}

            <h1 className="text-3xl font-bold mt-2">
              {service.title}
            </h1>

            <p className="text-primary font-bold text-2xl mt-2">
              {service.price_range_min
                ? `${formatPrice(service.price_range_min)} – ${
                    service.price_range_max
                      ? formatPrice(service.price_range_max)
                      : "+"
                  }`
                : "Price Negotiable"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <StarRating rating={Math.round(avgRating)} />
            <span className="text-sm text-muted-foreground">
              ({reviews.length} reviews)
            </span>
          </div>

          <p className="text-muted-foreground">
            {service.description}
          </p>

          {/* LOCATION */}
          <p className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4" />
            {service.city}, {getProvinceLabel(service.province)}
          </p>

          {/* ACTIONS */}
          {user?.email !== service.provider_email && (
            <div className="flex gap-3">

              <Button onClick={startChat}>
                <MessageCircle className="w-4 h-4 mr-1" />
                Contact
              </Button>

              <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Calendar className="w-4 h-4 mr-1" />
                    Book
                  </Button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Book Service</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">

                    <Input
                      type="date"
                      value={bookingData.date}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          date: e.target.value,
                        })
                      }
                    />

                    <Input
                      placeholder="Time slot"
                      value={bookingData.time_slot}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          time_slot: e.target.value,
                        })
                      }
                    />

                    <Input
                      type="number"
                      placeholder="Price (optional)"
                      value={bookingData.price_agreed}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          price_agreed: e.target.value,
                        })
                      }
                    />

                    <Textarea
                      placeholder="Notes"
                      value={bookingData.notes}
                      onChange={(e) =>
                        setBookingData({
                          ...bookingData,
                          notes: e.target.value,
                        })
                      }
                    />

                    <Button
                      onClick={() => createBooking.mutate()}
                      disabled={!bookingData.date}
                    >
                      Confirm Booking
                    </Button>

                  </div>
                </DialogContent>
              </Dialog>

            </div>
          )}

        </div>
      </div>

      {/* REVIEWS */}
      <div className="mt-12">

        <h2 className="text-xl font-bold">Reviews</h2>

        {user?.email !== service.provider_email && (
          <div className="mt-4 space-y-3">

            <StarRating
              rating={newRating}
              onRate={setNewRating}
            />

            <Textarea
              placeholder="Write review..."
              value={newComment}
              onChange={(e) =>
                setNewComment(e.target.value)
              }
            />

            <Button
              onClick={() => submitReview.mutate()}
              disabled={!newRating}
            >
              Submit Review
            </Button>

          </div>
        )}

        <div className="mt-6 space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="border p-4 rounded-xl">

              <p className="font-medium">
                {r.reviewer_name}
              </p>

              <StarRating rating={r.rating} />

              <p className="text-sm text-muted-foreground">
                {r.comment}
              </p>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
