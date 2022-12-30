import React from "react";

const useDidUpdateEffect = (fn: Function, deps: any) => {
    const didMountRef = React.useRef(false);

    React.useEffect(() => {
        if (didMountRef.current) {
            fn();
        }
        didMountRef.current = true;
    }, deps);
}

export default useDidUpdateEffect;