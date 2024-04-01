import React, { useEffect, useRef } from 'react';

const Canvas = ({map, rover, mines}) => {
  const canvasRef = useRef(null);
  const gridWidthX = map[0].length, gridWidthY = map.length;
  const squareSizePx = 50;
  const roverGridOffset = squareSizePx*0.71;

  //console.log(`width: ${gridWidthX} | height: ${gridWidthY}`)

  const draw = (context, roverImage) => {
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    // Box width
    var bw = squareSizePx*gridWidthX;
    // Box height
    var bh = squareSizePx*gridWidthY;
    // Padding
    var p = 10;

    for (var x = 0; x <= bw; x += squareSizePx) {
      context.moveTo(0.5 + x + p, p);
      context.lineTo(0.5 + x + p, bh + p);
    }

    for (var x = 0; x <= bh; x += squareSizePx) {
      context.moveTo(p, 0.5 + x + p);
      context.lineTo(bw + p, 0.5 + x + p);
    }
    context.strokeStyle = "black";
    context.stroke();


    // Draw Mines if alive
    for (const mine of Object.entries(mines)){
      //console.log(mine)
      //console.log(`Drawing mine at x=${mine[1].x}, y=${mine[1].y}`)
      const mineObj = mine[1];

      if(mineObj.isActive) {
        const mineGridOffset = roverGridOffset*0.56;
        const mineCanvasX = (mineObj.x*squareSizePx)+mineGridOffset, mineCanvasY = (mineObj.y*squareSizePx)+mineGridOffset;
        
        const mineImg = new Image();
        mineImg.src = 'https://cdn-icons-png.flaticon.com/32/9921/9921463.png';
        context.drawImage(mineObj.img, mineCanvasX, mineCanvasY, roverImage.width, roverImage.height);
      }
    }
    
    // Draw Rover if alive
    if (rover.status != 4) {
      context.imageSmoothingEnabled = false;
      // context.setTransform(1, 0, 0, 1, 0, 0); // sets scale and origin
      // context.rotate(Math.PI*4);
      

      const roverCanvasX = (rover.x*squareSizePx)+roverGridOffset, roverCanvasY = (rover.y*squareSizePx)+roverGridOffset;
      //context.drawImage(roverImage, roverCanvasX, roverCanvasY, roverImage.width, roverImage.height);
      //context.drawImage(roverImage, -roverCanvasX / 2, -roverImage.height-40 / 2, roverImage.width, roverImage.height);

      context.save()
      context.translate(Math.floor(roverCanvasX), Math.floor(roverCanvasY))    
      context.rotate(Math.PI/2*(rover.direction-1))
      context.drawImage(roverImage, -roverImage.width / 2, -roverImage.height / 2, roverImage.width, roverImage.height)
      context.restore()
    }


    
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d')

    //console.log(rover.x)
    draw(context, rover.img)

  }, [draw, rover])

  // useEffect(() => {
  //   function handleKeyDown(e) {
  //     console.log(e);
  //     rover.x += 1;
  //   }

  //   document.addEventListener('keydown', handleKeyDown);

  //   // Don't forget to clean up
  //   return function cleanup() {
  //     document.removeEventListener('keydown', handleKeyDown);
  //   }
  // }, []);


  return (
    <canvas 
      ref={canvasRef} 
      height={gridWidthY*squareSizePx+16} 
      width={gridWidthX*squareSizePx+16} 
      className='m-4'
    />
  )
}

export default Canvas;
