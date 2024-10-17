const Contact = require('../models/Contacts');
const User = require('../models/User');
const Friendship = require('../models/friendshipSchema')


  

// Sync contacts
exports.syncContacts = async (req, res) => {
  const { contacts } = req.body;
  const userId = req.user._id; 

  if (!contacts || !Array.isArray(contacts)) {
    return res.status(400).json({ error: 'Invalid input: contacts must be an array.' });
  }

  try {
    const contactPromises = contacts.map(async (contact) => {
      if (!contact.name || !contact.phoneNumber) {
        throw new Error('Contact must have a name and phone number');
      }

     
      const existingContact = await Contact.findOne({
        user: userId,
        phoneNumber: contact.phoneNumber
      });

    
      if (existingContact) {
        console.log(`Contact ${contact.name} already exists for this user. Skipping...`);
        return null; 
      }

    
      return new Contact({
        user: userId,
        name: contact.name,
        phoneNumber: contact.phoneNumber,
        email: contact.email || null
      }).save();
    });

  
    await Promise.all(contactPromises);

    res.status(200).json({ message: 'Contacts synced successfully!' });
  } catch (error) {
    console.error('Error syncing contacts:', error);

    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ error: 'Validation error: ' + error.message });
    }

    if (error.message.includes('Contact must have a name and phone number')) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: 'Failed to sync contacts.' });
  }
};




//retrieve n display all contacts
exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contacts.' });
  }
};







// // Search by name (within user's contact list) 
// exports.searchByName = async (req, res) => {
//   const searchTerm = req.query.name;
//   const userId = req.user._id;


//   if (!searchTerm) {
//     return res.status(400).json({ error: 'Name query parameter is required for search.' });
//   }

//   try {
   
//     const contact = await Contact.findOne({
//       user: userId,
//       name: { $regex: `^${searchTerm}`, $options: 'i' } 
//     });

   
//     if (!contact) {
//       return res.status(404).json({ message: 'No contact found with this name in your contacts.' });
//     }

//     const user = await User.findOne({ phoneNumber: contact.phoneNumber });

//     if (user) {
//       return res.status(200).json({
//         message: 'User found in User collection.',
//         data: {
//           name: user.name,
//           username: user.username,
//           profileImg: user.profileImg,
//           gender: user.gender,
//           dob: user.dob,
//           phoneNumber: user.phoneNumber,
//           mailAddress: user.mailAddress,
//           bio: user.bio,
//           link: user.link
//         }
//       });
//     }

   
//     return res.status(200).json({
//       message: 'User not found in User collection. Displaying contact from your contacts list.',
//       data: {
//         name: contact.name,
//         phoneNumber: contact.phoneNumber,
//         email: contact.email
//       }
//     });

//   } catch (error) {
//     console.error('Error searching by name:', error);
//     return res.status(500).json({ error: 'Failed to search by name.' });
//   }
// };




// Search by name (within user's contact list) 
exports.searchByName = async (req, res) => {
  const searchTerm = req.query.name;
  const userId = req.user._id;

  if (!searchTerm) {
    return res.status(400).json({ error: 'Name query parameter is required for search.' });
  }

  try {
    const contact = await Contact.findOne({
      user: userId,
      name: { $regex: `^${searchTerm}`, $options: 'i' }
    });

    if (!contact) {
      return res.status(404).json({ message: 'No contact found with this name in your contacts.' });
    }
    const user = await User.findOne({ phoneNumber: contact.phoneNumber });
    
    let status = null;

    if (user) {
      const isInContacts = await Contact.findOne({ user: userId, phoneNumber: user.phoneNumber });
      if (isInContacts) {
        status = 'contacts';
      }

      const friendship = await Friendship.findOne({
        $or: [
          { requester: userId, recipient: user._id, status: 'accepted' },
          { requester: user._id, recipient: userId, status: 'accepted' }
        ]
      });

      if (friendship) {
        status = 'looped';
      }

      return res.status(200).json({
        message: 'User found in User collection.',
        data: {
          name: user.name,
          username: user.username,
          profileImg: user.profileImg,
          gender: user.gender,
          dob: user.dob,
          phoneNumber: user.phoneNumber,
          mailAddress: user.mailAddress,
          bio: user.bio,
          link: user.link,
          status: status || 'devian'
        }
      });
    }

  
    return res.status(200).json({
      message: 'User not found in User collection. Displaying contact from your contacts list.',
      data: {
        name: contact.name,
        phoneNumber: contact.phoneNumber,
        email: contact.email,
        status: 'devian'
      }
    });

  } catch (error) {
    console.error('Error searching by name:', error);
    return res.status(500).json({ error: 'Failed to search by name.' });
  }
};

