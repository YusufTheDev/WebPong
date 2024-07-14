const socket = io();
const keys = {w:false , s:false};

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

function playerDraw(posx, posy, width, height, points)
{
    document.getElementById("player").style.left = posx/10 + "vw";
    document.getElementById("player").style.top = posy/10 + "vh";
    document.getElementById("player").style.width = width/10 + "vw";
    document.getElementById("player").style.height = height/10 + "vw";
    document.getElementById("playerScore").textContent = "Score: " + points;
}

function enemyDraw(posx, posy, width, height, points)
{
    document.getElementById("enemy").style.left = posx/10 + "vw";
    document.getElementById("enemy").style.top = posy/10 + "vh";
    document.getElementById("enemy").style.width = width/10 + "vw";
    document.getElementById("enemy").style.height = height/10 + "vw";
    document.getElementById("enemyScore").textContent = "Score: " + points;
}

function ballDraw(posx, posy, width, height)
{
    document.getElementById("ball").style.left = posx + "vw";
    document.getElementById("ball").style.top = posy/10 + "vh";
    document.getElementById("ball").style.width = width/10 + "vw";
    document.getElementById("ball").style.height = height/10 + "vw";
}


socket.on("joined", data =>{
    document.getElementById("ball").style.display = "block";
    document.getElementById("playerScore").style.display = "block";
    document.getElementById("enemyScore").style.display = "block";
    console.log("joined");
    // socket.emit("start");
});

socket.on("change", (data) => {

    for(let id in data)
    {
        if(id === "ballpos")
        {
            ballDraw(data[id].x, data[id].y);
            console.log(`${data[id].x}`);
        }
        else if(id === socket.id)
        {
            console.log("player, " + data[id].points);
            playerDraw(data[id].x, data[id].y);
        }
        else{
            console.log("enemy, " + data[id].points);
            enemyDraw(data[id].x, data[id].y);
        }
    }
});
