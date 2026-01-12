const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const VITE_API_SAVE_USER = import.meta.env.VITE_API_SAVE_USER;
const VITE_API_BASE_URL_CH = import.meta.env.VITE_API_BASE_URL_CH;

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

  const plant = await res.json();
  return { plant, imageBase64: base64 };
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

export async function getAllUsers() {
  const token = getIdToken();
  if (!token) throw new Error("missing google_id_token");

  const res = await fetch(`${VITE_API_BASE_URL_CH}/admin`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    if (res.status === 403) {
      throw new Error("Admin access required");
    }
    throw new Error("Fetch all users failed");
  }
  //console.log("res", res, res.json());
  return res.json();
}

export async function getCurrentUser() {
  const token = getIdToken();
  if (!token) throw new Error("missing google_id_token");

  const res = await fetch(`${VITE_API_BASE_URL}/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Authentication required");
    }
    if (res.status === 404) {
      throw new Error("User not found");
    }
    throw new Error("Fetch current user failed");
  }
  return res.json();
}

export async function saveUser() {
  const token = localStorage.getItem("google_id_token");
  if (!token) throw new Error("missing google_id_token");

  const res = await fetch(`${VITE_API_SAVE_USER}/save-user`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("save-user failed");
  return res.json(); // should return user record
}
