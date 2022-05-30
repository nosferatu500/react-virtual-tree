import { useRef, useState } from "react";
import { useHtmlElementEventListener } from "./useHtmlElementEventListener";

export const useFocusWithin = (
    element: HTMLElement | undefined,
    onFocusIn?: () => void,
    onFocusOut?: () => void,
    deps: any[] = []
) => {
    const [focusWithin, setFocusWithin] = useState(false);
    const isLoosingFocusFlag = useRef(false);

    useHtmlElementEventListener(
        element,
        "focusin",
        () => {
            setFocusWithin(true);
            onFocusIn?.();
            if (isLoosingFocusFlag.current) {
                isLoosingFocusFlag.current = false;
            }
        },
        deps
    );

    useHtmlElementEventListener(
        element,
        "focusout",
        (e: any) => {
            isLoosingFocusFlag.current = true;
            setTimeout(() => {
                if (isLoosingFocusFlag.current) {
                    onFocusOut?.();
                    isLoosingFocusFlag.current = false;
                    setFocusWithin(false);
                }
            });
        },
        deps
    );

    console.log({ focusWithin });

    return focusWithin;
};
