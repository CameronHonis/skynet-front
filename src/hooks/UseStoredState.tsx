const readFromStorage = (localStoragePath: string | string[]): string | null => {
    if (typeof localStoragePath === "string") {
        return localStorage.getItem(localStoragePath);
    } else {
        let storedData = JSON.parse(localStorage.getItem(localStoragePath[0]) as string);
        for (let pathSeg of localStoragePath) {
            if (storedData == null) return null;
            storedData = storedData[pathSeg];    
        }
        return storedData;
    }
}

const writeToStorage = (localStoragePath: string | string[]): void => {

}

const readOrInitializeFromStorage = (localStoragePath: string | string[]): string | null => {
    const storedData = readFromStorage(localStoragePath);
    if (localStoragePath == null) {
        writeToStorage
    }
}

const useStoredState = (localStoragePath: string | string[]) => {

}