class Rover {
  constructor(id, x, y) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.direction = 1;  //Cardinal direction: 0,1,2,3 = N,E,S,W
    this.status = 3;     // 1,2,3,4 = NotStarted, Finished, Moving, Eliminated
    this.img = new Image();
    this.img.src = 'https://cdn-icons-png.flaticon.com/32/8966/8966771.png';
  }

  move(cmd) {
    switch (cmd) {
      case 'L':
        this.direction > 0 ? this.direction -= 1 : this.direction = 3 // loop back to 3 if turning left at 0
        break;
      case 'R':
        this.direction < 3 ? this.direction += 1 : this.direction = 0 // loop back to 0 if turning right at 3
        break;
      case 'M':
        switch (this.direction) {
          case 0:
            //if(this.y > 0) 
              this.y -= 1
              break;
          case 1:
            //if this.x < mapDimensions[1] - 1:
              this.x += 1
              break;
          case 2:
            //if this.y < mapDimensions[0] - 1:
              this.y += 1
              break;
          case 3:
            //if this.x > 0:
              this.x -= 1
              break;
        }
        break;
      default:
        console.log(`Error: unknown command: ${cmd} passed into Rover.move(), which only accepts 'L', 'R', 'M', 'D'`)
    }
  }
}

export default Rover;