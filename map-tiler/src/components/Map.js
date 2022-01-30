import React, {useState, useEffect, forwardRef } from 'react';
import axios from 'axios'
import { Buffer } from "buffer"
import { FixedSizeGrid as Grid } from 'react-window';
import './Map.css';
import { TOKEN } from '../constants/Constants';

const MAX_ZOOM_LEVEL = 3;

function Map() {
    
    const [zoomLevel, setZoomLevel] = useState(0);
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);

    const [translateX, setTranslateX] = useState(0);
    const [translateY, setTranslateY] = useState(0);

    const [isPanning, setPanning] = useState(false);
    
    const [tile, setTile] = useState('');
    const [tiles, setTiles] = useState([]);

    // retrieve single tile image from API
    function fetchTile(z, x, y) {
        axios.get(`https://challenge-tiler.services.propelleraero.com/tiles/${z}/${x}/${y}?token=${TOKEN}`,
        {
            responseType: 'arraybuffer' // required to process binary image data
        })
        .then(res => {
            let base64ImageString = Buffer.from(res.data, 'binary').toString('base64') //converts binary image data to base64 string
            setTile(base64ImageString)
        })
        .catch(error => {
            if (error.response) {
                console.log(error.response.status);
              }
        })
    }

    // draw a grid map according to zoom size
    function drawMap(z, x, y) {

        // clear all endpoints from previous render
        let endpoints = []

        // generate all the respective xy tile coordinates for the given z zoom level
        for (var y = 0; y < (2**z); y++) {
            for (var x = 0; x < (2**z); x++) {
                endpoints.push(`https://challenge-tiler.services.propelleraero.com/tiles/${z}/${x}/${y}?token=${TOKEN}`);
            }
        }

        // make multiple API calls to fetch all the tile images corresponding the the generated xy tiles
         Promise.all(
            endpoints.map((endpoint) => 
                axios.get(endpoint, { responseType: 'arraybuffer'}))) // required to process binary image data 
            .then(allResponses => {

                // convert entire array of binary image data into base 64 image data which can be parsed by browser
                let parsedImgStr = [];
                allResponses.forEach((response) => {
                    parsedImgStr.push(Buffer.from(response.data, 'binary').toString('base64'));
                });

                // before saving the parsed 64 image data as a state array
                setTiles(parsedImgStr)
            })
            .catch(error => {
                if (error.response) {
                    console.log(error.response.status);
                  }
            });
    }

    // initialises map to Zoom Level 0
    useEffect(() => {
        fetchTile(zoomLevel, x, y)
    }, []);
    
    function zoomIn() {
        if (zoomLevel < MAX_ZOOM_LEVEL) {
            setZoomLevel(zoomLevel + 1)
            setX(x*2)
            setY(y*2)
    
            drawMap(zoomLevel + 1, x*2, y*2)
        }
    };

    function zoomOut() {
        if (zoomLevel > 0) {
            if (zoomLevel == 1) {
                fetchTile(0, 0, 0)
            } else {
                // BUG: renders the zoom out too quickly, looks like it jumps straight to z=0 instead of decrementally
                // TODO: increase scroll amount before rendering 
                drawMap(zoomLevel - 1, x/2, y/2) 
            }
            setZoomLevel(zoomLevel - 1)
            setX(x/2)
            setY(y/2)
        }
    };

    // Scroll handling function: zooms in when scrolling upwards; zooms out when scrolling downwards
    // BUG: works on at the zoom level 0, but becomes buggy when used at higher zoom level when the Grid component is rendered
    //      due Grid's implementation of their own scrollbar
    function handleOnWheel(event){
        const isZoomingIn = event.deltaY > -1;
        if (isZoomingIn && zoomLevel !== MAX_ZOOM_LEVEL) {
            zoomIn()
        }
        if (!isZoomingIn && zoomLevel !== 0) {
            zoomOut()
        }
      }

    // BUG: translation transformation does not work for Panning
    function onPan(event) {
        if (isPanning) {
            console.log((event.movementX), (event.movementY))
            setTranslateX(event.movementX)
            setTranslateY(event.movementY)

            drawMap(zoomLevel, x, y)
        };
    }

    function setPanningOn(event) {
        setPanning(true);
    }

    function setPanningOff(event) {
        setPanning(false);
    }


    const outerElementType = forwardRef((props, ref) => (
        <div ref={ref} 
            // onWheel={handleOnWheel} 
            onMouseDown={setPanningOn}
            onMouseUp={setPanningOff}
            onMouseMove={onPan}
            onMouseLeave={setPanningOff}
            {...props} />
        ));
    
    // Tile subcomponent rendered in Grid
    const Tile = ({ columnIndex, rowIndex, style }) => (
        <div style={style}>
            <img src={`data:image/jpeg;base64,${tiles[columnIndex + ((2**zoomLevel)*rowIndex)]}`} draggable={false}/>
        </div>
      );

  return (
  <div className="container"
  >
    <div className="d-flex justify-content-center bg-secondary p-5">
        {(zoomLevel === 0)
            ? 
            <div className="map" onWheel={handleOnWheel} >
                <img src={`data:image/jpeg;base64,${tile}`} draggable={false}/>
            </div>
            : 
            <Grid
                // BUG: translation transformation does not work for Panning
                style={{
                    transform: `translate(${translateX}px, ${translateY}px))`,
                }}
                columnCount={2**zoomLevel}
                columnWidth={500}
                height={500}
                rowCount={2**zoomLevel}
                rowHeight={500}
                width={500}
                outerElementType={outerElementType}
            >
                {Tile}
            </Grid>
        }
        <div className="d-flex flex-column justify-content-end pl-5">
            <button type="button" className="btn btn-light btn-lg mb-1" onClick={zoomIn}>+</button>
            <button type="button" className="btn btn-light btn-lg" onClick={zoomOut}>-</button>
        </div>
    </div>
  </div>
  
)}

export default Map;
