import React, { useState, useEffect } from "react";
import { getProducts } from "@/services/products";
import  ProductCard  from "./ProductCard";

export default function BestSellers() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBestSellers = async () => {
            try {
                // Fetch only 6 Hot products
                const data = await getProducts({ badge: 'Hot', limit: 6 });
                setProducts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBestSellers();
    }, []);

    if (error) {
        return (
            <div className="py-12 text-center text-red-500">
                <p>Failed to load best sellers: {error}</p>
            </div>
        );
    }

    return (
        <section className="w-full px-4 py-12 md:px-8 lg:px-12">
            <div className="mb-8 flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Best Sellers</h2>
                {/* The link to browse the full collection page */}
                <a href="/category/best-sellers" className="text-sm font-medium text-primary hover:underline">
                    Browse all &rarr;
                </a>
            </div>

            {/* Changed lg:grid-cols-4 to lg:grid-cols-5 so all 5 items fit in one row on large screens */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 justify-items-center">
                
                {isLoading && (
                    [...Array(5)].map((_, index) => (
                        <div 
                            key={`skeleton-${index}`} 
                            className="h-105 w-full max-w-[320px] animate-pulse rounded-xl bg-muted"
                        />
                    ))
                )}

                {!isLoading && products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}

            </div>
        </section>
    );
}