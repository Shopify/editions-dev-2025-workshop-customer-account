type WishlistItem = {
  productId: string;
};

type ProductImage = {
  url: string;
};

type Product = {
  id: string;
  title: string;
  handle: string;
  priceRange: {
    minVariantPrice: {
      amount: number;
      currencyCode: string;
    };
    maxVariantPrice: {
      amount: number;
      currencyCode: string;
    };
  };
  images: {
    nodes: ProductImage[];
  };
};

type Shop = {
  url: string;
};

export type { WishlistItem, Product, Shop };
