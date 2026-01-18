
// index.mjs
// Node.js 18+
// IDENTIFY ONLY (no permanent saving)

export const handler = async (event) => {
  try {
    // ===== 1) read image (base64) =====
    let base64 = event.isBase64Encoded //handles both raw base64 in body or { imageBase64: "..." }
      ? event.body
      : (event.imageBase64 ?? event.body);

    if (!base64) return resp(400, { error: "no image" });

    // allow raw base64 or data url
    const raw = String(base64).replace(/^data:image\/\w+;base64,/, ""); //removes data:image/jpeg;base64, if frontend sent a data-url.
    const imageBuffer = Buffer.from(raw, "base64"); //converts a base64 string into binary image data

    // ===== 2) PlantNet (AUTO organ) =====
    //wraps the image bytes into a JPEG file and attaches it to a form so it can be uploaded to the PlantNet API like a normal file.
    const form = new FormData();
    form.append(
      "images",
      new Blob([imageBuffer], { type: "image/jpeg" }),
      "plant.jpg"
    );

    const plantNetRes = await fetch( //calls the first api with the image
      `https://my-api.plantnet.org/v2/identify/all?api-key=${process.env.PLANTNET_KEY}`,
      { method: "POST", body: form }
    );

    const plantNetJson = await plantNetRes.json();
    if (!plantNetRes.ok) {
      return resp(502, { error: "plantnet failed", plantNetJson });
    }
    const best = plantNetJson.results?.[0]; //takes the first result
    if (!best) return resp(404, { error: "plant not identified" });

    const scientificName =
      best.species?.scientificNameWithoutAuthor ?? null; //takes the scientific name from the best result
    const commonName =
      best.species?.commonNames?.[0] ?? null; //takes the first common name from the array

    // ===== 3) Perenual: find id =====
    const sci2 = scientificName //takes the first 2 words from sci name
      ?.split(" ")
      .slice(0, 2)
      .join(" ");

    const genus = scientificName?.split(" ")[0]; //take the plant's biology group as a backup for looser search

    const queries = [ //looking up all these names
      sci2,        // scientific (2 words)
      commonName,  // common name
      genus,       // genus fallback
    ].filter(Boolean);

    let plant = null;

    //tries each backup search query in order, calls Perenual, and as soon as it finds results it takes the first plant and stops.
    for (const q of queries) { 
      const listRes = await fetch(
        `https://perenual.com/api/v2/species-list?key=${process.env.PERENUAL_KEY}&q=${encodeURIComponent(q)}`
      );
      const listJson = await listRes.json();
      if (listRes.ok && listJson.data?.length) {
        plant = listJson.data[0];
        break;
      }
    }

    // if perenual finds nothing,return only the name from the first api
    if (!plant) {
      return resp(200, {
        scientificName,
        commonName,
        perenualId: null,
        watering: "No care available",
        sunlight: ["No care available"], 
      });
    }

    // ===== 4) Perenual: details =====
    //in case perenual has the plant but without care info
    let watering = "No care available";
    let sunlight = ["No care available"]; 

    try {
      const detailsRes = await fetch(
        `https://perenual.com/api/v2/species/details/${plant.id}?key=${process.env.PERENUAL_KEY}`
      );

      if (detailsRes.ok) {
        const details = await detailsRes.json();

        if (details?.watering) watering = details.watering; //update if exists

        // sunlight: normalize to array
          // Case 1: already an array with values → use it
        if (Array.isArray(details?.sunlight) && details.sunlight.length) {
          sunlight = details.sunlight;
          //Case 2: sunlight is a non-empty string → wrap in array
        } else if (typeof details?.sunlight === "string" && details.sunlight.trim()) {
          sunlight = [details.sunlight.trim()];
        }
      }
    } catch {
      // ignore perenual errors – identification must succeed
    }

    // ===== 5) response =====
    return resp(200, {
      scientificName,
      commonName,
      perenualId: plant.id,
      watering,
      sunlight, 
    });

  } catch (e) {
    console.error(e);
    return resp(500, { error: "server error", message: String(e) });
  }
};

const resp = (statusCode, body) => ({
  statusCode,
  headers: {
    "Access-Control-Allow-Origin": "*", // Allow requests from any origin (CORS)
    "Access-Control-Allow-Headers": "*",  // Allow any headers from the client
    "Content-Type": "application/json",  // Tell the client this is JSON
  },
   // API Gateway expects the body as a STRING
  // so we convert the JS object to JSON tex
  body: JSON.stringify(body),
});
