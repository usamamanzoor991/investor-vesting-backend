import express from "express";
import cors from "cors";
import router from "./routes/index.js";
import dotenv from "dotenv";

dotenv.config();
const server = express();
server.use(cors());
server.use(express.json());
server.use(router);

server.listen(3000, () => {
  console.log("Server started on port 3000");
});
