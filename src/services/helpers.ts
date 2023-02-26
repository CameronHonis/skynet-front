class Helpers {
    constructor() {}

    static clamp(unclamped: number, min: number, max: number): number {
        return Math.min(Math.max(unclamped, min), max);
    }

    static async sleep(ms: number): Promise<void> {
        return new Promise(resolve => {
           setTimeout(resolve, ms);
        });
    }

    static recursiveCompare(a: any, b: any): boolean {
        if (a === b) return true;
        if (typeof a !== "object" || typeof b !== "object" || !a || !b) return false;
        if (a instanceof Array && b instanceof Array) {
            if (a.length !== b.length) return false;
            for (let i = 0; i < a.length; i++) {
                if (!this.recursiveCompare(a[i], b[i])) return false;
            }
            return true;
        } else if (a.constructor === Object && b.constructor === Object) {
            for (let key of [...Object.keys(a), ...Object.keys(b)]) {
                if (!this.recursiveCompare(a[key], b[key])) return false;
            }
            return true;
        } else {
            return false;
        }
    }
}

export default Helpers;