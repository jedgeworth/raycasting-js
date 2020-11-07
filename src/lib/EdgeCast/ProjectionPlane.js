/**
 * ProjectionPlan.js
 *
 * Represents the screen.
 *
 * @author: James Edgeworth (https://jamesedgeworth.com)
 */
module.exports = class ProjectionPlane{
    constructor(width, height, FOV) {
        this.width = width;
        this.height = height;

        this.centreWidth = this.width / 2;
        this.centreHeight = this.height / 2;

        this.FOV = FOV;
        this.dist = this.centreWidth / parseFloat(Math.tan(this.toRadians(this.FOV / 2)));
        this.rayAngleStep = this.FOV / this.width;
    }

    toRadians(degrees) {
        return parseFloat(degrees / 180.0 * Math.PI) + 0.0001;
    }
}
