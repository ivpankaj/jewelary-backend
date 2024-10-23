const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoute')
const cors = require('cors');
const recent_viewRoutes = require('./routes/recentViewRoutes')
const order_modelRoutes = require('./routes/orderRoutes')
const offerRoutes = require('./routes/offerRoutes')
const cartroutes = require('./routes/cart')
const wishlistRoutes = require('./routes/wishlistRoutes')
const notificationRoutes = require('./routes/notificationRoutes')
const uploadProductsRoutes = require('./routes/uploadProductsRoute');
const bannerRoutes = require('./routes/bannerRoutes')

dotenv.config();
connectDB();

const app = express();

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/user', userRoutes);
app.use('/api/user', uploadProductsRoutes);
app.use('/api/user', productRoutes)
app.use('/api/user', recent_viewRoutes)
app.use('/api/user', order_modelRoutes)
app.use('/api/user', offerRoutes)
app.use('/api/user', cartroutes)
app.use('/api/user', wishlistRoutes)
app.use('/api/user', notificationRoutes)
app.use('/api/user', bannerRoutes)

app.use((req, res) => {
    res.status(404).json({ message: 'You are hitting a wrong API URL' });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));