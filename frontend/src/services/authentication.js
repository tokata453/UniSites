const API_URL = import.meta.env.VITE_API_BASE_URL;

export const authService = {
  // Login Call
  async login(email, password) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  // Register Call
  async register(userData) {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  // Get Current User (Using the token)
  async getCurrentUser() {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });
    return response.json();
  },
  
  loginWithGoogle() {
    // Redirects the current browser tab to your backend route
    window.location.href = `${API_URL}/api/auth/google`;
  },

  // Facebook OAuth Initiator
  loginWithFacebook() {
    // Redirects the current browser tab to your backend route
    window.location.href = `${API_URL}/api/auth/facebook`;
  }
};