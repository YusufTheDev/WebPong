const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        methods: ["GET", "POST"]
    }
});
const clientPath = path.join(__dirname, "../client");
const PORT = process.env.PORT || 3000;
app.use(express.static(clientPath));

let waiting = undefined;
let lastRoomId = 0;
const games = {};

function startGame(player1, player2, lastRoomId)
{
    for(let id in games[lastRoomId])
    {
        if (id === "ballpos") {
            continue;
        }
        
        let socket = undefined;
        if (id === player1.id)
            socket = player1;
        else
            socket = player2;

        socket.on("keys", (data) =>
        {
            if(data.w === true && data.s === true)
            {
                games[lastRoomId][id].currentKey = "";
            }
            else if(data.w === true)
            {
                games[lastRoomId][id].currentKey = "w";
            }
            else if(data.s === true)
            {
                games[lastRoomId][id].currentKey = "s";
            }
            else{
                games[lastRoomId][id].currentKey = "";
            }
        });
    }
}

io.on("connection", (socket) => {
    if(waiting !== undefined)
    {
        socket.join(`${lastRoomId}`)
        waiting.join(`${lastRoomId}`)
        io.to(`${lastRoomId}`).emit("joined", `${lastRoomId}`);
        games[`${lastRoomId}`] = { ballpos: { x: 0, y: 0 } };
        games[`${lastRoomId}`][socket.id] = { currentKey: "", pos: 0 };
        games[`${lastRoomId}`][waiting.id] = { currentKey: "", pos: 0 };
        startGame(socket, waiting, `${lastRoomId}`);
        waiting = undefined;
        lastRoomId += 1;
    }
    else
    {
        socket.emit("waiting");
        waiting = socket;
    }

});


setInterval(() => {
    for (let roomId in games) {
        for (let id in games[roomId]) {
            if (id === "ballpos") {
                continue;
                //update ball when it exists here because... -_-
            }

            if (games[roomId][id].currentKey === "w")
            {
                games[roomId][id].pos += 1;
            }
            else if(games[roomId][id].currentKey === "s")
            {
                games[roomId][id].pos -= 1;
            }
        }
        io.to(roomId).emit("change", games[roomId]);
        //      update p1, p2, ball
        //      emit
    }
}, 50);

// Server port
server.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});