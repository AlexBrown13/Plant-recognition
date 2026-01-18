// index.mjs
// Node.js 18+
// SAVE LAMBDA (S3 + DynamoDB + Google ID token via tokeninfo)

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

// 1) frontend sends plant data + imageBase64 to /save
// 2) lambda verifies Google token and builds userId
// 3) lambda parses request body
// 4) lambda converts imageBase64 → image bytes
// 5) lambda uploads image bytes to S3
// 6) lambda saves plant metadata + imageKey to DynamoDB
// 7) lambda returns success to the client

const s3 = new S3Client({});
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event) => {
    try {
        // ===== 0) auth: read bearer token =====
        const auth = event.headers?.authorization || event.headers?.Authorization;
        if (!auth) return resp(401, { error: "missing Authorization Bearer token" });

        const idToken = auth.startsWith("Bearer ") ? auth.slice(7) : null;
        if (!idToken) return resp(401, { error: "Invalid Authorization format" });

        // ===== 1) verify Google ID token =====
        const googleRes = await fetch(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
        );
        if (!googleRes.ok) return resp(401, { error: "Invalid Google token" });

        // sub is Google's unique user id
        const userinfo = await googleRes.json();
        const userId = `google_${userinfo.sub}`;

        // ===== 2) parse body =====
        // Body should contain plant data + imageBase64
        const body = JSON.parse(event.body || "{}");
        const {
            scientificName,
            commonName,
            perenualId,
            watering,
            sunlight,
            imageBase64,
        } = body;

        if (!imageBase64) return resp(400, { error: "missing imageBase64" });

        // ===== 3) normalize perenualId (fallback allowed) =====
        let safePerenualId;
        if (perenualId === undefined || perenualId === null) {
            safePerenualId = Date.now(); // numeric fallback
        } else {
            safePerenualId = Number(perenualId);
        }

        // ===== 4) decode image =====
        const raw = String(imageBase64).replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(raw, "base64");

        // ===== 5) upload image to S3 =====
         // Key format: <userId>/<timestamp>-<random>.jpg
        const imageKey = `${userId}/${Date.now()}-${Math.random()
            .toString(16)
            .slice(2)}.jpg`;

        await s3.send(
            new PutObjectCommand({
                Bucket: process.env.BUCKET_NAME,
                Key: imageKey,
                Body: imageBuffer, // the actual image bytes
                ContentType: "image/jpeg",
            })
        );

        // ===== 6) save metadata to DynamoDB =====
        await ddb.send(
            new PutCommand({
                TableName: process.env.PLANTS_TABLE,
                Item: {
                    userId, // PK
                    perenualId: safePerenualId, // SK (Number)
                    scientificName: scientificName ?? null,
                    commonName: commonName ?? null,
                    watering: watering ?? "No care available",
                    sunlight: Array.isArray(sunlight)
                        ? sunlight
                        : ["No care available"],
                    imageKey,
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
