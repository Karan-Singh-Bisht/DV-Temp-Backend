const User = require('../models/User');
const { signToken } = require('../utils/jwtUtils');
const TokenBlacklist = require('../models/TokenBlacklist');


// Get all users without relationships
exports.getUsers = async function (req, res) {
  try {
    const users = await User.find();
    console.log("Users are here: " + users);

    const currentUser = await User.findById(req.user.id);
    const blockedUsers = currentUser ? currentUser.blockedUsers.map(id => id.toString()) : [];

    const userResponses = users
      .filter(user => !blockedUsers.includes(user._id.toString()))
      .map(user => ({
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
        updatedAt: user.updatedAt
      }));

    res.json(userResponses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user by ID without relationships
exports.getUserById = async function (req, res) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const currentUser = await User.findById(req.user.id);
    const isBlocked = currentUser && currentUser.blockedUsers.includes(user._id.toString());

    if (isBlocked) return res.status(403).json({ message: 'User is blocked' });

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
      updatedAt: user.updatedAt
    };

    res.json(userResponse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Search users by name without relationships
exports.searchUsersByName = async function (req, res) {
  const searchTerm = req.query.name;
  if (!searchTerm) {
    return res.status(400).json({ message: 'Name query parameter is required' });
  }

  try {
    const users = await User.find({
      $or: [
        { name: { $regex: `^${searchTerm}`, $options: 'i' } },
        { username: { $regex: `^${searchTerm}`, $options: 'i' } }
      ]
    });

    const currentUser = await User.findById(req.user.id);
    const blockedUsers = currentUser ? currentUser.blockedUsers.map(id => id.toString()) : [];

    const filteredUsers = users
      .filter(user => !blockedUsers.includes(user._id.toString()) && user._id.toString() !== req.user.id);

    if (filteredUsers.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    const userResponses = filteredUsers.map(user => ({
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
      updatedAt: user.updatedAt
    }));

    res.json(userResponses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


//logout
exports.signoutUser = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; 
    await TokenBlacklist.create({ token });

    res.status(200).json({ message: 'Successfully signed out' });
  } catch (err) {
    console.error('Error signing out:', err);
    res.status(500).json({ message: 'Error signing out' });
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
    profileImg
  } = req.body;

  try {
    let existingUser = await User.findOne({ phoneNumber });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists. Please log in.' });
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
      profileImg
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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return res.status(201).send(userResponse);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};



exports.loginUser = async function (req, res) {
  const { phoneNumber } = req.body;

  try {
    let user = await User.findOne({ phoneNumber });

    if (user) {
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
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
      return res.status(200).send(userResponse);
    } else {
      return res.status(404).json({ userExists: false, phoneNumber });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};







exports.updateUser = async function (req, res) {
  try {
    const { name, gender, dob, bio, profession, website, profileImg, link } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, gender, dob, bio, profession, website, profileImg, link, updatedAt: Date.now() },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

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
      updatedAt: user.updatedAt
    };

    res.json(userResponse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};







// Delete current user (Authenticated User)
exports.deleteUser = async function (req, res) {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



