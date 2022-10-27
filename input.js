export class Input{
    constructor(keys, entities){
        this.keys = keys;
        this.entities = entities;
        this.mousePosition;

        window.addEventListener('keydown', e => {
            if((e.key === 'w' || 
                e.key === 'a' ||
                e.key === 's' ||
                e.key === 'd'
                ) && this.keys.indexOf(e.key) === -1){
                this.keys.unshift(e.key);
            }
        });
        window.addEventListener('keyup', e => {
            if(this.keys.indexOf(e.key) > -1){
                this.keys.splice(this.keys.indexOf(e.key), 1);
            }
        });

        window.addEventListener('mousedown', e =>{
            this.entities.forEach(entity => {
                if(!entity.isMine) return;

                const rect = canvas.getBoundingClientRect();
                this.mousePosition = {
                    x: ((e.clientX - rect.left) / (rect.right - rect.left)) * canvas.width,
                    y: ((e.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height,
                }
                let aimDirection = {
                    x: this.mousePosition.x - canvas.width * 0.5,
                    y: this.mousePosition.y - canvas.height * 0.5
                }
                //use angle to normailse vector
                let angle = Math.atan2(aimDirection.y, aimDirection.x);
                let angleDirection = {
                    x: Math.cos(angle),
                    y: Math.sin(angle)
                }
                entity.shoot(angleDirection);
            });
        })
    }
}