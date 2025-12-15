const NextResponse = {
  json: (body: any, init?: { status?: number; headers?: Record<string, string> }) =>
    new Response(JSON.stringify(body), {
      status: init?.status ?? 200,
      headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    }),
};
import { promises as fs } from "fs";
import path from "path";

const allowed = new Set([
  "services",
  "platforms",
  "packages",
  "orders",
  "analytics",
  "payment_settings",
]);

const filePath = (name: string) =>
  path.join(process.cwd(), "next-api", "storage", `${name}.json`);

const readJson = async (p: string) => {
  try {
    const s = await fs.readFile(p, "utf-8");
    const j = s ? JSON.parse(s) : [];
    return Array.isArray(j) ? j : [];
  } catch {
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, "[]");
    return [];
  }
};

const writeJson = async (p: string, data: any[]) => {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(data));
};

export async function GET(
  request: Request,
  context: { params: { collection: string } }
) {
  const name = context.params.collection;
  if (!allowed.has(name))
    return NextResponse.json(
      { ok: false, error: "Invalid collection" },
      { status: 400 }
    );
  const p = filePath(name);
  const data = await readJson(p);
  return NextResponse.json({ ok: true, data });
}

export async function POST(
  request: Request,
  context: { params: { collection: string } }
) {
  const name = context.params.collection;
  if (!allowed.has(name))
    return NextResponse.json(
      { ok: false, error: "Invalid collection" },
      { status: 400 }
    );
  const body = await request.json();
  const p = filePath(name);
  const data = await readJson(p);
  const id =
    (body?.id as string) ||
    (Date.now() + Math.floor(Math.random() * 1000)).toString();
  const item = { id, ...body };
  const next = [...data, item];
  await writeJson(p, next);
  return NextResponse.json({ ok: true, item }, { status: 201 });
}

export async function PUT(
  request: Request,
  context: { params: { collection: string } }
) {
  const name = context.params.collection;
  if (!allowed.has(name))
    return NextResponse.json(
      { ok: false, error: "Invalid collection" },
      { status: 400 }
    );
  const body = await request.json();
  if (!body?.id)
    return NextResponse.json(
      { ok: false, error: "Missing id" },
      { status: 400 }
    );
  const p = filePath(name);
  const data = await readJson(p);
  const idx = data.findIndex((r: any) => r.id === body.id);
  if (idx === -1)
    return NextResponse.json(
      { ok: false, error: "Not found" },
      { status: 404 }
    );
  const updated = { ...data[idx], ...body };
  data[idx] = updated;
  await writeJson(p, data);
  return NextResponse.json({ ok: true, item: updated });
}

export async function DELETE(
  request: Request,
  context: { params: { collection: string } }
) {
  const name = context.params.collection;
  if (!allowed.has(name))
    return NextResponse.json(
      { ok: false, error: "Invalid collection" },
      { status: 400 }
    );
  const body = await request.json();
  if (!body?.id)
    return NextResponse.json(
      { ok: false, error: "Missing id" },
      { status: 400 }
    );
  const p = filePath(name);
  const data = await readJson(p);
  const exists = data.some((r: any) => r.id === body.id);
  if (!exists)
    return NextResponse.json(
      { ok: false, error: "Not found" },
      { status: 404 }
    );
  const next = data.filter((r: any) => r.id !== body.id);
  await writeJson(p, next);
  return NextResponse.json({ ok: true, id: body.id });
}
