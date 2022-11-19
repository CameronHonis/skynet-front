import Vec2 from "./vec2";

class Box2 {
    minPoint: Vec2;
    maxPoint: Vec2;

    constructor(minPoint: Vec2 = new Vec2(), maxPoint: Vec2 = new Vec2()) {
        this.minPoint = minPoint;
        this.maxPoint = maxPoint;
    }

    getWidth(): number {
        return this.maxPoint.x - this.minPoint.x;
    }

    getHeight(): number {
        return this.maxPoint.y - this.minPoint.y;
    }
}

export default Box2;