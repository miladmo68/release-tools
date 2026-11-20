import mongoose from "mongoose";
import { createApp } from "./app.js";
import { mongoIntakeRepository } from "./repositories/mongoIntakeRepository.js";
import { createJsonIntakeRepository } from "./repositories/jsonIntakeRepository.js";

const port = Number(process.env.PORT || 3001);
if (process.env.MONGODB_URI) await mongoose.connect(process.env.MONGODB_URI);
const repository = process.env.MONGODB_URI ? mongoIntakeRepository : createJsonIntakeRepository();
createApp(repository).listen(port, () => console.log(`Repair API listening on ${port}`));
