const express = require('express');
const connectDB = require('./config/db');
const morgan = require('morgan');
const adminRoutes = require('./routes/adminRoute');
const userRoutes = require('./routes/userRoute');
const contactRoutes = require('./routes/contactRoute')
const cors = require('cors');
require('dotenv').config();

const app = express();

connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); 

app.get('/',(req,res)=>{
res.send('server ready')
})

const apiRoutes = express.Router();
apiRoutes.use('/admin', adminRoutes);
apiRoutes.use(userRoutes);
app.use('/api', apiRoutes);

apiRoutes.use(contactRoutes)
app.use('/api/contacts', contactRoutes);

const PORT = process.env.PORT;
// const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
