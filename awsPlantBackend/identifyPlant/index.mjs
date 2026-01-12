// // index.mjs
// // Node.js 18+
// // IDENTIFY ONLY (no permanent saving)

// export const handler = async (event) => {
//   try {
//     // ===== 1) read image (base64) =====
//     const base64 = event.isBase64Encoded
//       ? event.body
//       : (event.imageBase64 ?? event.body);

//     if (!base64) return resp(400, { error: "no image" });

//     const imageBuffer = Buffer.from(base64, "base64");

//     // ===== 2) PlantNet =====
//     // const form = new FormData();
//     // form.append("organs", "leaf");
//     // form.append(
//     //   "images",
//     //   new Blob([imageBuffer], { type: "image/jpeg" }),
//     //   "plant.jpg"
//     // );

//     // const plantNetRes = await fetch(
//     //   `https://my-api.plantnet.org/v2/identify/all?api-key=${process.env.PLANTNET_KEY}`,
//     //   { method: "POST", body: form }
//     // );

//     // const plantNetJson = await plantNetRes.json();
//     // if (!plantNetRes.ok) {
//     //   return resp(502, { error: "plantnet failed", plantNetJson });
//     // }

//     // const best = plantNetJson.results?.[0];
//     // if (!best) return resp(404, { error: "plant not identified" });

//     // const scientificName =
//     //   best.species?.scientificNameWithoutAuthor ?? null;
//     // const commonName =
//     //   best.species?.commonNames?.[0] ?? null;

//     const plantNetRes = await fetch(
//   `https://my-api.plantnet.org/v2/identify/all?api-key=${process.env.PLANTNET_KEY}`,
//   { method: "POST", body: form }
// );

// let plantNetJson;
// try {
//   plantNetJson = await plantNetRes.json();
// } catch {
//   // If it's not JSON, read as text
//   const text = await plantNetRes.text();
//   return resp(502, { error: "PlantNet API did not return JSON", details: text });
// }

// if (!plantNetRes.ok) {
//   return resp(502, { error: "plantnet failed", plantNetJson });
// }

//     // ===== 3) Perenual: find id =====
//     // const queries = [
//     //   scientificName,
//     //   commonName,
//     //   scientificName?.split(" ")[0],
//     // ].filter(Boolean);

//     // let plant = null;

//     // for (const q of queries) {
//     //   const listRes = await fetch(
//     //     `https://perenual.com/api/v2/species-list?key=${process.env.PERENUAL_KEY}&q=${encodeURIComponent(q)}`
//     //   );
//     //   const listJson = await listRes.json();
//     //   if (listRes.ok && listJson.data?.length) {
//     //     plant = listJson.data[0];
//     //     break;
//     //   }
//     // }

//     // if (!plant) {
//     //   return resp(404, {
//     //     error: "plant not found in perenual",
//     //     tried: queries,
//     //   });
//     // }

//     // ===== 4) Perenual: details =====
//     // const detailsRes = await fetch(
//     //   `https://perenual.com/api/v2/species/details/${plant.id}?key=${process.env.PERENUAL_KEY}`
//     // );
//     // const details = await detailsRes.json();
//     // if (!detailsRes.ok) {
//     //   return resp(502, {
//     //     error: "perenual details failed",
//     //     details,
//     //   });
//     // }

//     const queries = [
//   scientificName,
//   commonName,
//   scientificName?.split(" ")[0],
// ].filter(Boolean);

// let plant = null;

// for (const q of queries) {
//   const listRes = await fetch(
//     `https://perenual.com/api/v2/species-list?key=${process.env.PERENUAL_KEY}&q=${encodeURIComponent(q)}`
//   );

//   let listJson;
//   try {
//     listJson = await listRes.json(); // try parsing JSON
//   } catch {
//     const text = await listRes.text(); // fallback if not JSON
//     return resp(502, {
//       error: "Perenual species-list did not return JSON",
//       details: text,
//       query: q
//     });
//   }

//   if (!listRes.ok) {
//     return resp(502, {
//       error: "Perenual species-list API error",
//       details: listJson,
//       query: q
//     });
//   }

//   if (listJson.data?.length) {
//     plant = listJson.data[0];
//     break;
//   }
// }

// if (!plant) {
//   return resp(404, {
//     error: "Plant not found in Perenual",
//     tried: queries
//   });
// }

// // ===== 4) Perenual: details =====
// const detailsRes = await fetch(
//   `https://perenual.com/api/v2/species/details/${plant.id}?key=${process.env.PERENUAL_KEY}`
// );

// let details;
// try {
//   details = await detailsRes.json();
// } catch {
//   const text = await detailsRes.text(); // fallback if not JSON
//   return resp(502, {
//     error: "Perenual details did not return JSON",
//     details: text,
//     plantId: plant.id
//   });
// }

// if (!detailsRes.ok) {
//   return resp(502, {
//     error: "Perenual details API error",
//     details: details,
//     plantId: plant.id
//   });
// }

//     // ===== 5) response =====
//     return resp(200, {
//       scientificName,
//       commonName,
//       perenualId: plant.id,
//       watering: details.watering ?? null,
//       sunlight: details.sunlight ?? null
//     });

//   } catch (e) {
//     console.error(e);
//     return resp(500, { error: "server error", message: String(e) });
//   }
// };

// const resp = (statusCode, body) => ({
//   statusCode,
//   headers: {
//     "Access-Control-Allow-Origin": "*",
//     "Access-Control-Allow-Headers": "*",
//     "Content-Type": "application/json",
//   },
//   body: JSON.stringify(body),
// });


// index.mjs
// Node.js 18+
// IDENTIFY ONLY (no permanent saving)

export const handler = async (event) => {
  try {
    // ===== 1) read image (base64) =====
    let base64 = event.isBase64Encoded
      ? event.body
      : (event.imageBase64 ?? event.body);

    if (!base64) return resp(400, { error: "no image" });

    // allow raw base64 or data url
    const raw = String(base64).replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(raw, "base64");

    // ===== 2) PlantNet (AUTO organ) =====
    const form = new FormData();
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

    // ===== 3) Perenual: find id (normalized queries) =====
    const sci2 = scientificName
      ?.split(" ")
      .slice(0, 2)
      .join(" ");

    const genus = scientificName?.split(" ")[0];

    const queries = [
      sci2,        // scientific (2 words)
      commonName,  // common name
      genus,       // genus fallback
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

    // if perenual finds nothing, still return identification
    if (!plant) {
      return resp(200, {
        scientificName,
        commonName,
        perenualId: null,
        watering: "No care available",
        sunlight: ["No care available"], 
      });
    }

    // ===== 4) Perenual: details (OPTIONAL) =====
    let watering = "No care available";
    let sunlight = ["No care available"]; 

    try {
      const detailsRes = await fetch(
        `https://perenual.com/api/v2/species/details/${plant.id}?key=${process.env.PERENUAL_KEY}`
      );

      if (detailsRes.ok) {
        const details = await detailsRes.json();

        if (details?.watering) watering = details.watering;

        // sunlight: normalize to array
        if (Array.isArray(details?.sunlight) && details.sunlight.length) {
          sunlight = details.sunlight;
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
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});
