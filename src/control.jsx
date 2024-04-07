import { useState, useEffect, useRef } from 'react'
import { useSnackbar } from 'notistack'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import axios from 'axios';
import { useNavigate } from 'react-router-dom'
import roverLogo from './assets/rover-64px.png'
import Canvas from './components/Canvas'
import Rover from './components/rover'
import Mine from './components/mine';

function App() {

    const history = useNavigate()
  const [roverMap, setRoverMap] = useState();
  const [minesArr, setMinesArr] = useState();
  const mapRef = useRef();
  const minesRef = useRef();
  mapRef.current = roverMap;
  minesRef.current = minesArr;

  const [rover1, setRover1] = useState({ rover: new Rover(1, 0, 0) });

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const { sendJsonMessage, sendMessage, lastMessage, readyState, getWebSocket} = useWebSocket(
    "wss://coe892lab42024g82033-server.azurewebsites.net/ws",
    {onMessage: (e) => {
      const dataObj = JSON.parse(e.data);
      console.log(dataObj)

      // Handle successful demine
      if(dataObj.res == 'demineSuccess') {
        const mineObj = dataObj.detail;
        enqueueSnackbar(`Successfully demined mine with id ${mineObj.id} at (${mineObj.x},${mineObj.y})`, {variant: 'success'});

        const newMinesArr = minesRef.current.filter((mine) => {
          return mine.id != mineObj.id;
        })
        
        setMinesArr(newMinesArr);
      }
    }}  
  );

  function handleKeyDown(e) {
    //console.log(e)
    //sendMessage(e.key);
    
    const updatedRover = rover1.rover;

    if(rover1.rover.status != 4) {
      switch (e.key) {
        case 'w':
          // Check if rover is trying to move from mine
          let roverDied = false;
          //console.log(minesRef.current)
          for (const mine of Object.entries(minesRef.current)) {
            const mineObj = mine[1];
            if (updatedRover.x == mineObj.x && updatedRover.y == mineObj.y){
              enqueueSnackbar('You died a horrible death!', { variant: 'error' });
              updatedRover.status = 4;
              roverDied = true;
              
              // Update minesArr
              const newMinesArr = [...minesRef.current];
              newMinesArr.forEach((m) => {
                if(m.id === mineObj.id){
                  m.isActive = false;
                }
              })
              setMinesArr(newMinesArr);

              break;
            }
          }
          if(roverDied) {
            break;
          }
          // Check if rover is trying to move out of bounds of map
          if ((updatedRover.direction == 0 && updatedRover.y > 0) ||
            (updatedRover.direction == 1 && updatedRover.x < mapRef.current[0].length - 1) ||
            (updatedRover.direction == 2 && updatedRover.y < mapRef.current.length - 1) ||
            (updatedRover.direction == 3 && updatedRover.x > 0)
          ) {
            updatedRover.move('M');
          }
          else {
            enqueueSnackbar('Stop trying to move out of bounds buddy!', { variant: 'warning' });
          }
          break;
        case 'a':
          updatedRover.move('L');
          break;
        case 'd':
          updatedRover.move('R');
          break;
        case ' ':
          for (const mine of Object.entries(minesRef.current)) {
            const mineObj = mine[1];
            if (updatedRover.x == mineObj.x && updatedRover.y == mineObj.y){
              enqueueSnackbar(`Sending demine request to server for mine at (${mineObj.x},${mineObj.y})`, {variant: 'info'})

              
              sendJsonMessage({
                request: 'demine',
                detail: mineObj
              });
              break;
            }
          }
          break;
        default:
          enqueueSnackbar('Use \'A\' and \'D\' to turn the rover and \'W\' to move rover forward, press Spacebar to demine', {variant: 'info'})
          break;
      }
    }
    setRover1({ rover: updatedRover })
  }

  useEffect(() => {
    // Get rover map and mines dict from server
      axios.get('https://coe892lab42024g82033-server.azurewebsites.net/map')
    .then( res => {
      setRoverMap(res.data.roverMap);
    })
    .catch( err => {
      console.log(err);
    })

    // Get rover map and mines dict from server
      axios.get('https://coe892lab42024g82033-server.azurewebsites.net/mines')
    .then( res => {
      const tempArr = [];
      for (const mine of Object.entries(res.data.all_mines)) {
        const mineObj = mine[1];
        //console.log(mine)
        tempArr.push(new Mine(mine[0], mineObj.x, mineObj.y, mineObj.msn));
      }
      setMinesArr(tempArr);
    })
    .catch( err => {
      console.log(err);
    })

    document.addEventListener('keydown', handleKeyDown);

    return function cleanup() {
      document.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

    const goBack = (e) => {
        e.preventDefault();
        let url = "/"

        history({
            pathname: url,
            state: {}
        });
    }

  return (
    <>
          <div style={{ width: '100%' }, { display: 'flex' }, { margin: '0 auto' }}>
              <button onClick={goBack} style={{ border: '1px solid black', padding: '5px', height: 'fit-content' }}>Back</button>
            <img src={roverLogo} className="logo" />


        </div>
      <h1 className='text-rose-500'>Rover Control</h1>

      { roverMap && minesArr ? (
        <Canvas map={roverMap} mines={minesArr} rover={rover1.rover} />
      ) : (
        <div>Loading data from server...</div>
      )}
      
    </>
  )
}

export default App
