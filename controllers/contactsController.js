const Contact = require('../models/Contacts');

// Function to sync contacts
exports.syncContacts = async (req, res) => {
  const { contacts } = req.body; // Extract contacts from the request body

  try {
    // Store each contact in the database
    const contactPromises = contacts.map(contact => {
      return new Contact({
        name: contact.name,
        phoneNumber: contact.phoneNumber,
        email: contact.email || null
      }).save();
    });

    // Wait for all contacts to be saved
    await Promise.all(contactPromises);

    res.status(200).json({ message: 'Contacts synced successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync contacts.' });
  }
};

// Function to retrieve and display all contacts
exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find(); // Find all contacts in the database
    res.status(200).json(contacts); // Send contacts as a response
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contacts.' });
  }
};
