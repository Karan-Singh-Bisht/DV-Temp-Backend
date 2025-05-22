const PageChat = require('../../models/Pages/pageChat');
const Pages = require('../../models/Pages/PagesModel');
const PageMessage = require('../../models/Pages/pageMessage');

exports.getChats = async (req, res) => {
  try {
    const currentPageId = req.params.senderPageId;

    const chats = await PageChat.find({ participants: currentPageId })
      .populate({
        path: 'participants',
        select: 'pageName profileImg',
        model: 'Pages',
      })
      .populate({
        path: 'lastMessage',
        select: 'content senderPageId recipientPageId createdAt',
        model: 'PageMessage',
      })
      .sort({ updatedAt: -1 });

    const formattedChats = chats.map(chat => {
      const otherParticipant = chat.participants.find(p => p._id.toString() !== currentPageId);
      return {
        _id: chat._id,
        lastMessage: chat.lastMessage || null,
        participant: otherParticipant,
      };
    });

    res.status(200).json({
      success: true,
      message: 'Page chats fetched successfully',
      data: formattedChats,
    });
  } catch (error) {
    console.error('Error fetching page chats:', error);
    res.status(500).json({ message: 'Failed to fetch page chats', error });
  }
};


// exports.getChats = async (req, res) => {
//   try {
//     const currentPageId = req.params.senderPageId;

//     const chats = await PageChat.find({
//       participants: currentPageId,
//     })
//       .populate({
//         path: 'participants',
//         match: { _id: { $ne: currentPageId } },
//         select: 'pageName profileImg',
//         model: 'Pages',
//       })
//       .populate('lastMessage')
//       .sort({ updatedAt: -1 });

//     res.status(200).json(chats);
//   } catch (error) {
//     console.error('Error fetching page chats:', error);
//     res.status(500).json({ message: 'Failed to fetch chats', error });
//   }
// };
