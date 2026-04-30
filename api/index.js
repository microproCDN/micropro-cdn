export const config = { runtime: "edge" };

const CDN_URL1 = process.env.CDN_URL1;
const CDN_URL2 = process.env.CDN_URL2;
const CDN_URL3 = process.env.CDN_URL3;
const CDN_URL4 = process.env.CDN_URL4;
const CDN_URL5 = process.env.CDN_URL5;
const CDN_URL6 = process.env.CDN_URL6;

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

    const sfind = req.url.indexOf("/udp-sz");
	const sfind2 = req.url.slice(req.url.indexOf("_"));

	let url = "";
	let cdn_url = CDN_URL1;
	if(sfind2 == '_2') cdn_url = CDN_URL1;
	if(sfind2 == '_3') cdn_url = CDN_URL1;
	if(sfind2 == '_4') cdn_url = CDN_URL1;
	if(sfind2 == '_5') cdn_url = CDN_URL1;
	if(sfind2 == '_6') cdn_url = CDN_URL1;
	
	url = (sfind === -1 ? cdn_url + "/" : cdn_url + (sfind2 != '' ? req.url.slice(sfind).replace(sfind2,"") : req.url.slice(sfind)));
	
	if(url != "") {
		return await fetch(url, {
		  method,
		  headers: res,
		  body: hasBody ? req.body : undefined,
		  duplex: "half",
		  redirect: "manual",
		});
	}
  } catch (err) {
    console.error("CDN Error:", err);
    return new Response("Error 502: Bad Gateway!", { status: 502 });
  }
}
