export const config = { runtime: "edge" };

const CDN_MAP = {
  "_x1x_": (process.env.CDN_URL1 || ""),
  "_x2x_": (process.env.CDN_URL2 || ""),
  "_x3x_": (process.env.CDN_URL3 || ""),
  "_x4x_": (process.env.CDN_URL4 || ""),
  "_x5x_": (process.env.CDN_URL5 || ""),
  "_x6x_": (process.env.CDN_URL6 || ""),
};

export default async function handler(req) {
  try {
	// check addr
    const res = new Headers();
    let caddr = null;
    for (const [k, v] of req.headers) {
	  const headers_find = new Set(["x-forwarded-host", "x-forwarded-proto", "x-forwarded-port", "proxy-authenticate", "proxy-authorization", "te", "trailer", "transfer-encoding", "upgrade", "forwarded", "host", "connection", "keep-alive"]);
      if (headers_find.has(k)) continue; if (k.startsWith("x-vercel-")) continue;
      if (k === "x-real-ip") { caddr = v; continue; }
      if (k === "x-forwarded-for") { if (!caddr) caddr = v; continue; }
      res.set(k, v);
    }
    if (caddr) res.set("x-forwarded-for", caddr);

    const method = req.method;
    const hasBody = method !== "GET" && method !== "HEAD";

    const urlObj = new URL(req.url);
    const path = urlObj.pathname;

    const match = path.match(/_x(\d)x_/);
    const suffix = match ? `_x${match[1]}x_` : "_x1x_";

    const cdn_url = CDN_MAP[suffix] || CDN_MAP["_x1x_"];

    let targetPath = path;
    if (match) {
      targetPath = path.replace(suffix, "");
    }

    const baseIndex = targetPath.indexOf("/udp-sz");
    const finalPath =
      baseIndex === -1 ? "/" : targetPath.slice(baseIndex);
	
    const url = cdn_url + finalPath + urlObj.search;

	return await fetch(url, {
	  method,
	  headers: res,
	  body: hasBody ? req.body : undefined,
	  duplex: "half",
	  redirect: "manual",
	});
  } catch (err) {
    console.error("CDN Error:", err);
    return new Response("Error 502: Bad Gateway! ", { status: 502 });
  }
}
