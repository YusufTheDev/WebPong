const keys = {w:false , s:false};

function start()
{
    const socket = io();

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

    socket.on("waiting", ()=>{
        console.log("nigger");
        document.getElementById("waiting").style.display = "block";
        document.getElementById("start").style.display = "none";
    })
    
    socket.on("joined", () =>{
        document.getElementById("player").style.display = "block";
        document.getElementById("enemy").style.display = "block";
        document.getElementById("ball").style.display = "block";
        document.getElementById("playerScore").style.display = "block";
        document.getElementById("enemyScore").style.display = "block";
        document.getElementById("start").style.display = "none";
        document.getElementById("waiting").style.display = "none";
        console.log("joined");
    });
    
    socket.on("change", (data) => {
    
        for(let id in data)
        {
            if(id === "ballpos")
            {
                console.log(`${data[id].x}`);
                ballDraw(data[id].x, data[id].y, data[id].width, data[id].height);
            }
            else if(id === socket.id)
            {
                console.log("player, " + data[id].points);
                playerDraw(data[id].x, data[id].y, data[id].width, data[id].height);
                if(data[id].x > 500)
                {
                    rightPointsDraw(data[id].points);
                }
                else{
                    leftPointsDraw(data[id].points);
                }
            }
            else{
                console.log("enemy, " + data[id].points);
                enemyDraw(data[id].x, data[id].y,data[id].width, data[id].height);
                if(data[id].x > 500)
                {
                    rightPointsDraw(data[id].points);
                }
                else{
                    leftPointsDraw(data[id].points);
                }
            }
        }
    });
}

function playerDraw(posx, posy, width, height)
{
    document.getElementById("player").style.left = posx/10 + "vw";
    document.getElementById("player").style.top = posy/10 + "vh";
    document.getElementById("player").style.width = width/10 + "vw";
    document.getElementById("player").style.height = height/10 + "vh";
}

function enemyDraw(posx, posy, width, height)
{
    document.getElementById("enemy").style.left = posx/10 + "vw";
    document.getElementById("enemy").style.top = posy/10 + "vh";
    document.getElementById("enemy").style.width = width/10 + "vw";
    document.getElementById("enemy").style.height = height/10 + "vh";
}

function ballDraw(posx, posy, width, height)
{
    document.getElementById("ball").style.left = posx/10 + "vw";
    document.getElementById("ball").style.top = posy/10 + "vh";
    document.getElementById("ball").style.width = width/10 + "vw";
    document.getElementById("ball").style.height = height/10 + "vh";
}

function leftPointsDraw(points)
{
    document.getElementById("playerScore").textContent = "Score: " + points;
}

function rightPointsDraw(points)
{
    document.getElementById("enemyScore").textContent = "Score: " + points;
}

