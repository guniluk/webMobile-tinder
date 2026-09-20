import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';
import { getReceiverSocketId, getIO } from '../socket/socket.server.js';

export const sendMessage = async (req, res) => {
  try {
    const { content, receiverId } = req.body;
    if (!content || !receiverId) {
      return res.status(400).json({ message: 'All fields are required' });
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

    // Send message in realtime to receiver (webSocket multi-device support)
    try {
      const io = getIO();
      io.to(receiverId.toString()).emit('newMessage', newMessage);
    } catch (socketError) {
      console.log('Socket emit error:', socketError.message);
    }

    res.status(201).json({ message: 'Message sent successfully', newMessage });
  } catch (error) {
    console.log('Error in sendMessage controller', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getConversation = async (req, res) => {
  try {
    const userId = req.user._id;
    const otherUserId = req.params.userId;

    const conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] },
    })
      .populate('participants', 'name email image')
      .lean();

    if (!conversation) {
      return res.status(200).json({ conversation: null, messages: [] });
    }

    const messages = await Message.find({
      conversationId: conversation._id,
    })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name email image')
      .lean();

    res.status(200).json({ conversation, messages });
  } catch (error) {
    console.error('Error in getConversation controller:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
