import asyncHandler from "express-async-handler"
import Message from "../models/messageModel.js"

export const getChatHistory = asyncHandler(async(req,res)=>{
    const {targetUserId } = req.params;
    const currentUserId = req.user._id;

    const messages = await Message.find({
        $or: [
            { sender: currentUserId, receiver: targetUserId },
            { sender: targetUserId, receiver: currentUserId },
        ],
    }).sort({createdAt : 1});

    res.status(200).json(messages);
});

// @desc    Get total unread message count for logged-in user
// @route   GET /api/messages/unread-count
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Message.countDocuments({
    receiver: req.user._id,
    isRead: false
  });
  res.json({ count });
});

// @desc    Mark all messages from a specific sender as read
// @route   PUT /api/messages/mark-read/:senderId
export const markMessagesAsRead = asyncHandler(async (req, res) => {
  await Message.updateMany(
    { sender: req.params.senderId, receiver: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );
  res.json({ message: 'Messages marked as read' });
});