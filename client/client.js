const keys = {w:false , s:false};
let screenSize;
let maxScore;
let leadScore;

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
        console.log("ok")
    });

    socket.on("waiting", () => {
        document.getElementById("waiting").style.display = "block";
        document.getElementById("start").style.display = "none";
    })
    
    socket.on("joined", (data) => {
        screenSize = data.size;
        maxScore = data.score;
        leadScore = 0;
        document.getElementById("gameSpace").style.display = "block";
        document.getElementById("player").style.display = "block";
        document.getElementById("enemy").style.display = "block";
        document.getElementById("ball").style.display = "block";
        document.getElementById("playerScore").style.display = "block";
        document.getElementById("enemyScore").style.display = "block";
        document.getElementById("start").style.display = "none";
        document.getElementById("waiting").style.display = "none";
        console.log("joined");
        setWindowSize();
    });
    
    socket.on("change", (data) => {
    
        for(let id in data)
        {
            if(id === "ballpos")
            {
                // console.log(`${data[id].x}`);
                entityDraw("ball", data[id].x, data[id].y, data[id].width, data[id].height);
                continue;
            }
            
            if(id === socket.id)
            {
                // console.log("player, " + data[id].points);
                entityDraw("player", data[id].x, data[id].y, data[id].width, data[id].height);
            }
            else {
                // console.log("enemy, " + data[id].points);
                entityDraw("enemy", data[id].x, data[id].y,data[id].width, data[id].height);
            }

            if(data[id].x > screenSize/2) {
                rightPointsDraw(data[id].points);
            }
            else {
                leftPointsDraw(data[id].points);
            }

            if (data[id].points > leadScore) {
                leadScore = data[id].points;
            }
        }
    });

    socket.on("gameEnd", (data) => {
        const endScreen = document.getElementById("endScreen");
        if (leadScore !== maxScore) {
            if (data === socket.id) {
                endScreen.textContent = "lost by self disconnect";
            } else {
                endScreen.textContent = "won by opponent disconnect";
            }
        } else {
            if (data === socket.id) {
                endScreen.textContent = "lost by score";
            } else {
                endScreen.textContent = "won by score";
            }
        }
        endScreen.style.display = "block";
        socket.disconnect();
    });
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