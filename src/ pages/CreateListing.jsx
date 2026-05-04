import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Wrench, Upload, X } from "lucide-react";
import {
  PRODUCT_CATEGORIES,
  SERVICE_TYPES,
  PROVINCES,
  PAYMENT_METHODS,
  DELIVERY_OPTIONS,
} from "@/lib/constants";

/**
 * Replace this with your real backend (Supabase / Firebase / API)
 */
const api = {
  getCurrentUser: async () => {
    return JSON.parse(localStorage.getItem("user"));
  },

  uploadFile: async (file) => {
    // Replace with real upload logic
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    return res.json(); // { file_url }
  },

  createProduct: async (data) => {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return res.json();
  },

  createService: async (data) => {
    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return res.json();
  },
};

export default function CreateListing() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("product");
  const [loading, setLoading] = useState(false);

  const [product, setProduct] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "good",
    province: "",
    city: "",
    delivery_options: [],
    payment_methods: [],
    images: [],
  });

  const [service, setService] = useState({
    title: "",
    description: "",
    service_type: "",
    price_range_min: "",
    price_range_max: "",
    province: "",
    city: "",
    availability: "flexible",
    experience_years: "",
    skills: "",
    payment_methods: [],
    images: [],
  });

  useEffect(() => {
    api.getCurrentUser().then(setUser).catch(() => {});
  }, []);

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const { file_url } = await api.uploadFile(file);

    if (type === "product") {
      setProduct((p) => ({
        ...p,
        images: [...p.images, file_url],
      }));
    } else {
      setService((s) => ({
        ...s,
        images: [...s.images, file_url],
      }));
    }
  };

  const removeImage = (type, index) => {
    if (type === "product") {
      setProduct((p) => ({
        ...p,
        images: p.images.filter((_, i) => i !== index),
      }));
    } else {
      setService((s) => ({
        ...s,
        images: s.images.filter((_, i) => i !== index),
      }));
    }
  };

  const toggleArray = (setter, field, value) => {
    setter((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  };

  const handleSubmitProduct = async () => {
    setLoading(true);

    await api.createProduct({
      ...product,
      price: Number(product.price),
      seller_name: user?.full_name,
      seller_email: user?.email,
      status: "active",
    });

    setLoading(false);
    navigate("/products");
  };

  const handleSubmitService = async () => {
    setLoading(true);

    await api.createService({
      ...service,
      price_range_min: service.price_range_min
        ? Number(service.price_range_min)
        : undefined,
      price_range_max: service.price_range_max
        ? Number(service.price_range_max)
        : undefined,
      experience_years: service.experience_years
        ? Number(service.experience_years)
        : undefined,
      skills: service.skills
        ? service.skills.split(",").map((s) => s.trim())
        : [],
      provider_name: user?.full_name,
      provider_email: user?.email,
      status: "active",
    });

    setLoading(false);
    navigate("/services");
  };

  return (
    <div className="pb-20 max-w-2xl mx-auto">
      <h1 className="font-heading font-bold text-2xl mb-6">
        Create Listing
      </h1>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="product" className="gap-2">
            <ShoppingBag className="w-4 h-4" /> Product
          </TabsTrigger>
          <TabsTrigger value="service" className="gap-2">
            <Wrench className="w-4 h-4" /> Service
          </TabsTrigger>
        </TabsList>

        {/* ================= PRODUCT ================= */}
        <TabsContent value="product">
          <Card>
            <CardHeader>
              <CardTitle>Sell a Product</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <InputField
                label="Title"
                value={product.title}
                onChange={(v) =>
                  setProduct({ ...product, title: v })
                }
              />

              <TextareaField
                label="Description"
                value={product.description}
                onChange={(v) =>
                  setProduct({ ...product, description: v })
                }
              />

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="Price"
                  type="number"
                  value={product.price}
                  onChange={(v) =>
                    setProduct({ ...product, price: v })
                  }
                />

                <SelectField
                  label="Category"
                  value={product.category}
                  onChange={(v) =>
                    setProduct({ ...product, category: v })
                  }
                  options={PRODUCT_CATEGORIES}
                />
              </div>

              <Button onClick={handleSubmitProduct} disabled={loading}>
                {loading ? "Posting..." : "List Product"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= SERVICE ================= */}
        <TabsContent value="service">
          <Card>
            <CardHeader>
              <CardTitle>Advertise a Service</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <InputField
                label="Title"
                value={service.title}
                onChange={(v) =>
                  setService({ ...service, title: v })
                }
              />

              <TextareaField
                label="Description"
                value={service.description}
                onChange={(v) =>
                  setService({ ...service, description: v })
                }
              />

              <Button onClick={handleSubmitService} disabled={loading}>
                {loading ? "Posting..." : "Advertise Service"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ================= Helper UI Components ================= */

const InputField = ({ label, value, onChange, type = "text" }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const TextareaField = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
