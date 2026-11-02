import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// Explicit paths let the deployment tracer include each file in the function.
const assets = {
  "swagger-ui.css": require.resolve("swagger-ui-dist/swagger-ui.css"),
  "swagger-ui-bundle.js":
    require.resolve("swagger-ui-dist/swagger-ui-bundle.js"),
  "swagger-ui-standalone-preset.js":
    require.resolve("swagger-ui-dist/swagger-ui-standalone-preset.js"),
  "favicon-16x16.png": require.resolve("swagger-ui-dist/favicon-16x16.png"),
  "favicon-32x32.png": require.resolve("swagger-ui-dist/favicon-32x32.png"),
};

export function registerSwaggerAssets(app) {
  for (const [name, filename] of Object.entries(assets)) {
    app.get(`/swagger/${name}`, (req, res, next) => {
      res.sendFile(filename, (error) => {
        if (error) next(error);
      });
    });
  }
}
