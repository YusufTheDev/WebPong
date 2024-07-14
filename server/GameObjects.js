class GameObject {
    constructor(width, height, posX, posY) {
        this.width = width;
        this.height = height;
        this.pos = {x: posX, y: posY};
        this.nextPos = {x: posX , y: posY};
        this.vel = {x: 0, y: 0};

    }
    calcNextFrame()
    {
        this.nextPos.x += this.vel.x;
        this.nextPos.y += this.vel.y;
    }
    updateFrame()
    {
        this.pos.x = this.nextPos.x;
        this.pos.y = this.nextPos.y;
    }
    collision(object)
    {
        let collide = false;
        if(this.nextPos.x + this.width >= object.nextPos.x  && this.nextPos.x <= object.nextPos.x + object.width)
        {
            if(this.nextPos.y + this.height >= object.nextPos.y && this.nextPos.y <= object.nextPos.y + object.height)
            {
                collide = true;
            }
        }

        return collide;
    }
}

class Paddle extends GameObject {
    constructor(width, height, posX, posY, id) {
        super(width, height, posX, posY);
        this.points = 0;
        this.id = id;
    }
    playerControl(keys)
    {
        if(keys.w === true && keys.s === true)
            this.vel.y = 0;
        else if (keys.w === true)
            this.vel.y = -2;
        else if (keys.s === true)
            this.vel.y = 2;
        else
            this.vel.y = 0;
    }

    calcNextFrame(screenSize) {
        super.calcNextFrame();
        if(this.nextPos.y < 0)
        {
            this.nextPos.y = 0;
        }
        else if(this.nextPos.y > screenSize)
        {
            this.nextPos.y = screenSize;
        }
    }
}

class Ball extends GameObject{
    constructor(width, height, posX, posY, velX, velY) {
        super(width, height, posX, posY);
        this.startPos = {x: posX, y: posY};
        this.vel = {velX, velY};
        this.startVel = {x: velX, y:velY}
        this.lastScore = 1;
    }

    ballStart()
    {
        this.nextPos.x = this.startPos.x;
        this.nextPos.y = this.startPos.y;
        this.vel.x = this.startVel.x * this.lastScore; 
        this.vel.y = this.startVel.y * this.lastScore;

    }
    paddleBounce(object)
    {
        if(this.collision(object))
        {
            if(this.nextPos.x > this.pos.x)
                this.nextPos.x = object.nextPos.x;
            else
                this.nextPos.x = object.nextPos.x + object.width;
            this.vel.x *= -1.1;
            this.vel.y = (this.nextPos.y + this.height / 2) - (object.nextPos.y + object.height / 2);
        }
    }

    calcNextFrame(screenSize) {
        super.calcNextFrame();
        if(this.nextPos.y < 0)
        {
            this.vel.y *= -1;
            this.nextPos.y = 0;
        }

        else if(this.nextPos.y + this.height > screenSize)
        {
            this.vel.y *= -1;
            this.nextPos.y = screenSize - this.height;
        }

        if(this.nextPos.x + this.width > screenSize || this.nextPos.x < 0)
        {
            this.ballStart();
            return false;
        }
        else{
            return true;
        }
    }
}

module.exports = {Paddle, Ball};