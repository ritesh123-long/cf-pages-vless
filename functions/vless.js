export async function onRequest(context) {
  const { request } = context;

  if (request.headers.get("Upgrade") !== "websocket") {
    return new Response("VLESS WS OK", { status: 200 });
  }

  const uuid = context.env.UUID || "11111111-2222-3333-4444-555555555555";
  const pair = new WebSocketPair();
  const [client, server] = Object.values(pair);

  server.accept();

  server.addEventListener("message", async (event) => {
    const data = new Uint8Array(event.data);

    // Basic UUID check (lightweight)
    const user = data.slice(1, 17)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (!uuid.replace(/-/g, "").startsWith(user)) {
      server.close();
      return;
    }

    // Echo style forward (Edge limitation)
    server.send(data.slice(17));
  });

  return new Response(null, {
    status: 101,
    webSocket: client
  });
}
