import React, { useState, useEffect } from "react";
import { getProducts } from "@/services/products";
import  ProductCard  from "./ProductCard";

export default function OnSaleProducts() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSaleProducts = async () => {
            try {
                // Fetch up to 6 products with the 'Sale' badge for the homepage row
                const data = await getProducts({ badge: 'Sale', limit: 6 });
                setProducts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSaleProducts();
    }, []);

    if (error) {
        return (
            <div className="py-12 text-center text-red-500">
                <p>Failed to load sale items: {error}</p>
            </div>
        );
    }

    return (
        <section className="w-full px-4 py-12 md:px-8 lg:px-12">
            <div className="mb-8 flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">On Sale</h2>
                {/* Redirects to your dedicated sale browsing page */}
                <a href="/category/sale" className="text-sm font-medium text-primary hover:underline">
                    Browse all &rarr;
                </a>
            </div>

            {/* Exactly matches the edge-to-edge responsive grid from Best Sellers */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 justify-items-center">
                
                {isLoading && (
                    [...Array(6)].map((_, index) => (
                        <div 
                            key={`skeleton-${index}`} 
                            className={`h-105 w-full max-w-[320px] animate-pulse rounded-xl bg-muted 
                                ${index === 4 ? 'hidden xl:block' : ''} 
                                ${index === 5 ? 'hidden 2xl:block' : ''}`}
                        />
                    ))
                )}

                {/* Handles edge cases where your database might have fewer than 6 items on sale */}
                {!isLoading && products.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        No products are currently on sale.
                    </div>
                )}

                {!isLoading && products.map((product, index) => (
                    <div 
                        key={product.id} 
                        className={`w-full flex justify-center 
                            ${index === 4 ? 'hidden xl:flex' : ''} 
                            ${index === 5 ? 'hidden 2xl:flex' : ''}`}
                    >
                        <ProductCard product={product} />
                    </div>
                ))}

            </div>
        </section>
    );
}