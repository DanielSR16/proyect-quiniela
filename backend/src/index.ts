import { app } from "./app.js";
import { config } from "./lib/config.js";

app.listen(config.port, () => {
  console.log(`API de la quiniela en http://localhost:${config.port}`);
});
