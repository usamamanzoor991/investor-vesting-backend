import express from "express";
import cors from "cors";

const server = express();
server.use(cors());
server.use(express.json());

server.get("/", (req, res) => {
  res.send("Server is running");
});

server.listen(3000, () => {
  console.log("Server started on port 3000");
});
