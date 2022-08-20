var time = new Date();
var deltaTime = 0;

if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(Init, 1);
} else {
    document.addEventListener("DOMContentLoaded", Init);
}

function Init() {
    time = new Date();
    Start();
    Loop();
}

function Loop() {
    deltaTime = (new Date() - time) / 1000;
    time = new Date();
    Update();
    requestAnimationFrame(Loop);
}

//****** GAME LOGIC ********//

var floorY = 22;
var velY = 0;
var boost = 900;
var gravity = 2500;

var dinoX = 42;
var dinoY = floorY;

var floorX = 0;
var stageSpeed = 1280 / 3;
var gameSpeed = 1;
var score = 0;

var isStanding = false;
var isJumping = false;

var timeToObstacle = 2;
var minTimeToObstacle = 0.7;
var maxTimeToObstacle = 1.8;
var obstacleY = 16;
var obstacles = [];

var timeToCloud = 0.5;
var minTimeToCloud = 0.7;
var maxTimeToCloud = 2.7;
var maxCloudY = 270;
var minCloudY = 100;
var clouds = [];
var cloudSpeed = 0.5;

var container;
var dino;
var textScore;
var floor;
var textGameOver;

function Start() {
    textGameOver = document.querySelector(".game-over");
    floor = document.querySelector(".floor");
    container = document.querySelector(".container");
    textScore = document.querySelector(".score");
    dino = document.querySelector(".dino");
    document.addEventListener("keydown", HandleKeyJump);
    document.addEventListener("touchstart", HandleKeyJump);

}

function Update() {
    if (isStanding) return;

    moveDino();
    moveFloor();
    addObstacle();
    addCloud();
    moveObstacles();
    moveClouds();
    collisionDetection();

    velY -= gravity * deltaTime;
}

function HandleKeyJump(ev) {
    if (ev.keyCode == 32 || ev.type == "touchstart") {
        jump();
    }
}

function jump() {
    if (dinoY === floorY) {
        isJumping = true;
        velY = boost;
        dino.classList.remove("dino-running");
    }
}

function moveDino() {
    dinoY += velY * deltaTime;
    if (dinoY < floorY) {
        touchGround();
    }
    dino.style.bottom = dinoY + "px";
}

function touchGround() {
    dinoY = floorY;
    velY = 0;
    if (isJumping) {
        dino.classList.add("dino-running");
    }
    isJumping = false;
}

function moveFloor() {
    floorX += calculateDisplacement();
    floor.style.left = -(floorX % container.clientWidth) + "px";
}

function calculateDisplacement() {
    return stageSpeed * deltaTime * gameSpeed;
}

function crash() {
    dino.classList.remove("dino-running");
    dino.classList.add("dino-crashed");
    isStanding = true;
}

function addObstacle() {
    timeToObstacle -= deltaTime;
    if (timeToObstacle <= 0) {
        var obstacle = document.createElement("div");
        container.appendChild(obstacle);
        obstacle.classList.add("cactus");
        if (Math.random() > 0.5) obstacle.classList.add("cactus2");
        obstacle.posX = container.clientWidth;
        obstacle.style.left = container.clientWidth + "px";

        obstacles.push(obstacle);
        timeToObstacle = minTimeToObstacle + Math.random() * (maxTimeToObstacle - minTimeToObstacle) / gameSpeed;
    }
}

function addCloud() {
    timeToCloud -= deltaTime;
    if (timeToCloud <= 0) {
        var cloud = document.createElement("div");
        container.appendChild(cloud);
        cloud.classList.add("cloud");
        cloud.posX = container.clientWidth;
        cloud.style.left = container.clientWidth + "px";
        cloud.style.bottom = minCloudY + Math.random() * (maxCloudY - minCloudY) + "px";

        clouds.push(cloud);
        timeToCloud = minTimeToCloud + Math.random() * (maxTimeToCloud - minTimeToCloud) / gameSpeed;
    }
}

function moveObstacles() {
    for (var i = obstacles.length - 1; i >= 0; i--) {
        if (obstacles[i].posX < -obstacles[i].clientWidth) {
            obstacles[i].parentNode.removeChild(obstacles[i]);
            obstacles.splice(i, 1);
            addScore();
        } else {
            obstacles[i].posX -= calculateDisplacement();
            obstacles[i].style.left = obstacles[i].posX + "px";
        }
    }
}

function moveClouds() {
    for (var i = clouds.length - 1; i >= 0; i--) {
        if (clouds[i].posX < -clouds[i].clientWidth) {
            clouds[i].parentNode.removeChild(clouds[i]);
            clouds.splice(i, 1);
        } else {
            clouds[i].posX -= calculateDisplacement() * cloudSpeed;
            clouds[i].style.left = clouds[i].posX + "px";
        }
    }
}

function addScore() {
    score++;
    textScore.innerText = score;
    if (score == 5) {
        gameSpeed = 1.2;
        container.classList.add("noon");
    } else if (score == 10) {
        gameSpeed = 1.5;
        container.classList.add("evening");
    } else if (score == 15) {
        gameSpeed = 2;
        container.classList.add("night");
    }
    floor.style.animationDuration = (3 / gameSpeed) + "s";
}

function gameOver() {
    crash();
    textGameOver.style.display = "block";
}

function collisionDetection() {
    for (var i = 0; i < obstacles.length; i++) {
        if (obstacles[i].posX > dinoX + dino.clientWidth) {
            break;
        } else {
            if (isCollision(dino, obstacles[i], 10, 30, 15, 20)) {
                gameOver();
            }
        }
    }
}

function isCollision(a, b, paddingTop, paddingRight, paddingBottom, paddingLeft) {
    var aRect = a.getBoundingClientRect();
    var bRect = b.getBoundingClientRect();

    return !(
        ((aRect.top + aRect.height - paddingBottom) < (bRect.top)) ||
        (aRect.top + paddingTop > (bRect.top + bRect.height)) ||
        ((aRect.left + aRect.width - paddingRight) < bRect.left) ||
        (aRect.left + paddingLeft > (bRect.left + bRect.width))
    );
}