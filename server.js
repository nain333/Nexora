import envConfig from "./src/config/env.config.js";
import seedDevelopmentData from "./src/config/seed.js";
import app from "./src/app.js";

const port = envConfig.port;

async function startServer() {
  if (process.env.NODE_ENV === "development") {
    await seedDevelopmentData();
  }

  app.listen(port, () => {
    console.log(`The app is listening at port: ${port}`);
  });
}

startServer();
