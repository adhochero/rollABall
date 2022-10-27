import { Projectile } from "./projectile.js";

export class Entity{
    constructor(canvas, keys){
        this.keys = keys;
        this.isMine = false;

        this.image = document.getElementById('sphere');
        this.scale = 3;
        this.width = this.image.width * this.scale;
        this.height = this.image.height * this.scale;

        this.inputDirection = {x: 0, y: 0};
        this.inputSmoothing = {x: 0, y: 0};
        this.velocity = {x: 0, y: 0};
        this.moveDirection = {x: 0, y: 0};
        this.position = {x: canvas.width / 2, y: canvas.height / 2};
        this.inputResponsiveness = 3;
        this.moveSpeed = 200;

        this.projectiles = [];
    }

    update(secondsPassed){
        if(this.isMine){
            //get input direction
            if(this.keys.includes('a') && !this.keys.includes('d')) this.inputDirection.x = -1;
            else if(this.keys.includes('d') && !this.keys.includes('a')) this.inputDirection.x = 1;
            else this.inputDirection.x = 0;
    
            if(this.keys.includes('w') && !this.keys.includes('s')) this.inputDirection.y = -1;
            else if(this.keys.includes('s') && !this.keys.includes('w')) this.inputDirection.y = 1;
            else this.inputDirection.y = 0;
    
            //solves diagonal movement speed discrepancy
            if(this.inputDirection.x !== 0 && this.inputDirection.y !== 0){
                this.inputDirection.x *= Math.SQRT1_2;
                this.inputDirection.y *= Math.SQRT1_2;
            }
    
            //smooth input movement using lerp
            this.inputSmoothing.x = this.lerp(this.inputSmoothing.x, this.inputDirection.x, this.inputResponsiveness * secondsPassed);
            this.inputSmoothing.y = this.lerp(this.inputSmoothing.y, this.inputDirection.y, this.inputResponsiveness * secondsPassed);
        }

        //move velocity to zero
        this.velocity.x = this.lerp(this.velocity.x, 0, this.inputResponsiveness * secondsPassed);
        this.velocity.y = this.lerp(this.velocity.y, 0, this.inputResponsiveness * secondsPassed);

        //combine velocity and input movement
        this.moveDirection.x = this.velocity.x + (this.inputSmoothing.x * this.moveSpeed);
        this.moveDirection.y = this.velocity.y + (this.inputSmoothing.y * this.moveSpeed);

        //move
        this.position.x += this.moveDirection.x * secondsPassed;
        this.position.y += this.moveDirection.y * secondsPassed;

        //projectiles
        this.projectiles.forEach(projctile => {
            projctile.update();
        });
        this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);
    }

    draw(context){
        //draw entity
        context.imageSmoothingEnabled = false;
        context.drawImage(
            this.image,
            this.position.x - this.width * 0.5,
            this.position.y - this.height * 0.5,
            this.width,
            this.height
        );

        //projectiles
        this.projectiles.forEach(projctile => {
            projctile.draw(context);
        });
        this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);
    }

    lerp(start, end, t){
        return  (1 - t) * start + end * t;
    }

    shoot(angleDirection){
        let recoil = 100;

        //recoil pushback
        this.velocity.x += -angleDirection.x * recoil;
        this.velocity.y += -angleDirection.y * recoil;

        //spawn bullet
        this.projectiles.push(new Projectile(this.position, angleDirection));
    }
}