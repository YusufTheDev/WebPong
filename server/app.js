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

const SCREEN_SIZE = 1000;
const BALL_SIZE = 35;
const BALL_SPEED = 10;
const PADDLE_SIZE = { x: 50, y: 200 };
const PADDLE_SPEED = 20;
const MAX_SCORE = 15;

let waiting = undefined;
let lastRoomId = 0;
const games = {};
const gameClasses = {};


function endGame(loserId) {
    for (let roomId in gameClasses) {
        if (gameClasses[roomId].leftPaddle.id === loserId || gameClasses[roomId].rightPaddle.id === loserId) {
            io.to(roomId).emit("change", games[roomId]);
            io.to(roomId).emit("gameEnd", loserId);
            delete gameClasses[roomId];
            delete games[roomId];
            console.log("i");
            break;
        }
    }
}

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
        let count = 30;

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

        let interval = setInterval(() => {
            count -= 1;
            if (count === 0) {
                endGame(socket.id);
                clearInterval(interval);
            }
        }, 1000);

        socket.on("keys", (data) => {
            object.playerControl(data);
            count = 30;
        });
    }
}

//waiting is always left and other is always right
io.on("connection", (socket) => {
    socket.on("disconnect", () => {
        if (socket === waiting) {
            waiting = undefined;
            return;
        }
        endGame(socket.id);
    });

    if(waiting !== undefined)
    {
        socket.join(`${lastRoomId}`);
        waiting.join(`${lastRoomId}`);
        io.to(`${lastRoomId}`).emit("joined", { size: SCREEN_SIZE, score: MAX_SCORE });

        gameClasses[`${lastRoomId}`] = {
            leftPaddle : new Paddle(PADDLE_SIZE.x, PADDLE_SIZE.y, SCREEN_SIZE/20, SCREEN_SIZE/2 - PADDLE_SIZE.y/2, PADDLE_SPEED, waiting.id),
            rightPaddle: new Paddle(PADDLE_SIZE.x, PADDLE_SIZE.y, SCREEN_SIZE - PADDLE_SIZE.x - SCREEN_SIZE/20, SCREEN_SIZE/2 - PADDLE_SIZE.y/2, PADDLE_SPEED, socket.id),
            ball: new Ball(BALL_SIZE, SCREEN_SIZE/2 - BALL_SIZE/2, SCREEN_SIZE/2 - BALL_SIZE/2, BALL_SPEED, 0)
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
            points: 0
        };

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
        gameClasses[roomId].leftPaddle.calcNextFrame(SCREEN_SIZE);
        gameClasses[roomId].rightPaddle.calcNextFrame(SCREEN_SIZE);
        gameClasses[roomId].ball.calcNextFrame(SCREEN_SIZE);

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
                else if(Math.abs(games[roomId][id].x - gameClasses[roomId].ball.pos.x) > SCREEN_SIZE/2)
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
                if(games[roomId][id].points >= MAX_SCORE)
                {
                    endGame(gameClasses[roomId].rightPaddle.id);
                    break;
                }
            }
            else
            {
                games[roomId][id].x = gameClasses[roomId].rightPaddle.pos.x;
                games[roomId][id].y = gameClasses[roomId].rightPaddle.pos.y;
                if(games[roomId][id].points >= MAX_SCORE)
                {
                    endGame(gameClasses[roomId].leftPaddle.id);
                    break;
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