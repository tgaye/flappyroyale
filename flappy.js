const RAD = Math.PI/180;
const scrn = document.getElementById('canvasFlappy');
const sctx = scrn.getContext("2d");
scrn.tabIndex = 1;
let timer = 5;
let gameSpeed = 16;

scrn.addEventListener("touchstart",()=>{
    switch (state.curr) {
        case state.getReady :
            state.curr = state.Play;
            SFX.start.play();
            break;
        case state.Play :
            bird.flap();
            break;
        case state.gameOver :
            state.curr = state.getReady;
            bird.speed = 0;
            bird.y = 100;
            pipe.pipes=[];
            UI.score.curr = 0;
            SFX.played=false;
            break;
    }
})

scrn.onkeydown = function keyDown(e) {
    if (e.keyCode == 32 || e.keyCode == 87 || e.keyCode == 38)   // Space Key or W key or arrow up
    {
        switch (state.curr) {
            case state.getReady :
                break;
            case state.Play :
                bird.flap();
                break;
            case state.gameOver :
                state.curr = state.getReady;
                bird.speed = 0;
                bird.y = 100;
                pipe.pipes=[];
                UI.score.curr = 0;
                SFX.played=false;
                spawnRate = 140
                gap = 130
                break;
        }
    }
}

let spawnRate = 140
let gap = 130
let frames = 0;
let dx = 2;
const state = {
    curr : 0,
    getReady : 0,
    Play : 1,
    gameOver : 2,

}
const SFX = {
    start : new Audio(),
    flap : new Audio(),
    score : new Audio(),
    hit : new Audio(),
    die : new Audio(),
    played : false
}
const gnd = {
    sprite: new Image(),
    x: 0,
    y: 0,
    draw: function() {
        this.y = scrn.height - this.sprite.height;
        sctx.drawImage(this.sprite, this.x, this.y);
        sctx.drawImage(this.sprite, this.x + this.sprite.width, this.y); // Render a second copy of the ground sprite
    },
    update: function() {
        if (state.curr != state.Play) return;
        this.x -= dx;
        this.x = this.x % this.sprite.width; // Update the x position based on the width of the ground sprite
    }
};

gnd.sprite.onload = function() {
    gnd.draw(); // Call the draw function after the sprite is loaded
};
const bg = {
    sprite: new Image(),
    x: 0,
    y: 0,
    draw: function() {
        const scaleX = scrn.width / this.sprite.width;
        const scaleY = scrn.height / this.sprite.height;
        sctx.drawImage(this.sprite, this.x, this.y, this.sprite.width * scaleX, this.sprite.height * scaleY);
    }
};
let justSpawned = 'false';
const pipe = {
    top : {sprite : new Image()},
    bot : {sprite : new Image()},
    gap: gap,
    moved: true,
    pipes : [],
    draw: function() {
        for (let i = 0; i < this.pipes.length; i++) {
          let p = this.pipes[i];
          sctx.drawImage(
            this.top.sprite,
            p.x,
            p.y,
            this.top.sprite.width * 1.4, // Adjust the width of the pipe sprite
            this.top.sprite.height
          );
          sctx.drawImage(
            this.bot.sprite,
            p.x,
            p.y + parseFloat(this.top.sprite.height) + gap,
            this.bot.sprite.width * 1.4, // Adjust the width of the pipe sprite
            this.bot.sprite.height
          );
        }
      },
    
    update: function() {
        if (state.curr != state.Play) return;
        if (frames % spawnRate == 0 && justSpawned == 'false') {
            justSpawned = 'true';
            this.pipes.push({
                x: parseFloat(scrn.width),
                y: -210 * Math.min(Math.random() + 1, 1.8)
            });
            setTimeout(function() {
                justSpawned = 'false';
              }, 300);
        }
        this.pipes.forEach(pipe => {
          pipe.x -= dx * 1.4; // Move the pipe twice as fast
        });
      
        if (this.pipes.length && this.pipes[0].x < -1.4 * this.top.sprite.width) {
          this.pipes.shift();
          this.moved = true;
        }
      }

};
const bird = {
    animations :
        [
            {sprite : new Image()},
            {sprite : new Image()},
            {sprite : new Image()},
            {sprite : new Image()},
        ],
    rotatation : 0,
    x : 50,
    y :100,
    speed : 0,
    gravity : .1,
    thrust : 2.1,
    frame:0,
    draw : function() {
        let h = this.animations[this.frame].sprite.height;
        let w = this.animations[this.frame].sprite.width;
        sctx.save();
        sctx.translate(this.x,this.y);
        sctx.rotate(this.rotatation*RAD);
        sctx.drawImage(this.animations[this.frame].sprite,-w/2,-h/2);
        sctx.restore();
    },
    update : function() {
        let r = parseFloat( this.animations[0].sprite.width)/2;
        switch (state.curr) {
            case state.getReady :
                this.rotatation = 0;
                this.y +=(frames%10==0) ? Math.sin(frames*RAD) :0;
                this.frame += (frames%10==0) ? 1 : 0;
                break;
            case state.Play :
                this.frame += (frames%5==0) ? 1 : 0;
                this.y += this.speed;
                this.setRotation()
                this.speed += this.gravity;
                if(this.y + r  >= gnd.y||this.collisioned())
                {
                    state.curr = state.gameOver;
                    // pipe.gap == 130
                }
                
                break;
            case state.gameOver : 
                this.frame = 1;
                if(this.y + r  < gnd.y) {
                    this.y += this.speed;
                    this.setRotation()
                    this.speed += this.gravity*2;
                }
                else {
                this.speed = 0;
                this.y=gnd.y-r;
                this.rotatation=90;
                if(!SFX.played) {
                    SFX.die.play();
                    SFX.played = true;
                }
                }
                
                break;
        }
        this.frame = this.frame%this.animations.length;       
    },
    flap : function(){
        if(this.y > 0)
        {
            this.gravity = 0;
            SFX.flap.play();
            this.speed = -this.thrust;
            var self = this;
            setTimeout(function() {
                self.gravity = .125;
            }, 200);
        }
    },
    setRotation : function(){
        if(this.speed <= 0)
        {
            
            this.rotatation = Math.max(-25, -25 * this.speed/(-1*this.thrust));
        }
        else if(this.speed > 0 ) {
            this.rotatation = Math.min(90, 90 * this.speed/(this.thrust*2));
        }
    },
    collisioned : function(){
        if(!pipe.pipes.length) return;
        let bird = this.animations[0].sprite;
        let x = pipe.pipes[0].x;
        let y = pipe.pipes[0].y;
        let r = bird.height/4 +bird.width/4;
        let roof = y + parseFloat(pipe.top.sprite.height);
        let floor = roof + pipe.gap;
        let w = parseFloat(pipe.top.sprite.width);
        if(this.x + r>= x)
        {
            if(this.x + r < x + w)
            {
                if(this.y - r <= roof || this.y + r>= floor)
                {
                    SFX.hit.play();
                    return true;
                }

            }
            else if(pipe.moved)
            {
                UI.score.curr++;
                SFX.score.play();
                pipe.moved = false;
            }

            
                
        }
    }
};
const UI = {
    getReady : {sprite : new Image()},
    gameOver : {sprite : new Image()},
    tap : [{sprite : new Image()},
        {sprite : new Image()}],
    score : {
        curr : 0,
        best : 0,
    },
    x :0,
    y :0,
    tx :0,
    ty :0,
    frame : 0,
    draw : function() {
        switch (state.curr) {
            case state.getReady :
                this.y = parseFloat(scrn.height-this.getReady.sprite.height)/2;
                this.x = parseFloat(scrn.width-this.getReady.sprite.width)/2;
                this.tx = parseFloat(scrn.width - this.tap[0].sprite.width)/2;
                this.ty = this.y + this.getReady.sprite.height- this.tap[0].sprite.height;
                sctx.drawImage(this.getReady.sprite,this.x,this.y);
                sctx.drawImage(this.tap[this.frame].sprite,this.tx,this.ty)
                break;
            case state.gameOver :
                this.y = parseFloat(scrn.height-this.gameOver.sprite.height)/2;
                this.x = parseFloat(scrn.width-this.gameOver.sprite.width)/2;
                this.tx = parseFloat(scrn.width - this.tap[0].sprite.width)/2;
                this.ty = this.y + this.gameOver.sprite.height- this.tap[0].sprite.height;
                sctx.drawImage(this.gameOver.sprite,this.x,this.y);
                sctx.drawImage(this.tap[this.frame].sprite,this.tx,this.ty)
                pipe.gap == 130
                spawnRate = 140
                frames == 0
                console.log('you lose')
                // setTimeout(function() {
                //     location.reload();
                // }, 200);
                break;
        }
        this.drawScore();
    },
    drawScore : function() {
            sctx.fillStyle = "#FFFFFF";
            sctx.strokeStyle = "#000000";
        switch (state.curr) {
            case state.Play :
                sctx.lineWidth = "2";
                sctx.font = "35px Times New Roman";
                sctx.fillText(this.score.curr,scrn.width/2-5,50);
                sctx.strokeText(this.score.curr,scrn.width/2-5,50);
                break;
            case state.gameOver :
                    sctx.lineWidth = "2";
                    sctx.font = "40px Times New Roman";
                    let sc = `SCORE :     ${this.score.curr}`;
                    /*  try {
                        this.score.best = Math.max(this.score.curr,localStorage.getItem("best"));
                        localStorage.setItem("best",this.score.best);
                        let bs = `BEST  :     ${this.score.best}`;
                        sctx.fillText(sc,scrn.width/2-80,scrn.height/2+0);
                        sctx.strokeText(sc,scrn.width/2-80,scrn.height/2+0);
                        sctx.fillText(bs,scrn.width/2-80,scrn.height/2+30);
                        sctx.strokeText(bs,scrn.width/2-80,scrn.height/2+30);
                    }
                    catch(e) {
                        sctx.fillText(sc,scrn.width/2-85,scrn.height/2+15);
                        sctx.strokeText(sc,scrn.width/2-85,scrn.height/2+15);
                    } */
                    
                break;
        }
    },
    update : function() {
        if(state.curr == state.Play) return;
        this.frame += (frames % 10==0) ? 1 :0;
        this.frame = this.frame % this.tap.length;
    }

};

gnd.sprite.src="https://raw.githubusercontent.com/CopeBears/AtariFiles/main/ground.png";
bg.sprite.src="https://raw.githubusercontent.com/CopeBears/AtariFiles/main/BG.png";
pipe.top.sprite.src="https://raw.githubusercontent.com/CopeBears/AtariFiles/main/toppipe.png";
pipe.bot.sprite.src="https://raw.githubusercontent.com/CopeBears/AtariFiles/main/botpipe.png";
UI.gameOver.sprite.src="https://raw.githubusercontent.com/CopeBears/AtariFiles/main/go.png";
UI.getReady.sprite.src="https://raw.githubusercontent.com/CopeBears/AtariFiles/main/getready.png";
UI.tap[0].sprite.src="https://raw.githubusercontent.com/CopeBears/AtariFiles/main/t0.png";
UI.tap[1].sprite.src="https://raw.githubusercontent.com/CopeBears/AtariFiles/main/t1.png";
bird.animations[0].sprite.src="https://raw.githubusercontent.com/CopeBears/AtariFiles/main/b0.png";
bird.animations[1].sprite.src="https://raw.githubusercontent.com/CopeBears/AtariFiles/main/b1.png";
bird.animations[2].sprite.src="https://raw.githubusercontent.com/CopeBears/AtariFiles/main/b2.png";
bird.animations[3].sprite.src="https://raw.githubusercontent.com/CopeBears/AtariFiles/main/b2.png";
SFX.start.src = "https://github.com/CopeBears/AtariFiles/blob/main/sfx/start.wav?raw=true"
SFX.flap.src = "https://github.com/CopeBears/AtariFiles/blob/main/sfx/flap.wav?raw=true"
SFX.score.src = "https://github.com/CopeBears/AtariFiles/blob/main/sfx/score.wav?raw=true"
SFX.hit.src = "https://github.com/CopeBears/AtariFiles/blob/main/sfx/hit.wav?raw=true"
SFX.die.src = "https://github.com/CopeBears/AtariFiles/blob/main/sfx/die.wav?raw=true"

gameLoop();

function gameLoop() {
    update();
    draw();
    frames++;

    if (frames % 1200 == 0 && gap > 80 && state.curr == 1) {
        if (pipe.pipes.length > 0 && !(bird.x >= pipe.pipes[0].x && bird.x <= pipe.pipes[0].x + pipe.top.sprite.width)) {
            gap -= 2; // Decrease gap size by 1
        }
    }

    if (frames % 800 == 0 && spawnRate > 70 && state.curr == 1) {
        spawnRate -= 8;
    }

    if (state.curr == 2 && gap < 110) {
        gap = 110;
        frames = 0;
        console.log('gameover');
    }

    // Check if the last spawned pipe is too close to the current time
    if (pipe.pipes.length > 0 && frames - pipe.pipes[pipe.pipes.length - 1].spawnTime < 100) {
        // Wait for a certain time before spawning the next pipe
        setTimeout(gameLoop, 100);
    } else {
        // Call the gameLoop() function again after a delay of 6 milliseconds (approximately 60 frames per second)
        setTimeout(gameLoop, gameSpeed);
    }
}

function update() {
    if (state.curr === state.Play) {
    bird.update();
    gnd.update();
    pipe.update();
    UI.update();
    }
    }

let gameStarted  = false;
function draw() {
    sctx.fillStyle = "#30c0df";
    sctx.fillRect(0, 0, scrn.width, scrn.height);
    
    if (state.curr === state.getReady) {
        sctx.fillStyle = "#000000";
        sctx.font = "80px Arial";
        sctx.textAlign = "center";
        sctx.fillText(Math.round(timer), scrn.width / 2, scrn.height / 2);
        
        if (timer > 0) {
            timer -= 1 / 60; // Decrease the timer by 1 second per frame (assuming 60 frames per second)
        } else {
            gameSpeed = 6;
            state.curr = state.Play;
            SFX.start.play();
            gameStarted = true; // Set gameStarted to true when the game starts
        }
    } else {
        bg.draw();
        pipe.draw();
        bird.draw();
        gnd.draw();
        UI.draw();
    }
}

// Add an event listener for the spacebar press
document.addEventListener("keydown", function(event) {
    if (event.code === "Space" && gameStarted) {
        bird.flap(); // Execute bird.flap() only if the game has started
    }
});

// Add event listener for visibility change
document.addEventListener("visibilitychange", handleVisibilityChange);

function handleVisibilityChange() {
  if (document.hidden) {
    // Tab is hidden, set state.curr to gameOver
    state.curr = state.gameOver;
  } else {
    // Tab is visible, handle accordingly (e.g., resume the game)
    // ...
  }
}


