const mongoose = require('mongoose');
require('dotenv').config();

const ConnectDb = () => {
    mongoose.connect(process.env.MONGO_URL)
        .then(() => console.log('MongoDB connected In User Service✅'))
        .catch(err => console.log(err))
}

module.exports = ConnectDb;