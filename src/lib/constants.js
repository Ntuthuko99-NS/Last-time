export const PROVINCES = [
  { value: "gauteng", label: "Gauteng" },
  { value: "western_cape", label: "Western Cape" },
  { value: "kwazulu_natal", label: "KwaZulu-Natal" },
  { value: "eastern_cape", label: "Eastern Cape" },
  { value: "free_state", label: "Free State" },
  { value: "limpopo", label: "Limpopo" },
  { value: "mpumalanga", label: "Mpumalanga" },
  { value: "north_west", label: "North West" },
  { value: "northern_cape", label: "Northern Cape" },
];

export const PRODUCT_CATEGORIES = [
  { value: "electronics", label: "Electronics", icon: "Smartphone" },
  { value: "furniture", label: "Furniture", icon: "Sofa" },
  { value: "clothing", label: "Clothing", icon: "Shirt" },
  { value: "books", label: "Books", icon: "BookOpen" },
  { value: "vehicles", label: "Vehicles", icon: "Car" },
  { value: "home_garden", label: "Home & Garden", icon: "Home" },
  { value: "sports", label: "Sports", icon: "Dumbbell" },
  { value: "toys", label: "Toys & Games", icon: "Gamepad2" },
  { value: "other", label: "Other", icon: "Package" },
];

export const SERVICE_TYPES = [
  { value: "plumber", label: "Plumber" },
  { value: "electrician", label: "Electrician" },
  { value: "gardener", label: "Gardener" },
  { value: "cleaner", label: "Cleaner" },
  { value: "painter", label: "Painter" },
  { value: "handyman", label: "Handyman" },
  { value: "domestic_worker", label: "Domestic Worker" },
  { value: "carpenter", label: "Carpenter" },
  { value: "mechanic", label: "Mechanic" },
  { value: "tutor", label: "Tutor" },
  { value: "delivery", label: "Delivery" },
  { value: "other", label: "Other" },
];

export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "eft", label: "EFT" },
  { value: "payfast", label: "PayFast" },
  { value: "ozow", label: "Ozow" },
  { value: "snapscan", label: "SnapScan" },
];

export const DELIVERY_OPTIONS = [
  { value: "pickup", label: "Self Pickup" },
  { value: "local_delivery", label: "Local Delivery" },
  { value: "courier", label: "Courier" },
];

export function formatPrice(amount) {
  return `R${Number(amount).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`;
}

export function getProvinceLabel(value) {
  return PROVINCES.find(p => p.value === value)?.label || value;
}

export function getServiceTypeLabel(value) {
  return SERVICE_TYPES.find(s => s.value === value)?.label || value;
}

export function getCategoryLabel(value) {
  return PRODUCT_CATEGORIES.find(c => c.value === value)?.label || value;
}
