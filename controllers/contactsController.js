const Contact = require('../models/Contacts');




// // Sync contacts
// exports.syncContacts = async (req, res) => {
//     const { contacts } = req.body;
  
//     if (!contacts || !Array.isArray(contacts)) {
//       return res.status(400).json({ error: 'Invalid input: contacts must be an array.' });
//     }
  
//     try {
//       const contactPromises = contacts.map(contact => {
//         if (!contact.name || !contact.phoneNumber) {
//           throw new Error('Contact must have a name and phone number');
//         }
  
//         return new Contact({
//           name: contact.name,
//           phoneNumber: contact.phoneNumber,
//           email: contact.email || null
//         }).save();
//       });
  
//       await Promise.all(contactPromises);
//       res.status(200).json({ message: 'Contacts synced successfully!' });
//     } catch (error) {
     
//       console.error('Error syncing contacts:', error);
  
     
//       if (error instanceof mongoose.Error.ValidationError) {
//         return res.status(400).json({ error: 'Validation error: ' + error.message });
//       }
  
//       if (error.message.includes('Contact must have a name and phone number')) {
//         return res.status(400).json({ error: error.message });
//       }

//       res.status(500).json({ error: 'Failed to sync contacts.' });
//     }
//   };
  

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
