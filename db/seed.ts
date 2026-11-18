import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { db} from "./index";
import { houseRooms, houses, roomHotspots } from "./schema";
import { eq } from "drizzle-orm";

interface SeedHotspot { to: string; label: string; pitch: number; yaw: number }
interface SeedRoom {
  slug: string;
  name: string;
  panorama: string;
  mask?: string;
  startPitch?: number;
  startYaw?: number;
  hotspots: SeedHotspot[];
}
interface SeedHouse {
  id: string;
  name: string;
  type: string;
  status: "For Sale" | "For Rent";
  location: string;
  price: number;
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  garage: string;
  yearBuilt: number;
  lotSize: string;
  description: string;
  features: string[];
  rooms: SeedRoom[];
}

const seedHouses: SeedHouse[] = [
  {
    id: "maple",
    name: "Bole Haven Residence",
    type: "Apartment",
    status: "For Sale",
    location: "Bole, Addis Ababa, Ethiopia",
    price: 12500000,
    sqft: 920,
    bedrooms: 1,
    bathrooms: 1,
    garage: "2 cars",
    yearBuilt: 2022,
    lotSize: "Apartment unit",
    description:
      "A warm, well-lit apartment with a spacious living room finished in polished wood-look flooring, cream walls and a large window dressed with sheer curtains. A short step leads up to a half-wall overlooking the stairs, and the bright master bedroom has built-in white wardrobes, a feature fireplace and a connected en-suite bathroom. The neutral walls make it ready for your own colours.",
    features: [
      "Spacious open living room",
      "Large window with garden view",
      "Built-in bedroom wardrobes",
      "Bedroom fireplace",
      "En-suite bathroom",
    ],
    rooms: [
      {
        slug: "living",
        name: "Living Room",
        panorama: "/rooms/360/livingroom_forbed.avif",
        mask: "/rooms/mask/ulebombo_wall_mask.avif",
        hotspots: [{ to: "bedroom", label: "Master Bedroom", pitch: -4, yaw: -110 }],
      },
      {
        slug: "bedroom",
        name: "Master Bedroom",
        panorama: "/rooms/360/bedroom.avif",
        mask: "/rooms/mask/lythwood_wall_mask_hires.avif",
        startYaw: -90,
        hotspots: [{ to: "living", label: "Living Room", pitch: -5, yaw: 248 }],
      },
    ],
  },
  {
    id: "lakeside",
    name: "CMC Classic Suite",
    type: "Classic Apartment",
    status: "For Sale",
    location: "CMC, Addis Ababa, Ethiopia",
    price: 6800000,
    sqft: 780,
    bedrooms: 1,
    bathrooms: 1,
    garage: "secure parking",
    yearBuilt: 2020,
    lotSize: "Apartment unit",
    description:
      "An elegant open lounge with decorative wall panelling, a built-in fireplace, recessed ceiling lights and textured feature walls. Two glass doors open onto a balcony with green neighbourhood views, and the dark wood-style floor adds contrast. Next to the lounge is a modern bathroom with grey stone-look tiles, a walk-in glass shower, a corner bathtub, a heated towel rail and a skylight.",
    features: [
      "Panelled lounge with fireplace",
      "Balcony with glass doors",
      "Recessed ceiling lighting",
      "Walk-in shower and corner bathtub",
      "Skylight in bathroom",
    ],
    rooms: [
      {
        slug: "lounge",
        name: "Lounge",
        panorama: "/rooms/360/living.avif",
        mask: "/rooms/mask/living.avif",
        hotspots: [{ to: "bathroom", label: "Bath Room", pitch: -3, yaw: 248 }],
      },
      {
        slug: "bathroom",
        name: "Bath Room",
        panorama: "/rooms/360/bathroom.avif",
        mask: "/rooms/mask/bathforliving.avif",
        startYaw: 120,
        hotspots: [{ to: "lounge", label: "Lounge", pitch: -3, yaw: 120 }],
      },
    ],
  },
  {
    id: "office",
    name: "Kazanchis Business Office",
    type: "Office Space",
    status: "For Rent",
    location: "Kazanchis, Addis Ababa, Ethiopia",
    price: 35000,
    sqft: 650,
    bedrooms: 0,
    bathrooms: 0,
    garage: "secure parking",
    yearBuilt: 2023,
    lotSize: "Office unit",
    description:
      "A bright, open office room with warm tan walls, glossy beige floor tiles and a large grilled window that lets in plenty of daylight. It has a single white panelled door, several wall sockets and a central ceiling light. It is an empty canvas that can be set up as a team office, a studio or a meeting room.",
    features: [
      "Open, flexible floor plan",
      "Large window with natural light",
      "Easy-clean glossy tile floor",
      "Plenty of wall sockets",
    ],
    rooms: [
      {
        slug: "main-hall",
        name: "Main Living Area",
        panorama: "/rooms/360/office.jpg",
        mask: "/rooms/mask/office_wall_mask.avif",
        hotspots: [],
      },
    ],
  },
  {
    id: "cedar-crest",
    name: "Entoto Studio Loft",
    type: "Studio Residence",
    status: "For Sale",
    location: "Entoto Road, Addis Ababa, Ethiopia",
    price: 3000000,
    sqft: 540,
    bedrooms: 1,
    bathrooms: 1,
    garage: "public parking",
    yearBuilt: 2021,
    lotSize: "Apartment unit",
    description:
      "A single open great room with plain, paintable walls that connects to a kitchen and an outdoor patio. It is designed as a flexible studio where living, sleeping and dining share one space, ready to be personalised with your own wall colours.",
    features: ["Open great room", "Connected kitchen", "Outdoor patio access", "Paintable walls"],
    rooms: [
      {
        slug: "great-room",
        name: "Great Room",
        panorama: "/rooms/360/single_room.avif",
        mask: "/rooms/mask/single2_mask.avif",
        hotspots: [], // the old kitchen and patio hotspots pointed to rooms that don't exist
      },
    ],
  },
  {
    id: "whispering-pines",
    name: "Hawassa Family Home",
    type: "Family Home",
    status: "For Rent",
    location: "Hawassa, Sidama, Ethiopia",
    price: 45000,
    sqft: 1050,
    bedrooms: 2,
    bathrooms: 1,
    garage: "1 car",
    yearBuilt: 2019,
    lotSize: "250 m²",
    description:
      "A cheerful single-level home with a central living area, tan walls, cream floor tiles with a decorative inlay border and a ceiling fan. The living area opens to a kitchen with warm wood cabinets and has a wooden front door and several windows that bring in daylight. Two bedrooms with their own doors and a separate bathroom with cream tiles open off the living area.",
    features: [
      "Wooden kitchen cabinets",
      "Ceiling fan in living area",
      "Decorative tiled floor",
      "Two bedrooms and a bathroom",
      "Plenty of natural light",
    ],
    rooms: [
      {
        slug: "living-room",
        name: "Living Room",
        panorama: "/rooms/360/smallhouse.avif",
        mask: "/rooms/mask/r1_mask.avif",
        hotspots: [
          { to: "room1", label: "Room 1", pitch: -4, yaw: 123 },
          { to: "room2", label: "Room 2", pitch: -3, yaw: -105 },
          { to: "bathroom", label: "Bath Room", pitch: -3, yaw: 155 },
        ],
      },
      {
        slug: "room1",
        name: "Room 1",
        panorama: "/rooms/360/room1.avif",
        mask: "/rooms/mask/r2_mask.avif",
        hotspots: [{ to: "living-room", label: "Living Room", pitch: -5, yaw: -250 }],
      },
      {
        slug: "room2",
        name: "Room 2",
        panorama: "/rooms/360/room1.avif",
        mask: "/rooms/mask/r2_mask.avif",
        startYaw: 75,
        hotspots: [{ to: "living-room", label: "Living Room", pitch: -4, yaw: -250 }],
      },
      {
        slug: "bathroom",
        name: "Bath Room",
        panorama: "/rooms/360/bathroom_for_smallhouse.avif",
        mask: "/rooms/mask/bathroom_wall_mask.avif",
        startYaw: 45,
        hotspots: [{ to: "living-room", label: "Living Room", pitch: -4, yaw: 80 }],
      },
    ],
  },
];

/* ---------------- finding your files ---------------- */

const MIME: Record<string, string> = {
  avif: "image/avif",
  webp: "image/webp",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

const index = new Map<string, Map<string, string>>();

async function walk(dir: string) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
      continue;
    }
    const ext = path.extname(entry.name).slice(1).toLowerCase();
    if (!(ext in MIME)) continue;

    const name = path.basename(entry.name, path.extname(entry.name)).toLowerCase();
    const folder = path.basename(path.dirname(full)).toLowerCase();
    const id = `${folder}/${name}`;
    const byExt = index.get(id) ?? new Map<string, string>();
    byExt.set(ext, full);
    index.set(id, byExt);
  }
}
function findFile(publicPath: string, kind: "panorama" | "mask") {
  const parsed = path.posix.parse(publicPath);
  const id = `${path.posix.basename(parsed.dir).toLowerCase()}/${parsed.name.toLowerCase()}`;
  const byExt = index.get(id);
  if (!byExt) return null;

  const order = kind === "mask" ? ["png", "avif", "webp", "jpg", "jpeg"] : ["avif", "webp", "jpg", "jpeg", "png"];
  for (const ext of order) {
    const file = byExt.get(ext);
    if (file) return { file, ext };
  }
  return null;
}


async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SECRET_KEY;
  const bucket = process.env.NEXT_PUBLIC_MEDIA_BUCKET ?? "huestate-media";
  if (!url || !serviceKey || !process.env.DATABASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY or DATABASE_URL in .env");
  }

  const storage = createClient(url, serviceKey, { auth: { persistSession: false } }).storage.from(bucket);

  await walk(path.join(process.cwd(), "public"));

  const files = new Map<string, { file: string; ext: string }>();
  const missing: string[] = [];

  for (const h of seedHouses) {
    for (const r of h.rooms) {
      const wanted = [
        ["panorama", r.panorama],
        ["mask", r.mask],
      ] as const;
      for (const [kind, p] of wanted) {
        if (!p) continue;
        const found = findFile(p, kind);
        if (found) files.set(`${h.id}|${p}`, found);
        else missing.push(p);
      }
    }
  }

  if (missing.length > 0) {
    console.error("\nThese files were not found under public/ (folder + name, any extension):");
    for (const m of [...new Set(missing)]) console.error("  -", m);
    console.error("\nCheck that the folders are named 360 and mask and the file names match.");
    process.exit(1);
  }

  const uploaded = new Set<string>();

  async function upload(houseId: string, kind: "panorama" | "mask", publicPath: string) {
    const found = files.get(`${houseId}|${publicPath}`)!;
    const name = path
      .basename(found.file, path.extname(found.file))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const key = `houses/${houseId}/${kind}/${name}.${found.ext}`;

    if (uploaded.has(key)) return key;

    const { error } = await storage.upload(key, await readFile(found.file), {
      contentType: MIME[found.ext],
      upsert: true,
      cacheControl: "86400",
    });
    if (error) throw new Error(`Upload failed for ${key}: ${error.message}`);

    uploaded.add(key);
    console.log("uploaded", key);
    return key;
  }

  for (const h of seedHouses) {
    const { rooms, id, ...info } = h;

    const roomKeys = [];
    for (const r of rooms) {
      roomKeys.push({
        panoramaKey: await upload(id, "panorama", r.panorama),
        maskKey: r.mask ? await upload(id, "mask", r.mask) : null,
      });
    }
    const thumb = roomKeys[0].panoramaKey;

    await db
      .insert(houses)
      .values({ id, ...info, thumb, published: true })
      .onConflictDoUpdate({ target: houses.id, set: { ...info, thumb, published: true } });
    await db.delete(houseRooms).where(eq(houseRooms.houseId, id));

    for (const [i, r] of rooms.entries()) {
      const [room] = await db
        .insert(houseRooms)
        .values({
          houseId: id,
          slug: r.slug,
          name: r.name,
          panoramaKey: roomKeys[i].panoramaKey,
          maskKey: roomKeys[i].maskKey,
          startPitch: r.startPitch ?? null,
          startYaw: r.startYaw ?? null,
          position: i,
        })
        .returning({ id: houseRooms.id });

      if (r.hotspots.length > 0) {
        await db.insert(roomHotspots).values(
          r.hotspots.map((s) => ({
            roomId: room.id,
            toSlug: s.to,
            label: s.label,
            pitch: s.pitch,
            yaw: s.yaw,
          }))
        );
      }
    }
    console.log(`✔ ${h.name}`);
  }

  console.log("Done");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});