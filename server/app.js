const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");
const {Paddle, Ball} = require("./GameObjects");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const clientPath = path.join(__dirname, "../client");
const PORT = process.env.PORT || 3000;
app.use(express.static(clientPath));

let waiting = undefined;
let lastRoomId = 0;
const games = {};
const gameClasses = {};

//screen dimensions
let screenSize = 1000;


function startGame(player1, player2, lastRoomId)
{
    for(let name in gameClasses[lastRoomId])
    {
        const obj = gameClasses[lastRoomId];
        if (obj[name].vel.x != 0) {
            continue;
        }
        
        let socket = undefined;
        let object = undefined;
        if (obj[name].id === player1.id)
        {
            socket = player1;
            object = obj[name];
        }
        else
        {
            socket = player2;
            object = obj[name];
        }

        socket.on("keys", (data) =>
        {
            object.playerControl(data);
        });
    }
}

//waiting is always left and other is always right
io.on("connection", (socket) => {
    socket.on("disconnect", ()=>{
        if(socket === waiting)
            waiting = undefined;
    });

    if(waiting !== undefined)
    {
        socket.join(`${lastRoomId}`)
        waiting.join(`${lastRoomId}`)
        io.to(`${lastRoomId}`).emit("joined", `${lastRoomId}`);
        gameClasses[`${lastRoomId}`] = {
            leftPaddle : new Paddle(20, 200, 0, 450, waiting.id),
            rightPaddle: new Paddle(20, 200, 980, 450, socket.id),
            ball: new Ball(20, 40, 490, 490, 4, 0)
        };
        games[`${lastRoomId}`] = { 
            ballpos: {
                x: gameClasses[`${lastRoomId}`].ball.pos.x, 
                y: gameClasses[`${lastRoomId}`].ball.pos.y, 
                width: gameClasses[`${lastRoomId}`].ball.width, 
                height: gameClasses[`${lastRoomId}`].ball.height
            }
        };
        games[`${lastRoomId}`][socket.id] = {
            x: gameClasses[`${lastRoomId}`].rightPaddle.pos.x,
            y: gameClasses[`${lastRoomId}`].rightPaddle.pos.y,
            width: gameClasses[`${lastRoomId}`].rightPaddle.width,
            height: gameClasses[`${lastRoomId}`].rightPaddle.height,
            points: 0
        };
        games[`${lastRoomId}`][waiting.id] = { 
            x: gameClasses[`${lastRoomId}`].leftPaddle.pos.x ,
            y: gameClasses[`${lastRoomId}`].leftPaddle.pos.y,
            width: gameClasses[`${lastRoomId}`].leftPaddle.width,
            height: gameClasses[`${lastRoomId}`].leftPaddle.height,
            points: 0};
        startGame(socket, waiting, `${lastRoomId}`);
        gameClasses[lastRoomId].ball.ballStart();
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
    for (let roomId in gameClasses) {
        gameClasses[roomId].leftPaddle.calcNextFrame(screenSize);
        gameClasses[roomId].rightPaddle.calcNextFrame(screenSize);
        gameClasses[roomId].ball.calcNextFrame(screenSize);

        gameClasses[roomId].ball.paddleBounce(gameClasses[roomId].rightPaddle);
        gameClasses[roomId].ball.paddleBounce(gameClasses[roomId].leftPaddle);

        gameClasses[roomId].ball.updateFrame();
        gameClasses[roomId].leftPaddle.updateFrame();
        gameClasses[roomId].rightPaddle.updateFrame();
        
        if(gameClasses[roomId].ball.alive === false)
        {
            for(let id in games[roomId])
            {
                if(id === "ballpos")
                    continue;
                else if(Math.abs(games[roomId][id].x - gameClasses[roomId].ball.pos.x) > 500)
                {
                    games[roomId][id].points +=1;
                    gameClasses[roomId].ball.lastScore *=-1;
                }
            }
            gameClasses[roomId].ball.ballStart();
        }

        for(let id in games[roomId])
        {
            if(id === "ballpos")
            {
                games[roomId][id].x = gameClasses[roomId].ball.pos.x;
                games[roomId][id].y = gameClasses[roomId].ball.pos.y;
            }
            else if (id == gameClasses[roomId].leftPaddle.id)
            {
                games[roomId][id].x = gameClasses[roomId].leftPaddle.pos.x;
                games[roomId][id].y = gameClasses[roomId].leftPaddle.pos.y;
                if(games[roomId][id].points >=15)
                {
                    //player win
                }
            }
            else
            {
                games[roomId][id].x = gameClasses[roomId].rightPaddle.pos.x;
                games[roomId][id].y = gameClasses[roomId].rightPaddle.pos.y;
                if(games[roomId][id].points >=15)
                {
                    //player win
                }
            }
        }
        io.to(roomId).emit("change", games[roomId]);
    }
}, 25);

// Server port
server.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});