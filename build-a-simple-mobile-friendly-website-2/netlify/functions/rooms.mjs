import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { getDatabase } from "@netlify/database";
import { Buffer } from "node:buffer";

const database = getDatabase();
const MAX_BODY_BYTES = 128 * 1024;

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function validCode(value) {
  return typeof value === "string" && /^[a-f0-9]{32}$/i.test(value);
}

function validRoom(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    && typeof value.movie === "string" && value.movie.trim().length > 0
    && value.movie.length <= 200
    && Array.isArray(value.people) && value.people.length <= 30
    && Array.isArray(value.bookers) && value.bookers.length <= 30
    && Array.isArray(value.payments) && value.payments.length <= 2000;
}

async function readBody(request) {
  const raw = await request.text();
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) return { error: "Room data is too large." };
  try {
    return { body: JSON.parse(raw) };
  } catch {
    return { error: "Invalid JSON request." };
  }
}

export default async (request) => {
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
  const parsed = await readBody(request);
  if (parsed.error) return json({ error: parsed.error }, 400);
  const body = parsed.body;

  try {
    if (body.action === "create") {
      if (!validRoom(body.room)) return json({ error: "Room details are incomplete." }, 400);
      const code = randomBytes(16).toString("hex");
      const ownerToken = randomBytes(24).toString("hex");
      const room = { ...body.room, code };
      delete room.ownerToken;
      delete room.syncVersion;
      await database.sql`
        INSERT INTO shared_movie_rooms (code_hash, owner_hash, room_data, version)
        VALUES (${hash(code)}, ${hash(ownerToken)}, ${JSON.stringify(room)}::jsonb, 1)
      `;
      return json({ room, ownerToken, version: 1 }, 201);
    }

    if (!validCode(body.code)) return json({ error: "Enter a valid room code." }, 400);
    const codeHash = hash(body.code);

    if (body.action === "get") {
      const rows = await database.sql`
        SELECT room_data, version FROM shared_movie_rooms WHERE code_hash = ${codeHash}
      `;
      if (!rows.length) return json({ error: "Room not found. Check the invite code." }, 404);
      return json({ room: rows[0].room_data, version: rows[0].version });
    }

    if (body.action === "update") {
      if (!validRoom(body.room) || !Number.isInteger(body.version) || body.version < 1) {
        return json({ error: "Room update is incomplete." }, 400);
      }
      const room = { ...body.room, code: body.code };
      delete room.ownerToken;
      delete room.syncVersion;
      const rows = await database.sql`
        UPDATE shared_movie_rooms
        SET room_data = ${JSON.stringify(room)}::jsonb,
            version = version + 1,
            updated_at = NOW()
        WHERE code_hash = ${codeHash} AND version = ${body.version}
        RETURNING version
      `;
      if (!rows.length) {
        const exists = await database.sql`SELECT 1 FROM shared_movie_rooms WHERE code_hash = ${codeHash}`;
        return exists.length
          ? json({ error: "Room changed on another device. Reload it before editing again." }, 409)
          : json({ error: "Room not found." }, 404);
      }
      return json({ version: rows[0].version });
    }

    if (body.action === "delete") {
      if (typeof body.ownerToken !== "string" || !/^[a-f0-9]{48}$/i.test(body.ownerToken)) {
        return json({ error: "Only the room creator can delete this shared room." }, 403);
      }
      const rows = await database.sql`
        DELETE FROM shared_movie_rooms
        WHERE code_hash = ${codeHash} AND owner_hash = ${hash(body.ownerToken)}
        RETURNING code_hash
      `;
      return rows.length
        ? json({ deleted: true })
        : json({ error: "Room not found or this device is not its creator." }, 404);
    }

    return json({ error: "Unknown room action." }, 400);
  } catch (error) {
    console.error("Shared room request failed", error);
    return json({ error: "The shared room service is unavailable right now." }, 503);
  }
};

export const config = {
  path: "/api/rooms",
  method: "POST",
  rateLimit: { action: "rate_limit", aggregateBy: "ip", windowSize: 60, windowLimit: 60 },
};
