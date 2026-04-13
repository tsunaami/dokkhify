import express from "express";
import { createPayment, paymentSuccess, paymentFail, paymentCancel } from "../controllers/paymentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


router.post("/init", authMiddleware, createPayment);


router.post("/success", paymentSuccess);
router.post("/fail", paymentFail);
router.post("/cancel", paymentCancel);

export default router;