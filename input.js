export class Input{
    constructor(keys){
        this.keys = keys;
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
    }
}