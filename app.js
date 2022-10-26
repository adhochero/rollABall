import {Entity} from './entity.js'
import {Input} from './input.js'

let canvas;
let context;
let secondsPassed = 0;
let lastTimeStamp = 0;
let fps;
let input;
let keys = [];
let entities;


window.onload = init;

function init(){
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    canvas.width = 666;
    canvas.height = 500;

    input = new Input(keys);
    entities = [
        new Entity(canvas, keys),
        new Entity(canvas, keys),
        new Entity(canvas, keys),
        new Entity(canvas, keys),
        new Entity(canvas, keys),
        new Entity(canvas, keys),
        new Entity(canvas, keys),
        new Entity(canvas, keys),
    ];
    entities[0].isMine = true;

    entities.forEach(entity => {
        if(!entity.isMine){
            entity.position.x = Math.random() * canvas.width/2 + canvas.width/4;
            entity.position.y = Math.random() * canvas.height/2 + canvas.height/4;
            entity.velocity.x = Math.random() * 400 - 200;
            entity.velocity.y = Math.random() * 400 - 200;
        }
    });

    //start the first frame request
    window.requestAnimationFrame(gameLoop);
}

function gameLoop(timeStamp){
    //calculate the number of seconds passed since the last frame
    secondsPassed = (timeStamp - lastTimeStamp) / 1000;
    lastTimeStamp = timeStamp;

    // Move forward in time with a maximum amount
    secondsPassed = Math.min(secondsPassed, 0.1);

    //calculate fps
    fps = Math.round(1 / secondsPassed);

    //update game objects in the loop
    update(secondsPassed);
    draw();

    //keep requesting new frames
    window.requestAnimationFrame(gameLoop);
}

function update(secondsPassed){
    entities.forEach(entity => {
        entity.update(secondsPassed);

        //check for collisions
        entities.forEach(otherEntity => {
            if(otherEntity === entity) return;
            
            if(checkCircleCollision(entity, otherEntity)){
                let collision = {
                    x: otherEntity.position.x - entity.position.x,
                    y: otherEntity.position.y - entity.position.y
                };

                let distance = Math.sqrt(
                    (otherEntity.position.x - entity.position.x) *
                    (otherEntity.position.x - entity.position.x) +
                    (otherEntity.position.y - entity.position.y) *
                    (otherEntity.position.y - entity.position.y) 
                );

                let collisionNormal = {
                    x: collision.x / distance,
                    y: collision.y / distance
                };

                let relativeVelocity = {
                    x: entity.moveDirection.x - otherEntity.moveDirection.x,
                    y: entity.moveDirection.y - otherEntity.moveDirection.y
                };

                let speed = relativeVelocity.x * collisionNormal.x + relativeVelocity.y * collisionNormal.y;
                if(speed < 0) return;

                entity.velocity.x -= (speed * collisionNormal.x);
                entity.velocity.y -= (speed * collisionNormal.y);
                otherEntity.velocity.x += (speed * collisionNormal.x);
                otherEntity.velocity.y += (speed * collisionNormal.y);
            }
        })
    });
    
}

function draw(){
    //clear the entire canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    entities.forEach(entity => {
        entity.draw(context);
    });
}

function checkCircleCollision(cir1, cir2){
    //assumes x and y pos is center of circles
    let dx = cir1.position.x - cir2.position.x;
    let dy = cir1.position.y - cir2.position.y;
    let radiusSum = cir1.width * 0.5 + cir2.width * 0.5;

    return (dx * dx + dy * dy <= radiusSum * radiusSum)
}