const User = require("../models/User");
const Friendship = require("../models/friendshipSchema");
const Contact = require("../models/Contacts");
const mongoose = require("mongoose");
const { createNotification } = require("../controllers/NotificationUser");
const NotificationUser = require("../models/NotificationUser");
// Send a friend request
exports.sendFriendRequest = async (req, res) => {
  const { recipientId } = req.params;
  const requesterId = req.user._id;

  try {
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: "User not found." });
    }

    const contactExists = await Contact.findOne({
      user: requesterId,
      phoneNumber: recipient.phoneNumber,
    });
    if (!contactExists) {
      return res
        .status(400)
        .json({ error: "User must be in your contacts to send a request." });
    }

    const existingFriendship = await Friendship.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId },
      ],
    });

    if (existingFriendship) {
      if (existingFriendship.status === "pending") {
        return res
          .status(400)
          .json({ error: "Friend request already sent and is pending." });
      } else if (existingFriendship.status === "accepted") {
        return res
          .status(400)
          .json({ error: "You are already friends with this user." });
      } else if (existingFriendship.status === "declined") {
        existingFriendship.status = "pending";
        existingFriendship.updatedAt = Date.now();
        await existingFriendship.save();

        return res.status(200).json({ message: "Friend request re-sent." });
      }
    }

    const friendship = new Friendship({
      requester: requesterId,
      recipient: recipientId,
      status: "pending",
    });

    const sendFriendRequest = await friendship.save();

    if (sendFriendRequest) {
      res.status(200).json({ message: "Friend request sent successfully." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to send friend request." });
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
      status: "pending",
    });

    if (!friendship) {
      return res.status(404).json({
        error: "Friend request not found or already accepted/declined.",
      });
    }

    friendship.status = "accepted";
    friendship.acceptedAt = Date.now();
    const savedStatus = await friendship.save();

    if (savedStatus) {
      const updatedNotification = await NotificationUser.findOneAndUpdate(
        {
          userId: recipientId,
          "notifications.sender": userId,
          "notifications.type": "request", // Optionally filter by type
        },
        { $set: { "notifications.$.type": "looped" } },
        { new: true } // Return the updated document
      );
      if (updatedNotification) {
        const sendNotification = await createNotification(
          userId,
          recipientId,
          "accept",
          `${req.user.name} is accept You`
        );
        if (sendNotification) {
          res.status(200).json({ message: "Friend request accepted." });
        }
      }
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Failed to accept friend request." });
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
      status: "pending",
    });

    if (!friendship) {
      return res.status(404).json({
        error: "Friend request not found or already accepted/declined.",
      });
    }

    friendship.status = "declined";
    friendship.updatedAt = Date.now();
    const savedStatus = await friendship.save();

    if (savedStatus) {
      const updatedNotification = await NotificationUser.findOneAndUpdate(
        { userId: recipientId },
        {
          $pull: {
            notifications: { sender: userId, type: "request" },
          },
        },
        { new: true } // Returns the updated document
      );
      if (updatedNotification) {
        const sendNotification = await createNotification(
          userId,
          recipientId,
          "declined",
          `${req.user.name} is declined You`
        );
        if (sendNotification) {
          res.status(200).json({ message: "Friend request declined." });
        }
      }

      res.status(200).json({ message: "Friend request declined." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to decline friend request." });
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
        { requester: userId, recipient: requesterId },
      ],
    });

    if (!friendship) {
      return res.status(200).json({ status: "none" });
    }

    res.status(200).json({ status: friendship.status });
  } catch (error) {
    res.status(500).json({ error: "Failed to check friendship status." });
  }
};

// List all friends of the current user
exports.listFriends = async (req, res) => {
  const userId = req.user._id;

  console.log(userId);

  try {
    const friendships = await Friendship.find({
      $or: [
        { requester: userId, status: "accepted" },
        { recipient: userId, status: "accepted" },
      ],
    }).populate("requester recipient", " name username profileImg");

    console.log(friendships);
    const friends = friendships.map((friendship) => {
      const friend = friendship.requester._id.equals(userId)
        ? friendship.recipient
        : friendship.requester;

      return {
        _id: friend._id,
        requesterId: friendship.requester._id,
        name: friend.name,
        username: friend.username,
        profileImg: friend.profileImg,
      };
    });

    res.status(200).json({ data: friends, message: "data fecth" });
  } catch (error) {
    console.error("Error retrieving friends list:", error.message);
    res.status(500).json({ error: "Failed to retrieve friends list." });
  }
};

// Unfriend a user
exports.unfriendUser = async (req, res) => {
  const { userId } = req.params;
  const requesterId = req.user._id;

  try {
    const friendship = await Friendship.findOneAndDelete({
      $or: [
        { requester: requesterId, recipient: userId, status: "accepted" },
        { requester: userId, recipient: requesterId, status: "accepted" },
      ],
    });

    if (!friendship) {
      return res.status(404).json({ error: "Friendship not found." });
    }

    res.status(200).json({ message: "Friendship removed." });
  } catch (error) {
    res.status(500).json({ error: "Failed to unfriend user." });
  }
};

// Get incoming friend requests
exports.getIncomingFriendRequests = async (req, res) => {
  const userId = req.user._id;

  try {
    const friendRequests = await Friendship.find({
      recipient: userId,
      status: "pending",
    }).populate("requester", "name username profileImg");

    const requests = friendRequests.map((request) => ({
      id: request._id,
      requesterId: request.requester._id,
      name: request.requester.name,
      username: request.requester.username,
      profileImg: request.requester.profileImg,
      createdAt: request.createdAt,
    }));

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve friend requests." });
  }
};

// Handle both sending friend request and unfriending
exports.handleFriendRequestOrUnfriend = async (req, res) => {
  const { recipientId } = req.params;
  const requesterId = req.user._id;

  try {
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: "User not found." });
    }

    const contactExists = await Contact.findOne({
      user: requesterId,
      phoneNumber: recipient.phoneNumber,
    });

    //note this may be change
    //   if (!contactExists) {
    //       return res.status(400).json({ error: 'User must be in your contacts to send a request.' });
    //   }

    const existingFriendship = await Friendship.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId },
      ],
    });

    //evde onn nottam vecho..
    if (existingFriendship) {
      if (existingFriendship.status === "pending") {
        return res
          .status(400)
          .json({ error: "Friend request already sent and is pending." });
      } else if (existingFriendship.status === "accepted") {
        await Friendship.findOneAndDelete({
          $or: [
            {
              requester: requesterId,
              recipient: recipientId,
              status: "accepted",
            },
            {
              requester: recipientId,
              recipient: requesterId,
              status: "accepted",
            },
          ],
        });

        return res.status(200).json({ message: "Friendship removed." });
      } else if (existingFriendship.status === "declined") {
        existingFriendship.status = "pending";
        existingFriendship.updatedAt = Date.now();
        await existingFriendship.save();
        return res.status(200).json({ message: "Friend request re-sent." });
      }
    }

    const newFriendship = new Friendship({
      requester: requesterId,
      recipient: recipientId,
      status: "pending",
    });
    const savenewFriend = await newFriendship.save();
    const sendNotification = await createNotification(
      recipientId,
      requesterId,
      "request",
      `${req.user.name} is request You`
    );
    if (sendNotification && savenewFriend) {
      res.status(200).json({ message: "Friend request sent successfully." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to send friend request or unfriend user." });
  }
};

// // Handle both sending friend request and unfriending
// exports.handleFriendRequestOrUnfriend = async (req, res) => {
//     const { recipientId } = req.params;
//     const requesterId = req.user._id;

//     try {

//         const recipient = await User.findById(recipientId);
//         if (!recipient) {
//             return res.status(404).json({ error: 'User not found.' });
//         }

//         const contactExists = await Contact.findOne({
//             user: requesterId,
//             phoneNumber: recipient.phoneNumber
//         });

//         //note this may be change
//       //   if (!contactExists) {
//       //       return res.status(400).json({ error: 'User must be in your contacts to send a request.' });
//       //   }

//         const existingFriendship = await Friendship.findOne({
//             $or: [
//                 { requester: requesterId, recipient: recipientId },
//                 { requester: recipientId, recipient: requesterId }
//             ]
//         });

//       //evde onn nottam vecho..
//         if (existingFriendship) {
//             // if (existingFriendship.status === 'pending') {
//             //     return res.status(400).json({ error: 'Friend request already sent and is pending.' });
//             if (existingFriendship.status === 'accepted' || existingFriendship.status === 'pending') {

//                 await Friendship.findOneAndDelete({
//                     $or: [
//                         { requester: requesterId, recipient: recipientId, status: 'accepted' },
//                         { requester: recipientId, recipient: requesterId, status: 'accepted' }
//                     ]
//                 });

//                 return res.status(200).json({ message: 'Friendship  or Frienship request has been removed.' });
//             } else (existingFriendship.status === 'declined') {

//                 existingFriendship.status = 'pending';
//                 existingFriendship.updatedAt = Date.now();
//                 await existingFriendship.save();
//                 return res.status(200).json({ message: 'Friend request re-sent.' });
//             }
//         }

//         const newFriendship = new Friendship({
//             requester: requesterId,
//             recipient: recipientId,
//             status: 'pending'
//         });

//         await newFriendship.save();
//         res.status(200).json({ message: 'Friend request sent successfully.' });
//     } catch (error) {
//         res.status(500).json({ error: 'Failed to send friend request or unfriend user.' });
//     }
//   };

exports.updateUserBlockEntry = async (req, res) => {
  const { blockpageId } = req.params;

  try {
    const userId = req.user._id;
    // Check if blockpageId is already in the blockedList
    const isBlocked = await Friendship.findOneAndDelete({
      $or: [
        { requester: userId, recipient: blockpageId, status: "blocked" },
        { requester: blockpageId, recipient: userId, status: "blocked" },
      ],
    });

    if (isBlocked) {
      // If the page is already blocked, remove it from the blockedList (unblock)

      return res
        .status(200)
        .json({ success: true, message: "Page unblocked successfully." });
    }
    // else {
    //    res
    //     .status(400)
    //     .json({ success: false, message: "Failed to unblock page." });
    // }

    const addtoBlock = await Friendship.findOneAndUpdate(
      {
        $or: [
          { requester: userId, recipient: blockpageId },
          { requester: blockpageId, recipient: userId },
        ],
      },
      {
        requester: userId,
        recipient: blockpageId,
        status: "blocked",
      },
      {
        new: true, // Return the updated document
        upsert: true, // Create a new document if none matches the query
      }
    );

    // If not blocked, add the blockpageId to the blockedList (block)

    if (addtoBlock) {
      return res
        .status(200)
        .json({ success: true, message: "Page blocked successfully." });
    }

    // If something goes wrong
    return res
      .status(500)
      .json({ success: false, message: "Failed to block page." });
  } catch (error) {
    console.error("Error updating block entry:", error.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred while blocking/unblocking the page.",
    });
  }
};

exports.accountBlockedList = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(userId);
    // Find the document and populate the blocked list
    const blockedUsers = await Friendship.aggregate([
      // Step 1: Match the blocked relationships
      {
        $match: {
          $or: [{ requester: userId }, { recipient: userId }],
          status: "blocked",
        },
      },
      // Step 2: Determine the blocked user's ID
      {
        $project: {
          blockedUserId: {
            $cond: {
              if: { $eq: ["$requester", userId] },
              then: "$recipient",
              else: "$requester",
            },
          },
        },
      },
      // Step 3: Convert blockedUserId to ObjectId
      {
        $addFields: {
          blockedUserId: { $toObjectId: "$blockedUserId" },
        },
      },
      // Step 4: Lookup user details
      {
        $lookup: {
          from: "users", // The name of the User collection
          localField: "blockedUserId", // The field in the current collection
          foreignField: "_id", // The field in the User collection
          as: "blockedUserData", // The field to store the joined data
        },
      },
      // Step 5: Unwind the array created by the lookup
      {
        $unwind: "$blockedUserData",
      },
      // Step 6: Project the final fields
      {
        $project: {
          _id: "$blockedUserData._id", // Exclude the Friendship ID // Include the blocked user ID
          username: "$blockedUserData.username",
          name: "$blockedUserData.name",
          profileImg: "$blockedUserData.profileImg",
        },
      },
    ]);

    if (!blockedUsers) {
      return res
        .status(404)
        .json({ message: "Page not found or no blocked list available." });
    }

    res.status(200).json({
      message: "successfully fetched blocked list available.",
      blockedUsers,
    });
  } catch (error) {
    console.error("Error fetching blocked list:", error.message);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the blocked list." });
  }
};
