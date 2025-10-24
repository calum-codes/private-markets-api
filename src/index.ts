import * as http from "http";
import { handler } from "./api/handlers";
import { logService } from "./services/log-service";

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url || "/", `http://${req.headers.host}`);

  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    const request = {
      method: req.method || "GET",
      rawPath: parsedUrl.pathname || "/",
      headers: req.headers,
      body,
    };

    try {
      const response = await handler(request);

      res.writeHead(response.statusCode, {
        ...response.headers,
      });

      res.end(response.body);
    } catch (err) {
      logService.error("Internal Server Error in http.createServer");
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Internal Server Error" }));
    }
  });
});

server.listen(3000, () => {
  logService.log("Server listening on http://localhost:3000");
});
