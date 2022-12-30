export type LocalPath = string | (string | number)[];

class LocalStorageService {
    static readFromStorage(path: string | string[]): any {
        if (typeof path === "string") {
            return JSON.parse(localStorage.getItem(path) as string);
        } else {
            let storedData = JSON.parse(localStorage.getItem(path[0]) as string);
            for (let pathSeg of path) {
                if (storedData == null) return null;
                storedData = storedData[pathSeg];    
            }
            return storedData;
        }
    }

    static writeToStorage(path: LocalPath, data: any): void {
        if (typeof path === "string") {
            localStorage.setItem(path, JSON.stringify(data));
        } else {
            if (typeof path[0] === "number") throw new Error("local path cannot start with index");
            let storedData = JSON.parse(localStorage.getItem(path[0]) as string);
            storedData = storedData || {};
            let storedDataSeg = storedData;
            for (let i = 1; i < path.length - 1; i++) {
                const pathSeg = path[i];
                if (typeof pathSeg === "number") {

                } else {

                }
                storedDataSeg[pathSeg] = { ...}
            }
            if (storedData == null) {

            } else {

                storedData[]
            }
        }
    }

    static readOrInitializeFromStorage(path: string | string[]): any {
        const storedData = this.readFromStorage(path);
        if (storedData == null) {
            this.writeToStorage(path, null);
        }
    }
}

export default LocalStorageService;