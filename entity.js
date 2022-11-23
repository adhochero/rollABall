import { Projectile } from "./projectile.js";

export class Entity{
    constructor(canvas, keys){
        this.keys = keys;
        this.isMine = false;

        this.spriteGrey = document.getElementById('sphere');
        this.spriteRed = document.getElementById('sphere__red');
        this.spriteBlue = document.getElementById('sphere__blue');
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
        this.lives = 3;
        this.markedForDeletion = false;

        this.joystickRange = 50;
        this.initX = 0;
        this.initY = 0;
        this.joystickX = 0;
        this.joystickY = 0;

        window.addEventListener('mousedown', e =>{
            this.initX = e.clientX || e.touches[0].clientX;
            this.initY = e.clientY || e.touches[0].clientY;
        })

        document.addEventListener('mousemove', e =>{
            let draggedX = (e.clientX || e.touches[0].clientX) - initX;
            let draggedY = (e.clientY || e.touches[0].clientY) - initY;

            //clamps to joystickRange
            draggedX = (draggedX > 0) ? Math.min(joystickRange, draggedX): Math.max(-joystickRange, draggedX);
            draggedY = (draggedY > 0) ? Math.min(joystickRange, draggedY): Math.max(-joystickRange, draggedY);

            //scaling 0 to 1
            draggedX /= joystickRange;
            draggedY /= joystickRange;

            //solves diagonal discrepancy
            if(draggedX !== 0 && draggedY !== 0){
                draggedX *= Math.SQRT1_2;
                draggedY *= Math.SQRT1_2;
            }

            this.joystickX = draggedX;
            this.joystickY = draggedY;
        });
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

            this.inputDirection.x = this.joystickX;
            this.inputDirection.y = this.joystickY;
    
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

        //lives
        context.fillStyle = 'white';
        context.font = '20px Helvetica';
        context.fillText(this.lives, this.position.x - 14, this.position.y + 4);

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