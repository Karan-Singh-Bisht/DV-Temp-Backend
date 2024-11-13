const User = require("../models/User");
const { signToken } = require("../utils/jwtUtils");
const TokenBlacklist = require("../models/TokenBlacklist");
const Pages = require("../models/Pages/PagesModel");
const Friendship = require("../models/friendshipSchema");

// Get all users without relationships
exports.getUsers = async function (req, res) {
  try {
    // Check if the user ID is available in the request
    if (!req.user || !req.user.id) {
      return res.status(400).json({ message: "User ID is missing in the request." });
    }

    const userId = req.user.id;

    // Fetch the current user details
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: "Current user not found." });
    }

    // Fetch all users
    const users = await User.find();

    // Use aggregation to get only the blocked user IDs
    const blockedUserIds = await Friendship.aggregate([
      {
        $match: {
          $or: [{ requester: userId }, { recipient: userId }],
          status: 'blocked'
        }
      },
      {
        $project: {
          blockedUserId: {
            $cond: {
              if: { $eq: ["$requester", userId] },
              then: "$recipient",
              else: "$requester"
            }
          }
        }
      }
    ]).then(results => results.map(result => result.blockedUserId.toString()));
    console.log(blockedUserIds)

    // Filter out blocked users from the list of users
    const userResponses = users
      .filter((user) => !blockedUserIds.includes(user._id.toString()))
      .map((user) => ({
        userId: user._id,
        name: user.name,
        username: user.username,
        profileImg: user.profileImg,
        gender: user.gender,
        dob: user.dob,
        phoneNumber: user.phoneNumber,
        mailAddress: user.mailAddress,
        bio: user.bio,
        link: user.link,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        bgColor: user.bgColor,
        isPrivate: user.isPrivate,
      }));

    // Send the response
    res.json(userResponses);
  } catch (err) {
    // Send error response
    res.status(500).json({ message: err.message });
  }
};


exports.getUserById = async function (req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const currentUser = await User.findById(req.user._id);
    const userPages = await Pages.find(
      { userId: req.user._id },
      { pageName: 1, profileImg: 1, profileBackground: 1 }
    );

    let friendshipStatus = "none";

    if (currentUser) {
      const friendship = await Friendship.findOne({
        $or: [
          { requester: req.user._id, recipient: req.params.id },
          { requester: req.params.id, recipient: req.user._id },
        ],
      });

      if (friendship) {
        if (friendship.status === "accepted") {
          friendshipStatus = "looped";
        } else if (friendship.status === "pending") {
          friendshipStatus = "requested";
        }
      }

      const userResponse = {
        userId: user._id,
        name: user.name,
        username: user.username,
        profileImg: user.profileImg,
        gender: user.gender,
        dob: user.dob,
        phoneNumber: user.phoneNumber,
        mailAddress: user.mailAddress,
        bio: user.bio,
        link: user.link,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        bgColor: user.bgColor,
        isPrivate: user.isPrivate,
        pages: userPages,
        friendshipStatus,
      };

      res.json(userResponse);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// // Search users by name without relationships
// exports.searchUsersByName = async function (req, res) {
//   const searchTerm = req.query.name;
//   if (!searchTerm) {
//     return res
//       .status(400)
//       .json({ message: "Name query parameter is required" });
//   }

//   try {
//     const users = await User.find({
//       $or: [
//         { name: { $regex: `^${searchTerm}`, $options: "i" } },
//         { username: { $regex: `^${searchTerm}`, $options: "i" } },
//       ],
//     });

//     const currentUser = await User.findById(req.user.id);
//     const blockedUsers = currentUser
//       ? currentUser.blockedUsers.map((id) => id.toString())
//       : [];

//     const filteredUsers = users.filter(
//       (user) =>
//         !blockedUsers.includes(user._id.toString()) &&
//         user._id.toString() !== req.user.id
//     );

//     if (filteredUsers.length === 0) {
//       return res.status(404).json({ message: "No users found" });
//     }

//     const userResponses = filteredUsers.map((user) => ({
//       userId: user._id,
//       name: user.name,
//       username: user.username,
//       profileImg: user.profileImg,
//       gender: user.gender,
//       dob: user.dob,
//       phoneNumber: user.phoneNumber,
//       mailAddress: user.mailAddress,
//       bio: user.bio,
//       link: user.link,
//       createdAt: user.createdAt,
//       updatedAt: user.updatedAt,
//       bgColor: user.bgColor,
//       isPrivate: user.isPrivate,
//     }));

//     res.json(userResponses);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

//logout
exports.signoutUser = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    await TokenBlacklist.create({ token });

    res.status(200).json({ message: "Successfully signed out" });
  } catch (err) {
    console.error("Error signing out:", err);
    res.status(500).json({ message: "Error signing out" });
  }
};

exports.signupUser = async function (req, res) {
  const {
    phoneNumber,
    name,
    username,
    gender,
    dob,
    mailAddress,
    bio,
    link,
    profileImg,
    bgColor,
  } = req.body;

  try {
    let existingUser = await User.findOne({ phoneNumber }).populate("pages");

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists. Please log in." });
    }

    const user = new User({
      name,
      username,
      gender,
      dob,
      phoneNumber,
      mailAddress,
      bio,
      link,
      profileImg,
      bgColor,
    });

    await user.save();
    const token = signToken(user._id);

    const userResponse = {
      token,
      userId: user._id,
      name: user.name,
      username: user.username,
      gender: user.gender,
      dob: user.dob,
      phoneNumber: user.phoneNumber,
      mailAddress: user.mailAddress,
      bio: user.bio,
      link: user.link,
      profileImg: user.profileImg,
      // createdAt: user.createdAt,
      // updatedAt: user.updatedAt,
      isPrivate: user.isPrivate,
      bgColor: user.bgColor,
    };

    return res.status(201).send(userResponse);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
exports.loginUser = async function (req, res) {
  const { phoneNumber } = req.body;

  try {
    // Query to fetch the user by phoneNumber
    const user = await User.findOne({ phoneNumber });

    // Check if user exists
    if (user) {
      const token = signToken(user._id);

      const userPages = await Pages.find(
        { userId: user._id },
        { pageName: 1, profileImg: 1, profileBackground: 1 }
      );

      // Construct the response
      const userResponse = {
        token,
        userId: user._id,
        name: user.name,
        username: user.username,
        gender: user.gender,
        dob: user.dob,
        phoneNumber: user.phoneNumber,
        mailAddress: user.mailAddress,
        bio: user.bio,
        link: user.link,
        profileImg: user.profileImg,
        //createdAt: user.createdAt,
        //updatedAt: user.updatedAt,
        bgColor: user.bgColor,
        isPrivate: user.isPrivate,
        pages: userPages, // Include pages with pageName and profileImg if available
      };

      return res.status(200).json(userResponse);
    } else {
      return res.status(404).json({ userExists: false, phoneNumber });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.updateUser = async function (req, res) {
  try {
    const { name, gender, dob, bio, profileImg, link, bgColor, isPrivate } =
      req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        gender,
        dob,
        bio,
        profileImg,
        link,
        updatedAt: Date.now(),
        isPrivate,
        bgColor,
      },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    const userResponse = {
      userId: user._id,
      name: user.name,
      username: user.username,
      gender: user.gender,
      dob: user.dob,
      phoneNumber: user.phoneNumber,
      mailAddress: user.mailAddress,
      bio: user.bio,
      link: user.link,
      profileImg: user.profileImg,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isPrivate: user.isPrivate,
      bgColor: bgColor,
    };

    res.json(userResponse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete current user (Authenticated User)
exports.deleteUser = async function (req, res) {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
