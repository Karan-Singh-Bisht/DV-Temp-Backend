
const express = require('express');
const connectDB = require('./config/db');
const morgan = require('morgan');
const adminRoutes = require('./routes/adminRoute');
const userRoutes = require('./routes/userRoute');
const contactRoutes = require('./routes/contactRoute');
const pageRoute = require('./routes/pageRoute');
const userPostRoutes = require('./routes/userPostRoute');
const userChatRoute = require('./routes/userChatRoute');
const cors = require('cors');
const http = require('http');
const { setupSocket } = require('./socketServer');
const { setupSocket1 } = require('./socketServer1');
require('dotenv').config();
const{setupCronJobs}=require('./controllers/cronJobController')


const app = express();
const server = http.createServer(app);

// Initialize socket server

connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); 

app.get('/', (req, res) => {
  res.send('server ready');
});

const apiRoutes = express.Router();
apiRoutes.use('/admin', adminRoutes);
apiRoutes.use(userRoutes);
apiRoutes.use(pageRoute);
app.use('/api', apiRoutes);

apiRoutes.use(contactRoutes);
app.use('/contacts', contactRoutes);

app.use('/api/user/posts', userPostRoutes);
app.use('/api/user/chat', userChatRoute);


// Initialize Socket.IO
setupSocket(server); // Pass the server to the Socket.IO setup function
setupSocket1(server);
setupCronJobs();

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


