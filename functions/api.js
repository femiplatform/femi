export async function onRequest(context) {
  const GAS_URL = context.env.GAS_URL; // ตั้งใน Cloudflare Pages env var
  if (!GAS_URL) {
    return new Response("Missing GAS_URL env var", { status: 500 });
  }

  const req = context.request;
  const incomingUrl = new URL(req.url);

  // เป้าหมายคือ Apps Script Web App (/exec)
  const target = new URL(GAS_URL);

  // ส่ง query string ต่อไปด้วย (เผื่ออนาคตใช้)
  incomingUrl.searchParams.forEach((v, k) => target.searchParams.append(k, v));

  // ส่ง body ต่อไปตามเดิม
  const body = (req.method === "GET" || req.method === "HEAD") ? null : await req.arrayBuffer();

  const resp = await fetch(target.toString(), {
    method: req.method,
    headers: {
      "Content-Type": req.headers.get("Content-Type") || "application/json"
    },
    body
  });

  // ส่งผลลัพธ์กลับไปที่ frontend
  return new Response(await resp.arrayBuffer(), {
    status: resp.status,
    headers: {
      "Content-Type": resp.headers.get("Content-Type") || "application/json",
      "Cache-Control": "no-store"
    }
  });
}
