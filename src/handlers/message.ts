import type { Request, Response } from "express";
import mongoose from "mongoose";
import Message from "../models/message.js";
import userModel from "../models/user.js";
import { AuthenticatedRequest } from "../types/express.js";

function getUserId(req: Request): string {
  const authReq = req as AuthenticatedRequest;
  return authReq.user!._id.toString();
}

function toObjectId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

async function assertCanMessage(senderId: string, receiverId: string) {
  if (senderId === receiverId) {
    return { ok: false as const, message: "You cannot message yourself" };
  }

  const [sender, receiver] = await Promise.all([
    userModel.findById(senderId).select("role"),
    userModel.findById(receiverId).select("role"),
  ]);

  if (!receiver) {
    return { ok: false as const, message: "Recipient not found" };
  }

  const pair = `${sender?.role}-${receiver.role}`;
  if (pair !== "student-teacher" && pair !== "teacher-student") {
    return {
      ok: false as const,
      message: "Messages are only allowed between students and teachers",
    };
  }

  return { ok: true as const };
}

export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const userOid = toObjectId(userId);

    const grouped = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId: userOid }, { receiverId: userOid }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          partnerId: {
            $cond: [{ $eq: ["$senderId", userOid] }, "$receiverId", "$senderId"],
          },
        },
      },
      {
        $group: {
          _id: "$partnerId",
          lastMessage: { $first: "$body" },
          lastMessageAt: { $first: "$createdAt" },
          unread: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiverId", userOid] },
                    { $eq: ["$read", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { lastMessageAt: -1 } },
    ]);

    const partnerIds = grouped.map((g) => g._id);
    const partners = await userModel
      .find({ _id: { $in: partnerIds } })
      .select("firstName lastName avatar role email")
      .lean();

    const partnerMap = new Map(
      partners.map((p) => [p._id.toString(), p]),
    );

    const data = grouped.map((g) => {
      const partner = partnerMap.get(g._id.toString());
      return {
        partnerId: g._id.toString(),
        partner: partner
          ? {
              _id: partner._id.toString(),
              firstName: partner.firstName,
              lastName: partner.lastName,
              avatar: partner.avatar,
              role: partner.role,
              email: partner.email,
            }
          : null,
        lastMessage: g.lastMessage as string,
        lastMessageAt: g.lastMessageAt,
        unread: g.unread as number,
      };
    });

    res.json({ success: true, data });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to load conversations";
    res.status(500).json({ success: false, message });
  }
};

export const getThread = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const partnerId = String(req.params.userId);

    const allowed = await assertCanMessage(userId, partnerId);
    if (!allowed.ok) {
      res.status(400).json({ success: false, message: allowed.message });
      return;
    }

    const userOid = toObjectId(userId);
    const partnerOid = toObjectId(partnerId);

    const messages = await Message.find({
      $or: [
        { senderId: userOid, receiverId: partnerOid },
        { senderId: partnerOid, receiverId: userOid },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    await Message.updateMany(
      { senderId: partnerOid, receiverId: userOid, read: false },
      { $set: { read: true } },
    );

    res.json({
      success: true,
      data: messages.map((m) => ({
        _id: m._id.toString(),
        senderId: m.senderId.toString(),
        receiverId: m.receiverId.toString(),
        body: m.body,
        read: m.read,
        createdAt: m.createdAt,
      })),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to load messages";
    res.status(500).json({ success: false, message });
  }
};

export const getPartnerPreview = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const partnerId = String(req.params.userId);

    const allowed = await assertCanMessage(userId, partnerId);
    if (!allowed.ok) {
      res.status(400).json({ success: false, message: allowed.message });
      return;
    }

    const partner = await userModel
      .findById(partnerId)
      .select("firstName lastName avatar role email")
      .lean();

    if (!partner) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    res.json({
      success: true,
      data: {
        _id: partner._id.toString(),
        firstName: partner.firstName,
        lastName: partner.lastName,
        avatar: partner.avatar,
        role: partner.role,
        email: partner.email,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to load user";
    res.status(500).json({ success: false, message });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { receiverId, body } = req.body;

    const allowed = await assertCanMessage(userId, receiverId);
    if (!allowed.ok) {
      res.status(400).json({ success: false, message: allowed.message });
      return;
    }

    const message = await Message.create({
      senderId: userId,
      receiverId,
      body: body.trim(),
    });

    res.status(201).json({
      success: true,
      data: {
        _id: message._id.toString(),
        senderId: message.senderId.toString(),
        receiverId: message.receiverId.toString(),
        body: message.body,
        read: message.read,
        createdAt: message.createdAt,
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to send message";
    res.status(500).json({ success: false, message });
  }
};
