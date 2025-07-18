// src/hooks/useOrientation.js
import { useState, useEffect } from "react";

function useOrientation() {
    const getOrientation = () =>
        window.innerWidth > window.innerHeight ? "landscape" : "portrait";

    const [orientation, setOrientation] = useState(getOrientation());

    useEffect(() => {
        const handleResize = () => {
            setOrientation(getOrientation());
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return orientation;
}

export default useOrientation;
