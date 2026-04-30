export const config = { runtime: "edge" };

// Use NEXT_PUBLIC_ or ensure they're injected at build
const CDN_MAP = {
  "_!1!_": process.env.NEXT_PUBLIC_CDN_URL1,
  "_!2!_": process.env.NEXT_PUBLIC_CDN_URL2,
  "_!3!_": process.env.NEXT_PUBLIC_CDN_URL3,
  "_!4!_": process.env.NEXT_PUBLIC_CDN_URL4,
  "_!5!_": process.env.NEXT_PUBLIC_CDN_URL5,
  "_!6!_": process.env.NEXT_PUBLIC_CDN_URL6,
};

export default async function handler(req) {
  try {
    const headers = new Headers();
    let caddr = null;

    const blocked = new Set([
      "x-forwarded-host", "x-forwarded-proto", "x-forwarded-port",
      "proxy-authenticate", "proxy-authorization", "te", "trailer",
      "transfer-encoding", "upgrade", "forwarded", "host",
      "connection", "keep-alive"
    ]);

    for (const [k, v] of req.headers.entries()) {
      if (blocked.has(k)) continue;
      if (k.startsWith("x-vercel-")) continue;

      if (k === "x-real-ip") {
        caddr = v;
        continue;
      }

      if (k === "x-forwarded-for" && !caddr) {
        caddr = v;
        continue;
      }

      headers.set(k, v);
    }

    if (caddr) headers.set("x-forwarded-for", caddr);

    const method = req.method;
    const hasBody = method !== "GET" && method !== "HEAD";

    const urlObj = new URL(req.url);
    const path = urlObj.pathname;

    const match = path.match(/_!(\d)!_/);
    const suffix = match ? `_${match[1]}` : "_!1!_";

    const cdn_url = CDN_MAP[suffix] || CDN_MAP["_!1!_"];

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
      headers,
      body: hasBody ? req.body : undefined,
      redirect: "manual",
    });

  } catch (err) {
    console.error("CDN Error:", err);
    return new Response("Error 502: Bad Gateway!", { status: 502 });
  }
}
