/**
 * MapRect.js
 *
 * Represents a rectangle on the game map.
 *
 * @author: James Edgeworth (https://jamesedgeworth.com)
 */
module.exports = class MapRect{
    constructor(x, y, w, h, flag) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;

        this.flag = flag;
    }
}
