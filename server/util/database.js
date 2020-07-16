const mongoose = require('mongoose');

mongoose.set('debug', true);

const mongooseOptions = {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose.connect(process.env.MONGO_URI, mongooseOptions);
const db = mongoose.connection;
db.on('error', console.error.bind(console, `Mongodb connection error while connecting to ${process.env.MONGO_URI}`));
db.once('open', () => console.log('Mongodb Connection Successful'));

module.exports = { db };
