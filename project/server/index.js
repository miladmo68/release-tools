import { createApp } from "./app.js";
import { createJsonRepository } from "./repositories/jsonRepository.js";
import { createMongoRepository } from "./repositories/mongoRepository.js";

const repository = process.env.MONGODB_URI
  ? await createMongoRepository(process.env.MONGODB_URI)
  : createJsonRepository();
const port = Number(process.env.PORT || 3001);
createApp(repository).listen(port, () => console.log(`Sable & Sky API listening on ${port}`));
