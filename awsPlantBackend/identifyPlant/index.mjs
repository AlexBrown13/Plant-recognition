// index.mjs
// Node.js 18+
// IDENTIFY ONLY (no permanent saving)

export const handler = async (event) => {
  try {
    // ===== 1) read image (base64) =====
    const base64 = event.isBase64Encoded
      ? event.body
      : (event.imageBase64 ?? event.body);

    if (!base64) return resp(400, { error: "no image" });

    const imageBuffer = Buffer.from(base64, "base64");

    // ===== 2) PlantNet =====
    const form = new FormData();
    form.append("organs", "leaf");
    form.append(
      "images",
      new Blob([imageBuffer], { type: "image/jpeg" }),
      "plant.jpg"
    );

    const plantNetRes = await fetch(
      `https://my-api.plantnet.org/v2/identify/all?api-key=${process.env.PLANTNET_KEY}`,
      { method: "POST", body: form }
    );

    const plantNetJson = await plantNetRes.json();
    if (!plantNetRes.ok) {
      return resp(502, { error: "plantnet failed", plantNetJson });
    }

    const best = plantNetJson.results?.[0];
    if (!best) return resp(404, { error: "plant not identified" });

    const scientificName =
      best.species?.scientificNameWithoutAuthor ?? null;
    const commonName =
      best.species?.commonNames?.[0] ?? null;

    // ===== 3) Perenual: find id =====
    const queries = [
      scientificName,
      commonName,
      scientificName?.split(" ")[0],
    ].filter(Boolean);

    let plant = null;

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

    if (!plant) {
      return resp(404, {
        error: "plant not found in perenual",
        tried: queries,
      });
    }

    // ===== 4) Perenual: details =====
    const detailsRes = await fetch(
      `https://perenual.com/api/v2/species/details/${plant.id}?key=${process.env.PERENUAL_KEY}`
    );
    const details = await detailsRes.json();
    if (!detailsRes.ok) {
      return resp(502, {
        error: "perenual details failed",
        details,
      });
    }

    // ===== 5) response =====
    return resp(200, {
      scientificName,
      commonName,
      perenualId: plant.id,
      watering: details.watering ?? null,
      sunlight: details.sunlight ?? null
    });

  } catch (e) {
    console.error(e);
    return resp(500, { error: "server error", message: String(e) });
  }
};

const resp = (statusCode, body) => ({
  statusCode,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});
