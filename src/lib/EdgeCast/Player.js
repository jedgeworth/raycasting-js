/**
 * Player.js
 *
 * Represents an in-game player.
 *
 * @author: James Edgeworth (https://jamesedgeworth.com)
 */

const Vector2 = require('./Vector2');
module.exports = class Player{
    constructor() {
        this.x = 0.0;
        this.y = 0.0;
        this.rotation = 0;
        this.height = 20;

        this.newPosition = new Vector2();
    }

    acceptMove() {
        this.x = this.newPosition.x;
        this.y = this.newPosition.y;
    }

    cancelMove() {
        this.newPosition.x = this.x;
        this.newPosition.y = this.y;
    }
}
