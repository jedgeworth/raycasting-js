/**
 * GameMap.js
 *
 * Represents the game map data.
 *
 * @author: James Edgeworth (https://jamesedgeworth.com)
 */

const MapRect = require('./MapRect');
const IVector2 = require('./IVector2');

module.exports = class GameMap{
    constructor(mapData, mapPixelSize) {
        this.mapData = mapData;
        this.mapPixelSize = mapPixelSize;

        this.yCellsCount = mapData.length;
        this.xCellsCount = mapData[0].length;

        this.mapResolution = this.mapPixelSize / this.xCellsCount;

        this.mapRects = [];

        this.initMap();

        console.log(this);
    }

    initMap() {
        for (let x = 0; x < this.xCellsCount; x += 1) {
            for (let y = 0; y < this.yCellsCount; y += 1) {
                this.mapRects.push(
                    new MapRect(
                        x * this.mapResolution,
                        y * this.mapResolution,
                        this.mapResolution,
                        this.mapResolution,
                        this.mapData[y][x]
                    )
                );
            }
        }
    }

    worldCoordToMapCoord(vector2WorldCoord) {
        return new IVector2(
            vector2WorldCoord.x / this.mapResolution,
            vector2WorldCoord.y / this.mapResolution
        );
    }

    testHit(vector2) {

        const mapVector2 = this.worldCoordToMapCoord(vector2);

        if ( mapVector2.x >= this.xCellsCount )
        {
            mapVector2.x = this.xCellsCount - 1;
        }

        if ( mapVector2.y >= this.yCellsCount )
        {
            mapVector2.y = this.yCellsCount - 1;
        }

        if ( mapVector2.x < 0 )
        {
            mapVector2.x = 0;
        }

        if ( mapVector2.y < 0 )
        {
            mapVector2.y = 0;
        }

        return ( this.mapData[mapVector2.y][mapVector2.x] == 1 );
    }

}
