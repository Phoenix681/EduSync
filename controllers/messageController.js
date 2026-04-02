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