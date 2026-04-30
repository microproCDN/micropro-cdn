export const config = { runtime: "edge" };

const CDN_URL1 = (process.env.CDN_URL1 || "");
const CDN_URL2 = (process.env.CDN_URL2 || "");
const CDN_URL3 = (process.env.CDN_URL3 || "");
const CDN_URL4 = (process.env.CDN_URL4 || "");
const CDN_URL5 = (process.env.CDN_URL5 || "");
const CDN_URL6 = (process.env.CDN_URL6 || "");

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

    const sfind = req.url.indexOf("/", 8);
	const sfind2 = req.url.slice(req.url.indexOf("_"));

	let url = null;
	if(sfind2 == '_1' || sfind2 == '') url = (sfind === -1 ? CDN_URL1 + "/" : CDN_URL1 + req.url.slice(sfind).replace(sfind2,""));
	if(sfind2 == '_2') url = (sfind === -1 ? CDN_URL2 + "/" : CDN_URL2 + req.url.slice(sfind).replace(sfind2,""));
	if(sfind2 == '_3') url = (sfind === -1 ? CDN_URL3 + "/" : CDN_URL3 + req.url.slice(sfind).replace(sfind2,""));
	if(sfind2 == '_4') url = (sfind === -1 ? CDN_URL4 + "/" : CDN_URL4 + req.url.slice(sfind).replace(sfind2,""));
	if(sfind2 == '_5') url = (sfind === -1 ? CDN_URL5 + "/" : CDN_URL5 + req.url.slice(sfind).replace(sfind2,""));
	if(sfind2 == '_6') url = (sfind === -1 ? CDN_URL6 + "/" : CDN_URL6 + req.url.slice(sfind).replace(sfind2,""));
	
	if(url) {
		return await fetch(url, {
		  method,
		  headers: res,
		  body: hasBody ? req.body : undefined,
		  duplex: "half",
		  redirect: "manual",
		});
	}
  } catch (err) {
	  //TODO: add logs
  }
}
