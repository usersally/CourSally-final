import { Router } from "express";
import {
  getConversations,
  getThread,
  getPartnerPreview,
  sendMessage,
} from "../handlers/message.js";
import { CheckAuth } from "../middlewares/auth.js";
import {
  validateBodySchema,
  validateParamsSchema,
} from "../middlewares/validations.js";
import { sendMessageSchema, threadParamsSchema } from "../validation/message.js";

const messageRouter = Router();

messageRouter.use(CheckAuth);
messageRouter.get("/conversations", getConversations);
messageRouter.get(
  "/partner/:userId",
  validateParamsSchema(threadParamsSchema),
  getPartnerPreview,
);
messageRouter.get(
  "/thread/:userId",
  validateParamsSchema(threadParamsSchema),
  getThread,
);
messageRouter.post("/", validateBodySchema(sendMessageSchema), sendMessage);

export default messageRouter;
