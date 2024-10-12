const Contact = require('../models/Contacts');

// Sync contacts
exports.syncContacts = async (req, res) => {
  const { contacts } = req.body; 

  try {
    const contactPromises = contacts.map(contact => {
      return new Contact({
        name: contact.name,
        phoneNumber: contact.phoneNumber,
        email: contact.email || null
      }).save();
    });

    await Promise.all(contactPromises);

    res.status(200).json({ message: 'Contacts synced successfully!' });
  } catch (error) {
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
