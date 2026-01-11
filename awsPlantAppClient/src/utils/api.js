
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
