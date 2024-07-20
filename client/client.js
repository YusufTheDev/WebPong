const keys = {w:false , s:false};
let screenSize;
let maxScore;
let leadScore;
let backgroundAngle = 90;
let waitingInterval;

setInterval(()=>{
    backgroundAngle += 1;
    if (backgroundAngle === 360) {
        backgroundAngle = 0;
    }
    document.body.style.background = `linear-gradient(${backgroundAngle}deg, #123456, #562356)`;
}, 100);

function setWindowSize() {
    if (window.innerWidth > window.innerHeight) {
        document.getElementById("gameSpace").style.width = "90vh";
        document.getElementById("gameSpace").style.height = "90vh";
    } else {
        document.getElementById("gameSpace").style.width = "90vw";
        document.getElementById("gameSpace").style.height = "90vw";
    }
}

window.addEventListener("resize", () => {
    setWindowSize();
});

function start()
{
    const socket = io("/");

    addTouchListener((pos) => {
        if (pos.y < innerHeight / 2)
        {
            keys.w = true;
            keys.s = false;
        }
        else if (pos.y > innerHeight / 2)
        {
            keys.s = true;
            keys.w = false;
            
        }
        else {
            keys.w = false;
            keys.s = false;
        }
        socket.emit("keys", keys);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "w")
        {
            keys.w = true;
        }
        else if (event.key === "s")
        {
            keys.s = true;
        }
        socket.emit("keys", keys);
    });
    
    document.addEventListener("keyup", (event) => {
        if (event.key === "w")
        {
            keys.w = false;
        }
        else if (event.key === "s")
        {
            keys.s = false;
        }
        socket.emit("keys", keys);
    });

    socket.on("waiting", () => {
        let count = 0;
        document.getElementById("waiting").style.display = "block";
        document.getElementById("mainMenu").style.display = "none";
        waitingInterval = setInterval(() => {
            if (count === 3)
            {
                document.getElementById("waiting").textContent = "Waiting for Opponent";
                count = 0;
            }
            else{
                document.getElementById("waiting").textContent += ".";
                count += 1;
            }
        }, 1000);
    })
    
    socket.on("joined", (data) => {
        clearInterval(waitingInterval);
        screenSize = data.size;
        maxScore = data.score;
        leadScore = 0;
        document.getElementById("gameSpace").style.display = "block";
        document.getElementById("playerScore").style.display = "block";
        document.getElementById("enemyScore").style.display = "block";
        document.getElementById("mainMenu").style.display = "none";
        document.getElementById("waiting").textContent = "Waiting for Opponent";
        document.getElementById("waiting").style.display = "none";
        setWindowSize();
    });
    
    socket.on("change", (data) => {
    
        for(let id in data)
        {
            if (id === "ballpos")
            {
                entityDraw("ball", data[id].x, data[id].y, data[id].width, data[id].height);
                continue;
            }
            
            if (id === socket.id)
                entityDraw("player", data[id].x, data[id].y, data[id].width, data[id].height);
            else 
                entityDraw("enemy", data[id].x, data[id].y,data[id].width, data[id].height);

            if (data[id].x > screenSize/2) 
                rightPointsDraw(data[id].points);
            else 
                leftPointsDraw(data[id].points);

            if (data[id].points > leadScore) 
                leadScore = data[id].points;
        }
    });

    socket.on("gameEnd", (data) => {
        document.getElementById("gameSpace").style.display = "none";
        document.getElementById("endScreen").style.display = "block";
        const endText = document.getElementById("endText");
        if (leadScore !== maxScore) 
        {
            if (data === socket.id) 
                endText.textContent = "Lost by Self Disconnect";
            else 
                endText.textContent = "Won by Opponent Disconnect";
        } 
        else 
        {
            if (data === socket.id) 
                endText.textContent = "Lost by Score";
            else 
                endText.textContent = "Won by Score";
        }
        endText.style.display = "block";
        socket.disconnect();
    });
}

function instructions()
{
    document.getElementById("mainMenu").style.display = "none";
    document.getElementById("instructionsText").style.display = "block";
}

function menuReturn()
{
    document.getElementById("endScreen").style.display = "none";
    document.getElementById("playerScore").style.display = "none";
    document.getElementById("enemyScore").style.display = "none";
    document.getElementById("mainMenu").style.display = "block";
    document.getElementById("instructionsText").style.display = "none";
}

function entityDraw(id, posx, posy, width, height)
{
    document.getElementById(id).style.left = posx/(screenSize/100) + "%";
    document.getElementById(id).style.top = posy/(screenSize/100) + "%";
    document.getElementById(id).style.width = width/(screenSize/100) + "%";
    document.getElementById(id).style.height = height/(screenSize/100) + "%";
}

function leftPointsDraw(points)
{
    document.getElementById("playerScore").textContent = "Score: " + points;
}

function rightPointsDraw(points)
{
    document.getElementById("enemyScore").textContent = "Score: " + points;
}