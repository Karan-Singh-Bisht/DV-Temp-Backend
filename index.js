const express = require("express");
const connectDB = require("./config/db");
const morgan = require("morgan");
const adminRoutes = require("./routes/adminRoute");
const userRoutes = require("./routes/userRoute");
const userStoryRoutes = require("./routes/userStory");
const contactRoutes = require("./routes/contactRoute");
const pageRoute = require("./routes/pageRoute");
const userPostRoutes = require("./routes/userPostRoute");
const userChatRoute = require("./routes/userChatRoute");
const userMapRoutes = require("./routes/userMapRoute");
const pageChatRoutes = require("./routes/pageChatRoutes")
const cors = require("cors");
const http = require("http");
require("dotenv").config();

const { setupSocket } = require("./server/socketServer");
const { setupSocketPage } = require("./server/setupSocketPage");
const cookieParser = require("cookie-parser");

const app = express();
const server = http.createServer(app);

// Connect MongoDB
connectDB();

// Middleware
app.use(cookieParser());
app.use(cors("*"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Base Route
app.get("/", (req, res) => {
  res.send("server ready");
});

// API Routes
const apiRoutes = express.Router();
apiRoutes.use("/admin", adminRoutes);
apiRoutes.use(userRoutes);
apiRoutes.use(userStoryRoutes);
apiRoutes.use(pageRoute);
apiRoutes.use("/user/maps", userMapRoutes);
apiRoutes.use(contactRoutes);
app.use("/api", apiRoutes);
app.use("/contacts", contactRoutes);
app.use("/api/user/posts", userPostRoutes);
app.use("/api/user/chat", userChatRoute);
app.use("/api/page/chat", pageChatRoutes)

// Initialize Sockets
setupSocket(server); // for user chat
setupSocketPage(server); // for page chat

// Optional route to modify documents
app.post("/add-fields-to-documents", async (req, res) => {
  try {
    const defaultFields = {
      date_of_birth: null,
      gender: "Not Specified",
    };
    const result = await User.updateMany(
      {},
      { $setOnInsert: defaultFields },
      { upsert: false, multi: true }
    );
    res.status(200).json({
      message: "Fields added to documents (if missing).",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error updating documents:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start Server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
