// API configuration and utility functions
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; //|| 'https://your-api-gateway-url.execute-api.region.amazonaws.com';

// Get JWT token from localStorage
const getToken = () => {
  return localStorage.getItem("jwt_token");
};

// Make API request with authentication
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// API functions
export const api = {
  // Authentication
  login: async (email, password) => {
    return apiRequest("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  signup: async (email, password, name) => {
    return apiRequest("/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  },

  // Plant identification
  identifyPlant: async (imageFile) => {
    const token = getToken();
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await fetch(`${API_BASE_URL}/identify`, {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Request failed" }));
      throw new Error(
        error.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  },

  // Save plant
  savePlant: async (plantData) => {
    return apiRequest("/save", {
      method: "POST",
      body: JSON.stringify(plantData),
    });
  },

  // Get user's plants
  getMyPlants: async () => {
    return apiRequest("/my-plants", {
      method: "GET",
    });
  },
};

// Auth utilities
export const auth = {
  isAuthenticated: () => {
    return !!localStorage.getItem("jwt_token");
  },

  setToken: (token) => {
    localStorage.setItem("jwt_token", token);
  },

  removeToken: () => {
    localStorage.removeItem("jwt_token");
  },
};
