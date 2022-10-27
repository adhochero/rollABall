export class Projectile{
    constructor(position, direction){
        this.position = {x: position.x, y: position.y};
        this.direction = {x: direction.x, y: direction.y};
        this.pushPower = 100;
        this.width = 8;
        this.height = 8;
        this.moveSpeed = 16;
        this.markedForDeletion = false;
    }

    update(){
        this.position.x += this.direction.x * this.moveSpeed;
        this.position.y += this.direction.y * this.moveSpeed;
    }

    draw(context){
        context.fillStyle = 'black';
        context.fillRect(this.position.x  - this.width * 0.5, this.position.y - this.height * 0.5, this.width, this.height);
    }
}