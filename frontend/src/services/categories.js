const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const getCategories = async () => {
    try {
        const response = await fetch(`${BASE_URL}/api/categories`);
        
        if (!response.ok) {
            throw new Error("Failed to fetch categories");
        }
        
        const json = await response.json();
        // Return the array, sorted by the sortOrder field from your API
        return json.data.categories.sort((a, b) => a.sortOrder - b.sortOrder); 
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        throw error;
    }
};