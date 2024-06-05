const mongoose = require('mongoose');

const connectDB = async () => {
    return mongoose.connect("mongodb://localhost/contactDB").then(() => console.log(`Database connection to MongoDB is Established`)).catch(err => console.log(err));
};

module.exports = connectDB;