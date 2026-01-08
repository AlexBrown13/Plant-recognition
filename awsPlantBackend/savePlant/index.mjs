// index.mjs
// Node.js 18+
// SAVE LAMBDA (S3 + DynamoDB + Google ID token via tokeninfo)

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const s3 = new S3Client({});
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event) => {
  try {
    // ===== 0) auth: read bearer token =====

    // const auth = event.headers?.authorization || event.headers?.Authorization;
    // const idToken = auth?.startsWith("Bearer ") ? auth.slice(7) : null;

    // if (!idToken) return resp(401, { error: "missing Authorization Bearer token" });

    // //auth: verify token (simple)
    // // returns { sub, email, aud, ... } if valid
    // const tokenInfoRes = await fetch(
    //   `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
    // );
    // const tokenInfo = await tokenInfoRes.json();

    // if (!tokenInfoRes.ok) {
    //   return resp(401, { error: "invalid token", tokenInfo });
    // }

    const userId = "test-user";
    //const userId = `google_${tokenInfo.sub}`;

    // ===== 1) parse body =====
    const body = JSON.parse(event.body || "{}");
    const { scientificName, commonName, perenualId, watering, sunlight, imageBase64 } = body;

    if (!imageBase64) return resp(400, { error: "missing imageBase64" });
    if (perenualId === undefined || perenualId === null) {
      return resp(400, { error: "missing perenualId" });
    }

    // ===== 2) decode image =====
    const imageBuffer = Buffer.from(imageBase64, "base64");

    // ===== 3) upload image to S3 =====
    const imageKey = `${userId}/${Date.now()}-${Math.random().toString(16).slice(2)}.jpg`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: imageKey,
        Body: imageBuffer,
        ContentType: "image/jpeg",
      })
    );

    // ===== 4) save metadata to DynamoDB =====
    await ddb.send(
      new PutCommand({
        TableName: process.env.PLANTS_TABLE || "PlantsRecognition",
        Item: {
          userId,                      // PK (S)
          perenualId: Number(perenualId), // SK (N)
          scientificName: scientificName ?? null,
          commonName: commonName ?? null,
          watering: watering ?? null,
          sunlight: Array.isArray(sunlight) ? sunlight : [],
          imageKey,                    // store S3 key (NOT base64)
          createdAt: new Date().toISOString(),
        },
      })
    );

    return resp(200, { ok: true, imageKey });
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
