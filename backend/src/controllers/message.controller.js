import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";

export const sendMessage = async (req, res) => {
  try {
    const { content, receiverId } = req.body;
    if (!content || !receiverId) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const senderId = req.user._id;

    // check if conversation exist between sender and receiver
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      content,
      conversationId: conversation._id,
    });

    //todo : send message in realtime to receiver (webSocket)

    res.status(201).json({ message: "Message sent successfully", newMessage });
  } catch (error) {
    console.log("Error in sendMessage controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const otherUserId = req.params.userId;

    const conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] },
    }).populate("participants", "name email image");

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const messages = await Message.find({
      conversationId: conversation._id,
    })
      .sort({ createdAt: 1 })
      .populate("senderId", "name email image");

    res.status(200).json({ conversation, messages });
  } catch (error) {
    console.log("Error in getConversation controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
