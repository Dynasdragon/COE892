import mineImg from '../assets/mine.png'
class Mine {
    constructor(id, x, y, msn) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.msn = msn;
        this.isActive = true;
        this.img = new Image();
        this.img.src = mineImg;
    }
}

export default Mine;
