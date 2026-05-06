import express from "express";
import transferController from "../controllers/transferController.js";

const router = express.Router();

router.get("/transfer-funds", transferController.transferFunds);

export default router;
