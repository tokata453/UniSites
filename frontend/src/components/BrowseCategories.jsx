import React, { useState, useEffect } from "react";
import { getCategories } from "@/services/categories"; 
import { Card, CardContent } from "@/components/ui/card";

export default function BrowseCategories() {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (error) {
        return (
            <div className="py-12 text-center text-red-500">
                <p>Failed to load categories: {error}</p>
            </div>
        );
    }

    return (
        <section className="w-full px-4 py-12 md:px-8 lg:px-12">
            {/* Exact same outer wrapper as your product rows for perfect alignment */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight">Shop by Category</h2>
            </div>

            {/* A tight, clean grid: 2 columns on mobile, 3 on tablet, all 6 in a row on desktop */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                
                {isLoading && (
                    [...Array(6)].map((_, index) => (
                        <div 
                            key={`cat-skeleton-${index}`} 
                            className="h-32 w-full animate-pulse rounded-xl bg-muted"
                        />
                    ))
                )}

                {!isLoading && categories.map((category) => (
                    // We wrap the whole card in an <a> tag so it's fully clickable
                    <a 
                        key={category.id} 
                        href={`/category/${category.slug}`}
                        className="group block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-xl"
                    >
                        {/* shadcn Card with hover transitions */}
                        <Card className="h-full border border-border bg-card transition-all duration-200 group-hover:border-primary/50 group-hover:shadow-md">
                            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                                
                                {/* The Emoji Icon - Scales up slightly when you hover anywhere on the card */}
                                <span className="mb-3 text-4xl transition-transform duration-300 group-hover:scale-110">
                                    {category.icon || "📦"}
                                </span>
                                
                                {/* Category Name */}
                                <h3 className="text-sm font-semibold tracking-tight text-foreground sm:text-base">
                                    {category.name}
                                </h3>

                                {/* Optional: The description (kept super subtle) */}
                                {category.description && (
                                    <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                                        {category.description}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </a>
                ))}
            </div>
        </section>
    );
}