import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  MapPin,
  MessageCircle,
  ArrowLeft,
  Truck,
  CreditCard,
  User,
} from "lucide-react";
import { formatPrice, getProvinceLabel, getCategoryLabel } from "@/lib/constants";
import StarRating from "@/components/shared/StarRating";

/**
 * Replace this with your real backend (Supabase / Firebase / API)
 */
const api = {
  getCurrentUser: async () => {
    return JSON.parse(localStorage.getItem("user"));
  },

  getProduct: async (id) => {
    const res = await fetch(`/api/products/${id}`);
    return res.json();
  },

  getReviews: async (id) => {
    const res = await fetch(
      `/api/reviews?target_id=${id}&target_type=product`
    );
    return res.json();
  },

  createReview: async (data) => {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  createMessage: async (data) => {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};

export default function ProductDetail() {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");

  const queryClient = useQueryClient();

  // Load user
  useEffect(() => {
    api.getCurrentUser().then(setUser).catch(() => {});
  }, []);

  // Load product
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => api.getProduct(id),
  });

  // Load reviews
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => api.getReviews(id),
  });

  // Average rating
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  /**
   * Submit review
   */
  const submitReview = useMutation({
    mutationFn: () =>
      api.createReview({
        target_id: id,
        target_type: "product",
        target_owner_email: product?.seller_email,
        rating: newRating,
        comment: newComment,
        reviewer_name: user?.full_name,
        reviewer_email: user?.email,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries(["reviews", id]);
      setNewRating(0);
      setNewComment("");
    },
  });

  /**
   * Start chat with seller
   */
  const startChat = async () => {
    if (!user || !product) return;

    const conversationId =
      [user.email, product.seller_email].sort().join("_") +
      "_" +
      id;

    await api.createMessage({
      conversation_id: conversationId,
      sender_email: user.email,
      sender_name: user.full_name,
      receiver_email: product.seller_email,
      content: `Hi, I'm interested in your listing: "${product.title}"`,
      listing_id: id,
      listing_type: "product",
      listing_title: product.title,
    });

    window.location.href = "/messages";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Product not found
      </div>
    );
  }

  const placeholderImage =
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80";

  return (
    <div className="pb-20 max-w-4xl mx-auto">

      {/* Back */}
      <Link
        to="/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-8">

        {/* Image */}
        <div className="rounded-2xl overflow-hidden bg-muted aspect-square">
          <img
            src={product.images?.[0] || placeholderImage}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details */}
        <div className="space-y-6">

          <div>
            <div className="flex gap-2 mb-2">
              <Badge>{getCategoryLabel(product.category)}</Badge>

              {product.condition && (
                <Badge variant="outline">
                  {product.condition.replace("_", " ")}
                </Badge>
              )}

              <Badge>{product.status}</Badge>
            </div>

            <h1 className="text-3xl font-bold">{product.title}</h1>

            <p className="text-2xl text-primary font-bold mt-2">
              {formatPrice(product.price)}
            </p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <StarRating rating={Math.round(avgRating)} />
            <span className="text-sm text-muted-foreground">
              ({reviews.length} reviews)
            </span>
          </div>

          {/* Description */}
          <p className="text-muted-foreground">
            {product.description}
          </p>

          {/* Location */}
          {product.province && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4" />
              {product.city}, {getProvinceLabel(product.province)}
            </div>
          )}

          {/* Seller */}
          <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
            <User className="w-5 h-5" />
            <div>
              <p className="text-sm font-medium">
                {product.seller_name || "Seller"}
              </p>
              <p className="text-xs text-muted-foreground">
                Verified seller
              </p>
            </div>
          </div>

          {/* Contact */}
          {user?.email !== product.seller_email && (
            <Button onClick={startChat} className="w-full gap-2">
              <MessageCircle className="w-4 h-4" />
              Contact Seller
            </Button>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-12 space-y-6">

        <h2 className="text-xl font-bold">Reviews</h2>

        {/* Add Review */}
        {user?.email !== product.seller_email && (
          <div className="p-4 border rounded-xl space-y-3">
            <StarRating rating={newRating} onRate={setNewRating} />

            <Textarea
              placeholder="Write a review..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />

            <Button
              onClick={() => submitReview.mutate()}
              disabled={!newRating}
            >
              Submit Review
            </Button>
          </div>
        )}

        {/* List Reviews */}
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="p-4 border rounded-xl">
                <p className="font-medium text-sm">
                  {r.reviewer_name || "Anonymous"}
                </p>
                <StarRating rating={r.rating} />
                {r.comment && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {r.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No reviews yet.
          </p>
        )}
      </div>
    </div>
  );
}
