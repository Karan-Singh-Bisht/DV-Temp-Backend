const PageChat = require('../../models/Pages/pageChat');
const Pages = require('../../models/Pages/PagesModel');

exports.getChats = async (req, res) => {
  try {
    const currentPageId = req.params.senderPageId;

    const chats = await PageChat.find({
      participants: currentPageId,
    })
      .populate({
        path: 'participants',
        match: { _id: { $ne: currentPageId } },
        select: 'pageName profileImg',
        model: 'Pages',
      })
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (error) {
    console.error('Error fetching page chats:', error);
    res.status(500).json({ message: 'Failed to fetch chats', error });
  }
};
