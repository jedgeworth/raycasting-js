/**
 * IVector2.js
 *
 * Represents a 2D vector (integer).
 *
 * @author: James Edgeworth (https://jamesedgeworth.com)
 */
module.exports = class IVector2{
    constructor(x, y) {
        this.x = parseInt(x);
        this.y = parseInt(y);
    }

    setX(x) {
        this.x = parseInt(x);
    }

    setY(y) {
        this.y = parseInt(y);
    }
}
