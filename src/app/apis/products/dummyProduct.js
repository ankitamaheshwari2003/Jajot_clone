

export const rawDummyProduct = {
  productName: "Titan Neo Analog Watch",
  itemName: "Titan Neo Analog Watch for Men",
  productUrl: "titan-neo-analog-watch-men",
  categoryId: "6a509c70a781e80ab7911079",
  vendorId: "6a462754c6c08add7b774f63",
  brandName: "Titan",
  sku: "TITAN-NEO",

  description: {
    productDescription:
    "Titan Neo Analog Watch for Men with premium stainless steel strap, quartz movement, mineral glass protection, and water resistance. Perfect for formal and casual occasions.",

    bulletPoints: [
    "Quartz Analog Movement",
    "Premium Stainless Steel Strap",
    "Round Dial",
    "Mineral Glass Protection",
    "30M Water Resistant",
    "Date Display",
    "2 Years Manufacturer Warranty",
    "Suitable for Daily Wear"]

  },

  images: [
  "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?q=80&w=1200&auto=format&fit=crop"],


  isActive: true,
  status: "draft",

  tags: ["watch", "titan", "analog", "men", "fashion"],

  attributes: [
  {
    name: "Brand",
    code: "brand",
    value: "Titan",
    type: "dropdown",
    unit: ""
  },
  {
    name: "Model",
    code: "model",
    value: "Neo",
    type: "text",
    unit: ""
  },
  {
    name: "Gender",
    code: "gender",
    value: "Men",
    type: "dropdown",
    unit: ""
  },
  {
    name: "Display Type",
    code: "display_type",
    value: "Analog",
    type: "dropdown",
    unit: ""
  },
  {
    name: "Movement",
    code: "movement",
    value: "Quartz",
    type: "dropdown",
    unit: ""
  },
  {
    name: "Case Material",
    code: "case_material",
    value: "Stainless Steel",
    type: "dropdown",
    unit: ""
  },
  {
    name: "Strap Material",
    code: "strap_material",
    value: "Stainless Steel",
    type: "dropdown",
    unit: ""
  },
  {
    name: "Dial Shape",
    code: "dial_shape",
    value: "Round",
    type: "dropdown",
    unit: ""
  },
  {
    name: "Dial Size",
    code: "dial_size",
    value: "42",
    type: "number",
    unit: "mm"
  },
  {
    name: "Water Resistance",
    code: "water_resistance",
    value: "30",
    type: "number",
    unit: "m"
  },
  {
    name: "Warranty",
    code: "warranty",
    value: "2 Years",
    type: "text",
    unit: ""
  }],


  variants: [
  {
    sku: "TITAN-NEO-SLV",
    productUrl: "titan-neo-analog-watch-silver",
    mrp: 4999,
    sellingPrice: 4499,
    salePrice: 3999,
    handlingTime: 2,
    itemCondition: "New",

    images: [
    "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=1200&auto=format&fit=crop"],


    attributes: [
    {
      name: "Color",
      code: "color",
      value: "Silver"
    }],


    description: {
      productDescription:
      "Silver variant classic stainless steel finish ke saath aata hai, jo formal aur office wear ke liye perfect hai.",

      bulletPoints: [
      "Silver Stainless Steel Finish",
      "Quartz Analog Movement",
      "Round Dial with Mineral Glass",
      "30M Water Resistant",
      "Best suited for Formal Wear"]

    },

    inventory: {
      stock: 20,
      maxQty: 3,
      isActive: true
    }
  },

  {
    sku: "TITAN-NEO-GLD",
    productUrl: "titan-neo-analog-watch-gold",
    mrp: 5499,
    sellingPrice: 4999,
    salePrice: 4699,
    handlingTime: 2,
    itemCondition: "New",

    images: [
    "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=1200&auto=format&fit=crop"],


    attributes: [
    {
      name: "Color",
      code: "color",
      value: "Gold"
    }],


    description: {
      productDescription:
      "Gold variant ek premium aur royal look deta hai, jo festive aur special occasions ke liye ideal hai.",

      bulletPoints: [
      "Premium Gold-Tone Finish",
      "Quartz Analog Movement",
      "Round Dial with Mineral Glass",
      "30M Water Resistant",
      "Great for Festive and Special Occasions"]

    },

    inventory: {
      stock: 15,
      maxQty: 3,
      isActive: true
    }
  },

  {
    sku: "TITAN-NEO-RGD",
    productUrl: "titan-neo-analog-watch-rose-gold",
    mrp: 5999,
    sellingPrice: 5499,
    salePrice: 5199,
    handlingTime: 3,
    itemCondition: "New",

    images: [
    "https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?q=80&w=1200&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=1200&auto=format&fit=crop"],


    attributes: [
    {
      name: "Color",
      code: "color",
      value: "Rose Gold"
    }],


    description: {
      productDescription:
      "Rose Gold variant modern aur trendy look ke liye best hai, jo casual aur party wear dono mein achha lagta hai.",

      bulletPoints: [
      "Trendy Rose Gold Finish",
      "Quartz Analog Movement",
      "Round Dial with Mineral Glass",
      "30M Water Resistant",
      "Perfect for Casual and Party Wear"]

    },

    inventory: {
      stock: 10,
      maxQty: 3,
      isActive: true
    }
  }]

};

function getAttributeValue(attributes, code) {
  if (!Array.isArray(attributes)) return "";

  const normalizedCode = String(code || "").toLowerCase();

  return (
    attributes.find((attribute) => {
      const attributeCode = String(attribute?.code || "").toLowerCase();
      const attributeName = String(attribute?.name || "").toLowerCase();

      return (
        attributeCode === normalizedCode ||
        attributeName === normalizedCode);

    })?.value || "");

}

export function normalizeDummyProduct(raw) {
  if (!raw) return null;

  const variants = (raw.variants || []).map((variant, index) => {
    const color = getAttributeValue(variant.attributes, "color");
    const size = getAttributeValue(variant.attributes, "size");

    const price =
    variant.salePrice ??
    variant.sellingPrice ??
    variant.price ??
    variant.mrp ??
    0;

    return {
      ...variant,

      _id: variant._id || variant.id || variant.sku || `dummy-variant-${index}`,

      id: variant.id || variant._id || variant.sku || `dummy-variant-${index}`,

      color,
      size,

      price: Number(price),
      sellingPrice: Number(price),
      mrp: Number(variant.mrp || 0),

      stock: variant.inventory?.stock ?? 0,

      maxQuantity:
      variant.inventory?.maxQty ??
      variant.maxQuantity ??
      null,

      images: Array.isArray(variant.images) ? variant.images : [],

      attributes: Array.isArray(variant.attributes) ?
      variant.attributes :
      [],

      description: variant.description || null,

      vendorId: variant.vendorId || raw.vendorId || null
    };
  });

  const firstVariant = variants[0] || null;

  return {
    ...raw,

    id:
    raw._id ||
    raw.id ||
    raw.productUrl ||
    raw.sku ||
    "dummy-titan-neo",

    _id:
    raw._id ||
    raw.id ||
    raw.productUrl ||
    raw.sku ||
    "dummy-titan-neo",

    name:
    raw.productName ||
    raw.itemName ||
    raw.name ||
    "Product",

    brand:
    raw.brandName ||
    raw.brand ||
    getAttributeValue(raw.attributes, "brand"),

    vendorId: raw.vendorId || null,

    images: Array.isArray(raw.images) ? raw.images : [],

    thumbnailImage:
    raw.thumbnailImage ||
    raw.images?.[0] ||
    firstVariant?.images?.[0] ||
    "",

    attributes: Array.isArray(raw.attributes) ?
    raw.attributes :
    [],

    description: raw.description || null,

    variants,

    defaultVariant: firstVariant,

    price: firstVariant?.price || 0,

    sellingPrice: firstVariant?.sellingPrice || 0,

    mrp: firstVariant?.mrp || 0,

    stock: firstVariant?.stock ?? null,

    maxQuantity: firstVariant?.maxQuantity ?? null
  };
}

export const dummyProduct = normalizeDummyProduct(rawDummyProduct);
