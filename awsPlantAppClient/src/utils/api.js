// // API configuration and utility functions
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://your-api-gateway-url.execute-api.region.amazonaws.com';

// // // Get JWT token from localStorage
// // const getToken = () => {
// //   return localStorage.getItem('jwt_token');
// // };

// function fileToBase64(file) {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = () => {
//       // remove "data:image/...;base64,"
//       resolve(reader.result.split(",")[1]);
//     };
//     reader.onerror = reject;
//     reader.readAsDataURL(file);
//   });
// }


// // export async function identifyPlant(imageFile) {
// //   const base64 = await fileToBase64(imageFile);

// //   const res = await fetch(`${API_BASE_URL}/identify`, {
// //     method: "POST",
// //     headers: {
// //       "Content-Type": "text/plain"
// //     },
// //     body: base64
// //   });

// //   if (!res.ok) {
// //     throw new Error("Identify failed");
// //   }

// //   return {
// //     plant: await res.json(),
// //     imageBase64: base64   // IMPORTANT: keep for save
// //   };
// // }

// // Make API request with authentication
// const apiRequest = async (endpoint, options = {}) => {
//   const token = getToken();
//   const headers = {
//     'Content-Type': 'application/json',
//     ...options.headers,
//   };

//   if (token) {
//     headers['Authorization'] = `Bearer ${token}`;
//   }

//   const response = await fetch(`${API_BASE_URL}${endpoint}`, {
//     ...options,
//     headers,
//   });

//   if (!response.ok) {
//     const error = await response.json().catch(() => ({ message: 'Request failed' }));
//     throw new Error(error.message || `HTTP error! status: ${response.status}`);
//   }

//   return response.json();
// };

// // API functions
// export const api = {
//   // Authentication
//   login: async (email, password) => {
//     return apiRequest('/login', {
//       method: 'POST',
//       body: JSON.stringify({ email, password }),
//     });
//   },

//   signup: async (email, password, name) => {
//     return apiRequest('/signup', {
//       method: 'POST',
//       body: JSON.stringify({ email, password, name }),
//     });
//   },

//   // Plant identification
//   // identifyPlant: async (imageFile) => {
//   //   const token = getToken();
//   //   // const formData = new FormData();
//   //   // formData.append("image", imageFile);

//   //   const response = await fetch(`${API_BASE_URL}/identify`, {
//   //     method: "POST",
//   //     headers: {
//   //       Authorization: token ? `Bearer ${token}` : "",
//   //     },
//   //     body: formData,
//   //   });

//   //   if (!response.ok) {
//   //     const error = await response
//   //       .json()
//   //       .catch(() => ({ message: "Request failed" }));
//   //     throw new Error(
//   //       error.message || `HTTP error! status: ${response.status}`
//   //     );
//   //   }

//   //   return response.json();
//   // },

//   identifyPlant: async (imageFile) => {
//   // Convert image file to base64
//   const fileToBase64 = (file) =>
//     new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onload = () => {
//         // Remove the "data:image/...;base64," prefix
//         const base64String = reader.result.split(",")[1];
//         resolve(base64String);
//       };
//       reader.onerror = (error) => reject(error);
//     });

//   const base64 = await fileToBase64(imageFile);

//   const response = await fetch(`${API_BASE_URL}/identify`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "text/plain", // backend expects raw text
//       // ✅ remove Authorization completely
//     },
//     body: base64,
//   });

//   if (!response.ok) {
//     const error = await response.json().catch(() => ({
//       message: "Request failed",
//     }));
//     throw new Error(error.message || `HTTP error! status: ${response.status}`);
//   }

//   return {
//     plant: await response.json(),
//     imageBase64: base64, // so Home.jsx can save it later
//   };
// },

//   // Save plant
//   // savePlant: async (plantData) => {
//   //   return apiRequest('/save', {
//   //     method: 'POST',
//   //     body: JSON.stringify(plantData),
//   //   });
//   // },

//   // Get user's plants
//   // getMyPlants: async () => {
//   //   return apiRequest('/my-plants', {
//   //     method: 'GET',
//   //   });
//   // },
// };


// export async function identifyPlant(imageFile) {
//   const base64 = await fileToBase64(imageFile);

//   const res = await fetch(`${API_BASE_URL}/identify`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "text/plain"
//     },
//     body: base64
//   });

//   if (!res.ok) {
//     throw new Error("Identify failed");
//   }

//   return {
//     plant: await res.json(),
//     imageBase64: base64   // IMPORTANT: keep for save
//   };
// }

// export async function savePlant(plant, imageBase64) {
//   const res = await fetch(`${API_BASE_URL}/save`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//       // Authorization later (Google token)
//     },
//     body: JSON.stringify({
//       ...plant,
//       imageBase64
//     })
//   });

//   if (!res.ok) {
//     throw new Error("Save failed");
//   }

//   return res.json();
// }


// export async function getMyPlants() {
//   const userId = "test-user";

//   const res = await fetch(
//     `${API_BASE_URL}/my-plants?userId=${userId}`
//   );

//   if (!res.ok) {
//     throw new Error("Fetch plants failed");
//   }

//   return res.json();
// }

// // Auth utilities
// export const auth = {
//   isAuthenticated: () => {
//     return !!localStorage.getItem('jwt_token');
//   },

//   setToken: (token) => {
//     localStorage.setItem('jwt_token', token);
//   },

//   removeToken: () => {
//     localStorage.removeItem('jwt_token');
//   },
// };



const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getIdToken = () => localStorage.getItem("google_id_token");

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]); // remove data:...;base64,
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function identifyPlant(imageFile) {
  const base64 = await fileToBase64(imageFile);

  const res = await fetch(`${VITE_API_BASE_URL}/identify`, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: base64,
  });

  if (!res.ok) throw new Error("Identify failed");

  return { plant: await res.json(), imageBase64: base64 };
}

export async function savePlant(plant, imageBase64) {
  const token = getIdToken();
  if (!token) throw new Error("missing google_id_token");

  const res = await fetch(`${VITE_API_BASE_URL}/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...plant, imageBase64 }),
  });

  if (!res.ok) throw new Error("Save failed");
  return res.json();
}

export async function getMyPlants() {
  const token = getIdToken();
  if (!token) throw new Error("missing google_id_token");

  const res = await fetch(`${VITE_API_BASE_URL}/my-plants`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Fetch plants failed");
  return res.json();
}
