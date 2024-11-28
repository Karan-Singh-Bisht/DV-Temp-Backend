// index.js

const express = require('express');
const connectDB = require('./config/db');
const morgan = require('morgan');
const adminRoutes = require('./routes/adminRoute');
const userRoutes = require('./routes/userRoute');
const contactRoutes = require('./routes/contactRoute');
const pageRoute = require('./routes/pageRoute');
const userPostRoutes = require('./routes/userPostRoute');
const cors = require('cors');
const http = require('http');
const { setupSocket } = require('./socketServer');
require('dotenv').config();

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


// Initialize Socket.IO
setupSocket(server); // Pass the server to the Socket.IO setup function


const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


