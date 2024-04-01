import { useState, useEffect, useRef } from 'react'
import { useSnackbar } from 'notistack'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import axios from 'axios';
import { useNavigate } from 'react-router-dom'
import roverLogo from './assets/rover-64px.png'
import Canvas from './components/Canvas'
import Rover from './components/rover'
import Mine from './components/mine';

function EditPage() {

    const history = useNavigate();
    const [roverMap, setRoverMap] = useState();
    const [minesArr, setMinesArr] = useState();
    const mapRef = useRef();
    const minesRef = useRef();
    mapRef.current = roverMap;
    minesRef.current = minesArr;
    const [rover1, setRover1] = useState({ rover: new Rover(1, 0, 0) });

    useEffect(() => {

        // Get rover map and mines dict from server
        axios.get('https://coe892lab42024g82033-server.azurewebsites.net/map')
            .then(res => {
                setRoverMap(res.data.roverMap);
            })
            .catch(err => {
                console.log(err);
            })

        // Get rover map and mines dict from server
        axios.get('https://coe892lab42024g82033-server.azurewebsites.net/mines')
            .then(res => {
                const tempArr = [];
                for (const mine of Object.entries(res.data.all_mines)) {
                    const mineObj = mine[1];
                    //console.log(mine)
                    tempArr.push(new Mine(mine[0], mineObj.x, mineObj.y, mineObj.msn));
                }
                setMinesArr(tempArr);
            })
            .catch(err => {
                console.log(err);
            })
    }, []);

    //--------------------Map Functions-----------------------
    function updateMap() {
        const row = (document.getElementById('row').value) == "" ? -1: parseInt(document.getElementById('row').value) 
        const col = (document.getElementById('col').value) == "" ? -1 : parseInt(document.getElementById('col').value)
        // Get rover map and mines dict from server
        axios.put(`https://coe892lab42024g82033-server.azurewebsites.net/map`, {r: row, c: col})
            .then(res => {
                setRoverMap(res.data.roverMap);
            })
            .catch(err => {
                console.log(err);
            })
    }


    //--------------------Mine Functions----------------------
    function createMine() {
        var x = (document.getElementById('mineX').value)
        var y = (document.getElementById('mineY').value)
        if (x == "" || y == "")
            return
        x = parseInt(x)
        y = parseInt(y)
        for (const mine of minesArr) {
            if (mine.x == x && mine.y == y) {
                console.log("Mine already exists there")
                return
            }
        }
        var msn = (document.getElementById('msn').value) == "" ? `MSN${x}${y}` : (document.getElementById('msn').value)
        // Get rover map and mines dict from server
        axios.post(`https://coe892lab42024g82033-server.azurewebsites.net/mines`, { x: x, y: y, msn: msn })
            .then(res => {
                const text = document.getElementById("text")
                const tempArr = [];
                for (const mine of minesArr) {
                    tempArr.push(new Mine(mine.id, mine.x, mine.y, mine.msn));
                }
                const data = res.data.created_mine
                tempArr.push(new Mine(res.data.mine_id, data.x, data.y, data.msn))
                text.value = "Added Mine: " + JSON.stringify(data)
                setMinesArr(tempArr)
            })
            .catch(err => {
                console.log(err);
            })
    }
    function getAllMines() {
        axios.get('https://coe892lab42024g82033-server.azurewebsites.net/mines')
            .then(res => {
                const text = document.getElementById("text")
                var string =""
                const tempArr = [];
                for (const mine of Object.entries(res.data.all_mines)) {
                    const mineObj = mine[1];
                    string = string + JSON.stringify(mine)+",\n "
                    //console.log(mine)
                    tempArr.push(new Mine(mine[0], mineObj.x, mineObj.y, mineObj.msn));
                }
                setMinesArr(tempArr);
                text.value = string
            })
            .catch(err => {
                console.log(err);
            })
    }

    function getMine() {
        const mineID = document.getElementById("mineID").value
        axios.get(`https://coe892lab42024g82033-server.azurewebsites.net/mines/${parseInt(mineID)}`)
            .then(res => {
                const text = document.getElementById("text")
                text.value = "Mine: " + JSON.stringify(res.data.retrieved_mine)
            })
            .catch(err => {
                console.log(err);
            })

    }

    function delMine() {
        const mineID = document.getElementById("mineID").value
        axios.delete(`https://coe892lab42024g82033-server.azurewebsites.net/mines/${parseInt(mineID)}`)
            .then(res => {
                const text = document.getElementById("text")

                const tempArr = [];
                for (const mine of minesArr) {
                    if (mine.id != parseInt(mineID))
                        tempArr.push(new Mine(mine.id, mine.x, mine.y, mine.msn));
                }
                setMinesArr(tempArr)
                text.value = "Deleted Mine: " + JSON.stringify(res.data.deleted_mine)
            })
            .catch(err => {
                console.log(err);
            })

    }

    function updateMine() {
        var x = (document.getElementById('mineX').value)
        var y = (document.getElementById('mineY').value)
        var msn = document.getElementById('msn').value
        var mineID = document.getElementById('mineID').value
        if (mineID == "")
            return
        console.log(mineID)
        var url = `${parseInt(mineID)}?`
        if (x != "")
            url = url + `&&x=${parseInt(x)}`
        if (y != "")
            url = url + `&&y=${parseInt(y)}`
        if (msn != "")
            url = url + `&&msn=${msn}`
        if (url.charAt(url.length - 1) == '?')
            url = url.substring(0, url.length - 1)
        // Get rover map and mines dict from server
        axios.put(`https://coe892lab42024g82033-server.azurewebsites.net/mines/` + url)
            .then(res => {
                const data = res.data.updated_mine
                const text = document.getElementById("text")
                text.value = "Updated Mine: " + JSON.stringify(data)
                const tempArr = [];
                for (const mine of minesArr) {
                    if (mine.id == parseInt(mineID))
                        tempArr.push(new Mine(res.data.mine_id, data.x, data.y, data.msn));
                    else
                        tempArr.push(new Mine(mine.id, mine.x, mine.y, mine.msn));
                }
                setMinesArr(tempArr)

            })
            .catch(err => {
                console.log(err);
            })
    }

    //--------------------Rover Functions---------------------
    function getAllRovers() {
        axios.get('https://coe892lab42024g82033-server.azurewebsites.net/rovers')
            .then(res => {
                const text = document.getElementById("text")
                var string = "Status: 1 - Not Started, 2 - Finished, 3 - Moving, 4 - Eliminated\n"
                for (const rover of Object.entries(res.data.all_rovers)) {
                    string = string + JSON.stringify(rover) + ",\n "
                    //console.log(mine)
                }
                text.value = string
            })
            .catch(err => {
                console.log(err);
            })
    }

    function getRover() {
        const roverID = document.getElementById("roverID").value
        axios.get(`https://coe892lab42024g82033-server.azurewebsites.net/rovers/${parseInt(roverID)}`)
            .then(res => {
                const text = document.getElementById("text")
                text.value = "Rover: " + JSON.stringify(res.data.retrieved_rover)
            })
            .catch(err => {
                console.log(err);
            })
    }

    function delRover() {
        const roverID = document.getElementById("roverID").value
        axios.delete(`https://coe892lab42024g82033-server.azurewebsites.net/rovers/${parseInt(roverID)}`)
            .then(res => {
                const text = document.getElementById("text")
                text.value = "Deleted Rover: " + JSON.stringify(res.data.deleted_rover)
            })
            .catch(err => {
                console.log(err);
            })

    }

    function createRover() {
        var instr = document.getElementById('instr').value
        if (instr == "")
            return
        // Get rover map and mines dict from server
        axios.post(`https://coe892lab42024g82033-server.azurewebsites.net/rovers`, { move_cmds: instr })
            .then(res => {
                const text = document.getElementById("text")
                text.value = "Added Rover: " +JSON.stringify(res.data.created_rover)
            })
            .catch(err => {
                console.log(err);
            })
    }

    function updateRover() {
        var roverID = document.getElementById('roverID').value
        var instr = document.getElementById('instr').value
        if (instr == "" || roverID == "")
            return
        // Get rover map and mines dict from server
        axios.put(`https://coe892lab42024g82033-server.azurewebsites.net/rovers/${roverID}?move_cmd=${instr}`)
            .then(res => {
                const text = document.getElementById("text")
                text.value = "Updated Rover: " + res.data.message
                           })
            .catch(err => {
                console.log(err);
            })
    }

    function dispatchRover() {
        var roverID = document.getElementById('roverID').value
        if (roverID == "")
            return
        // Get rover map and mines dict from server
        axios.post(`https://coe892lab42024g82033-server.azurewebsites.net/rovers/${roverID}/dispatch`)
            .then(res => {
                const text = document.getElementById("text")
                text.value = "Dispatched Rover: " + JSON.stringify(res.data.dispatched_rover)
            })
            .catch(err => {
                console.log(err);
            })
    }

    const goControl = (e) => {
        e.preventDefault();
        let url = "/control"

        history({
            pathname: url,
            state: {}
        });
    }

    return (
        <>
            <div style={{ width: '20%', display: 'flex', margin: '0 auto', justifyContent:'space-around' }}>
                <img src={roverLogo} className="logo" />

                <h1 className='text-rose-500'>Map Editing</h1>
                <button onClick={goControl} style={{ border: '1px solid black', padding: '5px', height:'fit-content' }}>Next</button>


            </div>
            {roverMap && minesArr ? (
                <div style={{ width: '100%', display: 'flex', margin: '0 auto', flexDirection: 'column' }}>
                    <div style={{ width: 'fit-content', display: 'flex', margin: '0 auto'}}>
                        <Canvas map={roverMap} mines={minesArr} rover={rover1.rover}  />
                    </div>
                    <div style={{ width: '100%', display: 'flex', margin: '0 auto', justifyContent: 'space-evenly' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} >
                            <div >
                                <text>Row Size:</text>
                                <input id='row' placeholder="Row Size" style={{ border: '1px solid black', padding: '5px', marginLeft: '5px'}} ></input>
                            </div>
                            <div>
                                <text>Col Size:</text>
                                <input id='col' placeholder="Col Size" style={{ border: '1px solid black', padding: '5px', marginLeft: '11.5px' }} ></input>
                            </div>
                            <button onClick={updateMap} style={{ border: '1px solid black', padding: '5px', margin: '0 auto' }}>Submit</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div>
                                <text>Mine x-Coord: </text>
                                <input id="mineX" placeholder="Mine x-Coord" style={{ border: '1px solid black', padding: '5px' }} ></input>
                            </div>
                            <div>
                                <text>Mine y-Coord: </text>
                                <input id="mineY" placeholder="Mine y-Coord" style={{ border: '1px solid black', padding: '5px' }} ></input>
                            </div>
                            <div>
                                <text>Mine Serial Number: </text>
                                <input id="msn" placeholder="Mine Serial Number" style={{ border: '1px solid black', padding: '5px' }} ></input>
                            </div>
                            <div style={{ display: 'flex', padding: '5px', margin: '0 auto', gap: '10px' }}>
                                <button onClick={createMine} style={{ border: '1px solid black', padding: '5px', margin: '0 auto' }}>Add Mine</button>
                                <button onClick={updateMine} style={{ border: '1px solid black', padding: '5px', margin: '0 auto' }}>Update Mine</button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div>
                                <text>Mine ID: </text>
                                <input id="mineID" placeholder="Mine ID" style={{ border: '1px solid black', padding: '5px' }} ></input>
                            </div>
                            <div style={{ display: 'flex', padding: '5px', margin: '0 auto', gap: '10px' }}>
                                <button onClick={getMine} style={{ border: '1px solid black', padding: '5px', margin: '0 auto' }}>Get Mine</button>
                                <button onClick={delMine} style={{ border: '1px solid black', padding: '5px', margin: '0 auto' }}>Del Mine</button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div>
                                <text>Rover ID: </text>
                                <input id="roverID" placeholder="Rover ID" style={{ border: '1px solid black', padding: '5px' }} ></input>
                            </div>
                            <div style={{ display: 'flex', padding: '5px', margin: '0 auto', gap: '10px' }}>
                                <button onClick={getRover} style={{ border: '1px solid black', padding: '5px' }}>Get Rover</button>
                                <button onClick={delRover} style={{ border: '1px solid black', padding: '5px' }}>Del Rover</button>
                                <button onClick={dispatchRover} style={{ border: '1px solid black', padding: '5px', margin: '0 auto' }}>Dispatch Rover</button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div>
                                <text>Instructions: </text>
                                <input id="instr" placeholder="Instructions" style={{ border: '1px solid black', padding: '5px' }} ></input>
                            </div>
                            <div style={{ display: 'flex', padding: '5px', margin: '0 auto', gap: '10px' }}>
                                <button onClick={createRover} style={{ border: '1px solid black', padding: '5px', margin: '0 auto' }}>Create Rover</button>
                                <button onClick={updateRover} style={{ border: '1px solid black', padding: '5px', margin: '0 auto' }}>Update Rover</button>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '30px' }}>
                        <div style={{ display: 'flex', margin: '0 auto', gap: '20px' }}>
                            <button onClick={getAllMines} style={{ border: '1px solid black', padding: '5px' }}>Get All Mines</button>
                            <button onClick={getAllRovers} style={{ border: '1px solid black', padding: '5px' }}>Get All Rovers</button>
                        </div>
                        <textarea id="text" readOnly style={{ resize: 'none', border: '1px solid black', margin: '0 auto', width: '50%', height: '10vw' }} ></textarea>
                    </div>
                </div>
            ) : (
                <div>Loading data from server...</div>
                )}

        </>
    )
}

export default EditPage
