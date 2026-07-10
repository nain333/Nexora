import swaggerUi from "swagger-ui-express";
import openApiDocument from "../docs/openapi.json" with { type: "json" };

export function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve);

  app.get("/api-docs", swaggerUi.setup(openApiDocument));
}
