import {Input} from './input.js'
import {Entity} from './entity.js'
import {Environment} from './environment.js'

let canvas;
let context;
let secondsPassed = 0;
let lastTimeStamp = 0;
let fps;
let input;
let keys = [];
let entities;
let environment;
let follow = {x: 0, y: 0};
let followSpeed = 0.05;


window.onload = init;

function init(){
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    canvas.width = 666;
    canvas.height = 500;

    environment = new Environment();

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

    follow.x = -entities[0].position.x + canvas.width / 2;
    follow.y = -entities[0].position.y + canvas.height / 2;

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

        //check for entity collisions
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
        });

        //check for wall collisions
        environment.walls.forEach(wall => {
            if(checkCircleToRectCollision(entity, wall)){
                if (entity.position.x + entity.moveDirection.x > (wall.x - wall.width/2) - entity.width/2 &&
                    entity.position.x < (wall.x - wall.width/2)){
                    entity.velocity.x = -entity.moveDirection.x * 1.25;
                    entity.position.x = wall.x - wall.width/2 - entity.width/2;
                }
                else if (entity.position.x + entity.moveDirection.x < (wall.x + wall.width/2) + entity.width/2 &&
                    entity.position.x > (wall.x + wall.width/2)){
                    entity.velocity.x = -entity.moveDirection.x * 1.25;
                    entity.position.x = wall.x + wall.width/2 + entity.width/2;
                }
                else if (entity.position.y + entity.moveDirection.y > (wall.y - wall.height/2) - entity.height/2 &&
                    entity.position.y < (wall.y - wall.height/2)){
                    entity.velocity.y = -entity.moveDirection.y * 1.25;
                    entity.position.y = wall.y - wall.height/2 - entity.height/2;
                }
                else if (entity.position.y + entity.moveDirection.y < (wall.y + wall.height/2) + entity.height/2 &&
                    entity.position.y > (wall.y + wall.height/2)){
                    entity.velocity.y = -entity.moveDirection.y * 1.25;
                    entity.position.y = wall.y + wall.height/2 + entity.height/2;
                }
            }
        })
    });
    
}

function draw(){
    //clear the entire canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    follow.x = lerp(follow.x, -entities[0].position.x + canvas.width / 2, followSpeed);
    follow.y = lerp(follow.y, -entities[0].position.y + canvas.height / 2, followSpeed);

    context.save();
    context.translate(follow.x, follow.y);

    environment.draw(context);

    entities.forEach(entity => {
        entity.draw(context);
    });

    context.restore();
}

function lerp(start, end, t){
    return  (1 - t) * start + end * t;
}

function checkCircleCollision(cir1, cir2){
    //assumes x and y pos is center
    let dx = cir1.position.x - cir2.position.x;
    let dy = cir1.position.y - cir2.position.y;
    let radiusSum = cir1.width * 0.5 + cir2.width * 0.5;

    return (dx * dx + dy * dy <= radiusSum * radiusSum)
}

function checkCircleToRectCollision(cir, rect){
    //assumes x and y pos is center
    let distance = {
        x: Math.abs(cir.position.x - rect.x),
        y: Math.abs(cir.position.y - rect.y)
    };

    if(distance.x > rect.width/2 + cir.width/2) return false;
    if(distance.y > rect.height/2 + cir.height/2) return false;

    if(distance.x <= rect.width/2) return true;
    if(distance.y <= rect.height/2) return true;

    let dx = distance.x - rect.width/2;
    let dy = distance.y - rect.height/2;
    return (dx * dx + dy * dy <= cir.width/2 * cir.width/2);
}