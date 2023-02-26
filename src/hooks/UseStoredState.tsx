import React from "react";
import LocalStorageService, {LocalPath} from "../services/local_storage_service";
import useDidUpdateEffect from "./UseDidUpdateEffect";

function useStoredState <T>(storagePath: LocalPath, defaultData: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const initData = React.useMemo(() => {
        return LocalStorageService.readOrInitializeFromStorage<T>(storagePath, defaultData);
    }, [defaultData, storagePath]);

    const [ data, setData ] = React.useState<T>(initData);

    useDidUpdateEffect(() => {
        LocalStorageService.writeToStorage(storagePath, data);
    }, [data]);

    React.useEffect(() => {
        console.log(`initialize watcher for ${storagePath}`);
        LocalStorageService.watchState(storagePath, initData, setData);
    }, []);

    return [ data, setData ];
}

export default useStoredState;