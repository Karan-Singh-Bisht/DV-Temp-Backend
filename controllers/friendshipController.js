const User = require('../models/User');
const Friendship = require('../models/friendshipSchema');
const Contact = require('../models/Contacts');

exports.sendFriendRequest = async (req, res) => {
  const { recipientId } = req.body;
  const requesterId = req.user._id;

  try {
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const contactExists = await Contact.findOne({
      user: requesterId,
      phoneNumber: recipient.phoneNumber
    });

    if (!contactExists) {
      return res.status(400).json({ error: 'User must be in your contacts to send a request.' });
    }

    // Check if there's an existing friendship or pending request
    const existingFriendship = await Friendship.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId }
      ]
    });

    if (existingFriendship) {
      return res.status(400).json({ error: 'Friendship or request already exists.' });
    }

    const friendship = new Friendship({
      requester: requesterId,
      recipient: recipientId
    });

    await friendship.save();
    res.status(200).json({ message: 'Friend request sent.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send friend request.' });
  }
};





exports.respondToRequest = async (req, res) => {
    const { requestId, action } = req.body;
  
    try {
      const friendship = await Friendship.findById(requestId);
      if (!friendship) {
        return res.status(404).json({ error: 'Request not found.' });
      }
  
      if (friendship.recipient.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'You cannot respond to this request.' });
      }
  
      if (action === 'accept') {
        friendship.status = 'accepted';
      } else if (action === 'decline') {
        friendship.status = 'declined';
      } else {
        return res.status(400).json({ error: 'Invalid action.' });
      }
  
      await friendship.save();
      res.status(200).json({ message: `Request ${action}ed successfully.` });
    } catch (error) {
      res.status(500).json({ error: 'Failed to respond to request.' });
    }
  };


  // Unfriend a user
exports.unfriendUser = async (req, res) => {
    const { userId } = req.body;
    const currentUserId = req.user._id;
  
    try {
      const friendship = await Friendship.findOne({
        $or: [
          { requester: currentUserId, recipient: userId },
          { requester: userId, recipient: currentUserId }
        ],
        status: 'accepted'
      });
  
      if (!friendship) {
        return res.status(404).json({ message: 'Friendship not found.' });
      }
  
      await Friendship.deleteOne({ _id: friendship._id });
  
      return res.status(200).json({ message: 'Successfully unfriended the user.' });
    } catch (error) {
      console.error('Error unfriending user:', error);
      return res.status(500).json({ message: 'Failed to unfriend the user.' });
    }
  };
  

  exports.listFriends = async (req, res) => {
    const userId = req.user._id;
  
    try {
      const friends = await Friendship.find({
        $or: [
          { requester: userId, status: 'accepted' },
          { recipient: userId, status: 'accepted' }
        ]
      })
        .populate('requester', 'name username profileImg')
        .populate('recipient', 'name username profileImg');
  
      const friendList = friends.map(friend => {
        const isRequester = friend.requester._id.toString() === userId.toString();
        return isRequester ? friend.recipient : friend.requester;
      });
  
      res.status(200).json(friendList);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch friends.' });
    }
  };
  