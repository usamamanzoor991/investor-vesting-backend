import express from "express";
import transferController from "../controllers/transferController.js";

const router = express.Router();

router.get("/transfer-funds", transferController.transferFunds);
router.get("/health", transferController.health);
router.get("/globalData", transferController.globalData);
router.get("/funderPublicKey", transferController.funderPublicKey);
router.post("/addInvestor", transferController.addInvestor);
router.get("/getAllInvestors", transferController.getAllInvestors);

export default router;
