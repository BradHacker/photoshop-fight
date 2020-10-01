const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  pingInterval: 10000,
});

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
    cookie: {
      sameSite: 'lax',
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/v1/users', UserRouter);
app.use('/api/v1/fights', FightRouter);

const { Fight } = require('./models/fight.model');
const { HashId, fightActionDecode } = require('./util/hashids');
const { competeInFight, viewFight, competitorStateFinish } = require('./util/fight-actions');

io.sockets.on('connection', (socket) => {
  // console.log('******new socket connection******');

  socket.on('join_fight', (data, send) => {
    // console.log(`Looking for fight with id: ${HashId.decodeHex(data.fightId)}`);
    // console.log(`UserID: ${HashId.decodeHex(data.userId)} | SocketId: ${socket.id}`);
    const { action, hashid } = fightActionDecode(data.fightId);
    switch (action) {
      case 'compete':
        competeInFight(socket, data.userId, hashid, send);
        break;
      case 'view':
        viewFight(socket, data.userId, hashid, send);
        break;
    }
  });

  socket.on('competitor_ready', (data, send) => competitorReady(io, socket, data, send));

  socket.on('state_finish', (data, send) => competitorStateFinish(io, socket, data, send));

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
        doc
          .populate({ path: 'viewers.user', select: { password: 0, _id: 0 } })
          .populate({ path: 'competitors.user', select: { password: 0, _id: 0 } }, (err, fight) => {
            if (err) return console.error("COULDN't POPULATE COMPETITOR USERS");
            socket.to(rooms[1]).emit('competitors_update', { competitors: fight.competitors });
            socket.to(rooms[1]).emit('viewers_update', { viewers: fight.viewers });
            // return console.log('Removed Socket from Db');
          });
      }
    );
  });
});

server.listen(process.env.PORT);
