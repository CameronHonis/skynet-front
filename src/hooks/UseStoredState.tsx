import React from "react";
import LocalStorageService, {LocalPath} from "../services/local_storage_service";
import useDidUpdateEffect from "./UseDidUpdateEffect";

function useStoredState <T>(storagePath: LocalPath, defaultData: T): [T, (newData: T) => void] {
    const initData = React.useMemo(() => {
        return LocalStorageService.readOrInitializeFromStorage<T>(storagePath, defaultData);
    }, []);

    const [ data, setData ] = React.useState<T>(initData);

    useDidUpdateEffect(() => {
        LocalStorageService.writeToStorage(storagePath, data);
    }, [data]);

    return [ data, setData ];
}

export default useStoredState;