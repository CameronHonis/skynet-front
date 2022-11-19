class Helpers {
    constructor() {}

    static clamp(unclamped: number, min: number, max: number): number {
        return Math.min(Math.max(unclamped, min), max);
    }
}

export default Helpers;