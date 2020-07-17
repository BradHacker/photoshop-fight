const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const { db } = require('./util/database');

require('./util/auth');

const UserRouter = require('./routes/user.router');
const FightRouter = require('./routes/fight.router');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: db }),
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/v1/users', UserRouter);
app.use('/api/v1/fights', FightRouter);

const { Fight } = require('./models/fight.model');
const HashId = require('./util/hashids');
const { User } = require('./models/user.model');

io.sockets.on('connection', (socket) => {
  // console.log('******new socket connection******');

  socket.on('join_fight', (data, send) => {
    // console.log(`Looking for fight with id: ${HashId.decodeHex(data.fightId)}`);
    // console.log(`UserID: ${HashId.decodeHex(data.userId)} | SocketId: ${socket.id}`);
    Fight.findOneAndUpdate(
      { _id: HashId.decodeHex(data.fightId) },
      { $pull: { competitors: { user: HashId.decodeHex(data.userId) } } },
      (err) => {
        if (err) return send({ success: false, error: { ...err } });
        Fight.findOneAndUpdate(
          { _id: HashId.decodeHex(data.fightId) },
          { $addToSet: { competitors: { user: HashId.decodeHex(data.userId), socketId: (' ' + socket.id).slice(1) } } },
          { new: true },
          (err, doc) => {
            if (err) return send({ success: false, error: { ...err } });
            // console.log(doc);
            doc.populate({ path: 'competitors.user', select: { password: 0, _id: 0 } }, (err, fight) => {
              if (err) return send({ success: false, error: { ...err } });
              socket.join(data.fightId, () => {
                // console.log('socket now connected to: ', Object.keys(socket.rooms));
                socket.to(data.fightId).emit('competitors_update', { competitors: fight.competitors });
                return send({ success: true, fight });
              });
            });
          }
        );
      }
    );
  });

  socket.on('view_fight', (data, send) => {
    Fight.findOneAndUpdate(
      { _id: HashId.decodeHex(data.fightId) },
      { $pull: { viewers: { userId: HashId.decodeHex(data.userId) } } },
      (err) => {
        if (err) return send({ success: false, error: { ...err } });
        Fight.findOneAndUpdate(
          { _id: HashId.decodeHex(data.fightId) },
          { $addToSet: { viewers: { userId: HashId.decodeHex(data.userId), socketId: (' ' + socket.id).slice(1) } } },
          { new: true },
          (err, doc) => {
            if (err) return send({ success: false });
            console.log(doc);
            socket.join(data.fightId, () => {
              // console.log('socket now connected to: ', Object.keys(socket.rooms));
              return send({ success: true, fight: doc });
            });
          }
        );
      }
    );
  });

  socket.on('competitor_ready', (data, send) => {
    const fightId = Object.keys(socket.rooms)[1];
    Fight.findOneAndUpdate(
      { _id: HashId.decodeHex(fightId), 'competitors.user': HashId.decodeHex(data.userId) },
      { $set: { 'competitors.$.ready': data.ready } },
      { new: true },
      (err, doc) => {
        if (err) return send({ success: false, error: { ...err } });
        doc.populate({ path: 'competitors.user', select: { password: 0, _id: 0 } }, (err, fight) => {
          if (err) return send({ success: false, error: { ...err } });
          // console.log('******* sending competitors_update ******');
          socket.to(fightId).emit('competitors_update', { competitors: fight.competitors });
          send({ success: true, competitors: fight.competitors });
        });
      }
    );
  });

  socket.on('disconnecting', (data, send) => {
    console.log('*****disconnecting******');
    let rooms = Object.keys(socket.rooms);
    console.log('****** socket rooms', rooms);
    Fight.findByIdAndUpdate(
      HashId.decodeHex(rooms[1]),
      { $pull: { competitors: { socketId: socket.id }, viewers: { socketId: socket.id } } },
      { new: true },
      (err, doc) => {
        if (err) return console.error("COULDN't FINISH REMOVING SOCKET FROM DB");
        doc.populate({ path: 'competitors.user', select: { password: 0, _id: 0 } }, (err, res) => {
          if (err) return console.error("COULDN't POPULATE COMPETITOR USERS");
          socket.to(rooms[1]).emit('competitors_update', { competitors: res.competitors });
          // return console.log('Removed Socket from Db');
        });
      }
    );
  });
});

server.listen(process.env.PORT);
