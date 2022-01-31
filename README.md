# Map Tiler

## How to Run Project

Run `npm install` followed by `npm run` to build and run the project. <br>

### API keys
Please insert your own API tokens in the `Constants.js` file located in the `constants` folder.

## Completed Requirements
* Zooming using +/- buttons
* Scrolling when the content doesn't fit in the browser viewport.

## Quirks
The zooming always occurs on the top left corner and does not occur relative to the tile that is visible in the viewport.

## Attempted Extras
* Allow panning of the tiles rather than scrolling
* If panning implemented switch to using scroll to zoom

I didn't manage to get the translation for panning to function as intended, but the scroll to zoom works partially. However, since the scroll doubles its functionality to move around the viewport and zoom as as such, the resulting map is quite buggy. Hence, I have commented out the scroll to zoom function on `line 141`

## Testing
I did not have enough time to learn Jest and write any tests for the Map component.
