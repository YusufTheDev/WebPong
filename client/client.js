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

function playerMove(pos)
{
    document.getElementById("player").style.top = -pos + "vh";
}

function enemyMove(pos)
{
    document.getElementById("enemy").style.top = -pos + "vh";
}


socket.on("joined", data =>{
    document.getElementById("ball").style.display = "block";
    console.log("joined");
    // socket.emit("start");
});

socket.on("change", (data) => {

    for(let id in data)
    {
        if(id === "ballpos")
        {
            //when ball exists do stuff here
            continue;
        }
        else if(id === socket.id)
        {
            console.log("player, " + data[id].pos);
            playerMove(data[id].pos);
        }
        else{
            console.log("enemy, " + data[id].pos);
            enemyMove(data[id].pos);
        }
    }
});
