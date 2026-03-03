const BASE_URL = 'https://electronic-store-production-0f93.up.railway.app'


export const getProducts = async (params = {}) => {
    try {
        // Add parameters in the main component files instead
        const queryString = new URLSearchParams(params).toString();
        const url = `${BASE_URL}/api/products${queryString ? `?${queryString}` : ''}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const json = await response.json();
        return json.data.products; 
    } catch (error) {
        console.error("Failed to fetch products:", error);
        throw error;
    }
};