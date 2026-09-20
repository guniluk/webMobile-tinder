import User from '../models/user.model.js';
import { getReceiverSocketId, getIO } from '../socket/socket.server.js';

export const swipeRight = async (req, res) => {
  try {
    const { likedUserId } = req.params;
    const currentUserId = req.user._id.toString();

    if (currentUserId === likedUserId) {
      return res
        .status(400)
        .json({ success: false, message: 'Cannot swipe on yourself' });
    }

    const currentUser = await User.findById(currentUserId).select('-password');
    const likedUser = await User.findById(likedUserId).select('-password');

    if (!currentUser || !likedUser) {
      return res
        .status(404)
        .json({ success: false, message: 'User or liked user not found' });
    }

    const alreadyLiked = currentUser.likes.some(
      (id) => id.toString() === likedUserId,
    );

    if (!alreadyLiked) {
      currentUser.likes.push(likedUserId);

      // Check if it's a mutual match
      const isMutualMatch = likedUser.likes.some(
        (id) => id.toString() === currentUserId,
      );

      if (isMutualMatch) {
        const alreadyMatched = currentUser.matches.some(
          (id) => id.toString() === likedUserId,
        );

        if (!alreadyMatched) {
          currentUser.matches.push(likedUserId);
          likedUser.matches.push(currentUser._id);

          await Promise.all([currentUser.save(), likedUser.save()]);

          // Realtime notification to likedUser via webSocket (supports multi-device)
          try {
            const io = getIO();
            io.to(likedUserId.toString()).emit('newMatch', {
              _id: currentUser._id,
              name: currentUser.name,
              image: currentUser.image,
            });
          } catch (socketError) {
            console.log('Socket emit error on match:', socketError.message);
          }
        } else {
          await currentUser.save();
        }
      } else {
        await currentUser.save();
      }
    }

    return res.status(200).json({
      success: true,
      user: currentUser,
    });
  } catch (error) {
    console.error('Error in swipeRight:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const swipeLeft = async (req, res) => {
  try {
    const { dislikedUserId } = req.params;
    const currentUserId = req.user._id.toString();

    const currentUser = await User.findById(currentUserId).select('-password');
    if (!currentUser) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const alreadyDisliked = currentUser.dislikes.some(
      (id) => id.toString() === dislikedUserId,
    );

    if (!alreadyDisliked) {
      currentUser.dislikes.push(dislikedUserId);
      await currentUser.save();
    }

    return res.status(200).json({ success: true, user: currentUser });
  } catch (error) {
    console.error('Error in swipeLeft:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getMatches = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('matches', 'name image')
      .lean();

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, matches: user.matches || [] });
  } catch (error) {
    console.error('Error in getMatches:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getUserProfiles = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).lean();

    if (!currentUser) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const excludedIds = [
      currentUser._id,
      ...(currentUser.likes || []),
      ...(currentUser.dislikes || []),
      ...(currentUser.matches || []),
    ];

    const users = await User.find({
      $and: [
        { _id: { $nin: excludedIds } },
        {
          gender:
            currentUser.genderPreference === 'both'
              ? { $in: ['male', 'female'] }
              : currentUser.genderPreference,
        },
        { genderPreference: { $in: [currentUser.gender, 'both'] } },
      ],
    })
      .select('-password')
      .limit(50)
      .lean();

    return res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Error in getUserProfiles:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
