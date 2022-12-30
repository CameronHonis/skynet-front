export type LocalPath = string | (string | number)[];

class LocalStorageService {
    static readFromStorage(path: LocalPath): any {
        if (typeof path[0] === "number") throw new Error("local path cannot start with index");
        if (typeof path === "string") {
            return JSON.parse(localStorage.getItem(path) as string);
        } else {
            let storedData = JSON.parse(localStorage.getItem(path[0]) as string);
            for (let i = 1; i < path.length; i++) {
                const pathSeg = path[i];
                if (storedData == null) return null;
                storedData = storedData[pathSeg];
            }
            return storedData;
        }
    }

    static writeToStorage(path: LocalPath, data: any): void {
        if (typeof path[0] === "number") throw new Error("local path cannot start with index");
        if (typeof path === "string") {
            localStorage.setItem(path, JSON.stringify(data));
        } else {
            let storedData = JSON.parse(localStorage.getItem(path[0]) as string);
            storedData = storedData || {};
            let storedDataSeg = storedData;
            for (let i = 1; i < path.length - 1; i++) {
                const pathSeg = path[i];
                if (storedDataSeg[pathSeg] == null) {
                    if (typeof path[i+1] === "number") {
                        storedDataSeg[pathSeg] = [];
                    } else {
                        storedDataSeg[pathSeg] = {};
                    }
                }
                storedDataSeg = storedDataSeg[pathSeg];
            }
            const lastPathSeg = path[path.length - 1];
            storedDataSeg[lastPathSeg] = data;
            localStorage.setItem(path[0], JSON.stringify(storedData));
        }
    }

    static readOrInitializeFromStorage<T>(path: LocalPath, defaultData: T): T {
        const storedData = this.readFromStorage(path);
        if (storedData == null) {
            this.writeToStorage(path, defaultData);
            return defaultData;
        }
        return storedData;
    }
}

export default LocalStorageService;