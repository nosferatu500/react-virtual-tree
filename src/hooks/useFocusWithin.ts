import { useRef, useState } from "react";
import { useHtmlElementEventListener } from "./useHtmlElementEventListener";

export const useFocusWithin = (
    element: HTMLElement | undefined | null,
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
            if (!focusWithin) {
                setFocusWithin(true);
                onFocusIn?.();
            }
            if (isLoosingFocusFlag.current) {
                isLoosingFocusFlag.current = false;
            }
        },
        [focusWithin, onFocusIn, ...deps]
    );

    useHtmlElementEventListener(
        element,
        "focusout",
        (e) => {
            isLoosingFocusFlag.current = true;
            requestAnimationFrame(() => {
                if (isLoosingFocusFlag.current && !element?.contains(document.activeElement)) {
                    onFocusOut?.();
                    isLoosingFocusFlag.current = false;
                    setFocusWithin(false);
                }
            });
        },
        [element, onFocusOut, ...deps]
    );

    return focusWithin;
};
