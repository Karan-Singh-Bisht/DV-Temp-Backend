const User = require('../models/User');
const Friendship = require('../models/friendshipSchema');
const Contact = require('../models/Contacts');

// // Send a friend request
// exports.sendFriendRequest = async (req, res) => {
//     const { recipientId } = req.params;
//     const requesterId = req.user._id;
  
//     try {
      
//       const recipient = await User.findById(recipientId);
//       if (!recipient) {
//         return res.status(404).json({ error: 'User not found.' });
//       }
  
      
//       const contactExists = await Contact.findOne({
//         user: requesterId,
//         phoneNumber: recipient.phoneNumber
//       });
//       if (!contactExists) {
//         return res.status(400).json({ error: 'User must be in your contacts to send a request.' });
//       }
  
      
//       const existingFriendship = await Friendship.findOne({
//         $or: [
//           { requester: requesterId, recipient: recipientId },
//           { requester: recipientId, recipient: requesterId }
//         ]
//       });
  
//       if (existingFriendship) {
//         return res.status(400).json({ error: 'Friendship or request already exists.' });
//       }
  
     
//       const friendship = new Friendship({
//         requester: requesterId,
//         recipient: recipientId
//       });
  
//       await friendship.save();
//       res.status(200).json({ message: 'Friend request sent.' });
//     } catch (error) {
//       res.status(500).json({ error: 'Failed to send friend request.' });
//     }
//   };


// Send a friend request
exports.sendFriendRequest = async (req, res) => {
  const { recipientId } = req.params;
  const requesterId = req.user._id;

  try {
      // Check if recipient user exists
      const recipient = await User.findById(recipientId);
      if (!recipient) {
          return res.status(404).json({ error: 'User not found.' });
      }

      // Check if the recipient is in the requester's contacts
      const contactExists = await Contact.findOne({
          user: requesterId,
          phoneNumber: recipient.phoneNumber
      });
      if (!contactExists) {
          return res.status(400).json({ error: 'User must be in your contacts to send a request.' });
      }

      // Find any existing friendship between the two users
      const existingFriendship = await Friendship.findOne({
          $or: [
              { requester: requesterId, recipient: recipientId },
              { requester: recipientId, recipient: requesterId }
          ]
      });

      // If a friendship exists, check its status
      if (existingFriendship) {
          if (existingFriendship.status === 'pending') {
              return res.status(400).json({ error: 'Friend request already sent and is pending.' });
          } else if (existingFriendship.status === 'accepted') {
              return res.status(400).json({ error: 'You are already friends with this user.' });
          } else if (existingFriendship.status === 'declined') {
              // If the previous request was declined, update it to 'pending' again
              existingFriendship.status = 'pending';
              existingFriendship.updatedAt = Date.now();
              await existingFriendship.save();
              return res.status(200).json({ message: 'Friend request re-sent.' });
          }
      }

      // If no friendship exists, create a new friend request
      const friendship = new Friendship({
          requester: requesterId,
          recipient: recipientId,
          status: 'pending' // New request is pending by default
      });

      // Save the new friendship
      await friendship.save();
      res.status(200).json({ message: 'Friend request sent successfully.' });
  } catch (error) {
      res.status(500).json({ error: 'Failed to send friend request.' });
  }
};






  
  // Accept a friend request by userId (requester)
exports.acceptFriendRequest = async (req, res) => {
  const { userId } = req.params;
  const recipientId = req.user._id;
  try {
      
      const friendship = await Friendship.findOne({
          requester: userId,
          recipient: recipientId,
          status: 'pending'
      });

      if (!friendship) {
          return res.status(404).json({ error: 'Friend request not found or already accepted/declined.' });
      }

      
      friendship.status = 'accepted';
      friendship.acceptedAt = Date.now();
      await friendship.save();

      res.status(200).json({ message: 'Friend request accepted.' });
  } catch (error) {
      res.status(500).json({ error: 'Failed to accept friend request.' });
  }
};


// Decline a friend request by userId (requester)
exports.declineFriendRequest = async (req, res) => {
  const { userId } = req.params;
  const recipientId = req.user._id; 

  try {
      
      const friendship = await Friendship.findOne({
          requester: userId,
          recipient: recipientId,
          status: 'pending'
      });

      if (!friendship) {
          return res.status(404).json({ error: 'Friend request not found or already accepted/declined.' });
      }

     
      friendship.status = 'declined';
      friendship.updatedAt = Date.now();
      await friendship.save();

      res.status(200).json({ message: 'Friend request declined.' });
  } catch (error) {
      res.status(500).json({ error: 'Failed to decline friend request.' });
  }
};


// Check friendship status
exports.checkFriendshipStatus = async (req, res) => {
  const { userId } = req.params;
  const requesterId = req.user._id;

  try {
      const friendship = await Friendship.findOne({
          $or: [
              { requester: requesterId, recipient: userId },
              { requester: userId, recipient: requesterId }
          ]
      });

      if (!friendship) {
          return res.status(200).json({ status: 'none' });
      }

      res.status(200).json({ status: friendship.status });
  } catch (error) {
      res.status(500).json({ error: 'Failed to check friendship status.' });
  }
};



// List all friends of the current user
exports.listFriends = async (req, res) => {
  const userId = req.user._id;

  try {
      const friendships = await Friendship.find({
          $or: [
              { requester: userId, status: 'accepted' },
              { recipient: userId, status: 'accepted' }
          ]
      }).populate('requester recipient', 'name username profileImg');

      const friends = friendships.map(friendship => {
          const friend = friendship.requester._id.toString() === userId.toString()
              ? friendship.recipient
              : friendship.requester;
          return {
              id: friend._id,
              name: friend.name,
              username: friend.username,
              profileImg: friend.profileImg
          };
      });

      res.status(200).json(friends);
  } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve friends list.' });
  }
};


// Unfriend a user
exports.unfriendUser = async (req, res) => {
  const { userId } = req.params;
  const requesterId = req.user._id;

  try {
      const friendship = await Friendship.findOneAndDelete({
          $or: [
              { requester: requesterId, recipient: userId, status: 'accepted' },
              { requester: userId, recipient: requesterId, status: 'accepted' }
          ]
      });

      if (!friendship) {
          return res.status(404).json({ error: 'Friendship not found.' });
      }

      res.status(200).json({ message: 'Friendship removed.' });
  } catch (error) {
      res.status(500).json({ error: 'Failed to unfriend user.' });
  }
};



// Get incoming friend requests
exports.getIncomingFriendRequests = async (req, res) => {
  const userId = req.user._id;

  try {
      const friendRequests = await Friendship.find({
          recipient: userId,
          status: 'pending'
      }).populate('requester', 'name username profileImg');

      const requests = friendRequests.map(request => ({
          id: request._id,
          name: request.requester.name,
          username: request.requester.username,
          profileImg: request.requester.profileImg,
          createdAt: request.createdAt
      }));

      res.status(200).json(requests);
  } catch (error) {
      res.status(500).json({ error: 'Failed to retrieve friend requests.' });
  }
};
