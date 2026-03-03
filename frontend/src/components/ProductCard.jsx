import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import {
    Card,
    CardContent,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProductCard({ product }) {
    // Safely grab the first image and handle your relative/absolute URL logic
    const firstImage = product?.images?.[0] || 'placeholder.png';
    const imageUrl = product?.imageUrls?.[0] || firstImage; // Try presigned URL first, fallback to key
  

    // Ensure prices are formatted to 2 decimal places so "899.99" renders correctly
    const price = parseFloat(product?.price || 0).toFixed(2);
    const salePrice = product?.salePrice ? parseFloat(product.salePrice).toFixed(2) : null;

    return (
        <Card className="w-full max-w-[320px] flex flex-col">
            <CardContent className="flex flex-col flex-1 p-4">
                {/* Product Image */}
                <div className="relative mb-6">
                    <div className="bg-muted rounded-2xl flex items-center justify-center h-70 relative overflow-hidden">
                        <img
                            src={imageUrl}
                            alt={product?.name || "Product image"}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />

                    </div>
                </div>

                {/* Product Info */}
                <div className="mb-4">
                    <CardTitle className="text-xl leading-tight mb-2 ">
                        {product?.name}
                    </CardTitle>
                    <CardDescription className="text-sm line-clamp-3">
                        {product?.description}
                    </CardDescription>
                </div>

                {/* Price and Action Row */}
                <div className="flex flex-col gap-4 mt-auto pt-2">
                    <div className="flex items-baseline gap-2">
                        {/* Inline Pricing Logic matching your reference image */}
                        {salePrice ? (
                            <>
                                <span className="text-lg font-medium text-muted-foreground line-through">
                                    ${price}
                                </span>
                                <span className="text-xl font-bold">
                                    ${salePrice}
                                </span>
                            </>
                        ) : (
                            <span className="text-xl font-bold">
                                ${price}
                            </span>
                        )}
                    </div>

                    <Button size="lg" className="w-full rounded-full font-semibold" onClick={() => console.log(`Adding ${product?.name} to cart`)}>
                        Add to Cart
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}