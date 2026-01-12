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
        const auth = event.headers?.authorization || event.headers?.Authorization;
        if (!auth) return resp(401, { error: "missing Authorization Bearer token" });

        const idToken = auth.startsWith("Bearer ") ? auth.slice(7) : null;
        if (!idToken) return resp(401, { error: "Invalid Authorization format" });

        // ===== 1) verify Google ID token =====
        const googleRes = await fetch(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
        );
        if (!googleRes.ok) return resp(401, { error: "Invalid Google token" });

        const userinfo = await googleRes.json();
        const userId = `google_${userinfo.sub}`;

        // ===== 2) parse body =====
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
        const imageKey = `${userId}/${Date.now()}-${Math.random()
            .toString(16)
            .slice(2)}.jpg`;

        await s3.send(
            new PutObjectCommand({
                Bucket: process.env.BUCKET_NAME,
                Key: imageKey,
                Body: imageBuffer,
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
