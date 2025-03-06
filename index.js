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
const cors = require("cors");
const http = require("http");
const { setupSocket } = require("./server/socketServer");
const { setupSocket1 } = require("./server/socketServer1");
const { setupSocketPage } = require("./server/socketServer1");
require("dotenv").config();
const app = express();
const server = http.createServer(app);

// Initialize socket server

connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("server ready");
});

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

// Initialize Socket.IO
setupSocket(server);
setupSocket1(server);


app.post("/add-fields-to-documents", async (req, res) => {
  try {
    // Fields to check and add with default values
    const defaultFields = {
      date_of_birth: null,
      gender: "Not Specified",
    };

    // Update documents to include missing fields
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

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
