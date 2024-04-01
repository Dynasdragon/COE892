class Mine {
    constructor(id, x, y, msn) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.msn = msn;
        this.isActive = true;
        this.img = new Image();
        this.img.src = 'https://cdn-icons-png.flaticon.com/32/9921/9921463.png';
    }
}

export default Mine;