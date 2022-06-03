import { useRef, useState } from "react";
import { useHtmlElementEventListener } from "./useHtmlElementEventListener";

export const useFocusWithin = (
    element: HTMLElement | undefined | null,
    onFocusIn?: () => void,
    onFocusOut?: () => void,
    deps: any[] = []
) => {
    useHtmlElementEventListener(
        element,
        "focusin",
        () => {
            onFocusIn?.();
        },
        deps
    );

    useHtmlElementEventListener(
        element,
        "focusout",
        (e: any) => {
            if (!element?.contains(document.activeElement)) {
                onFocusOut?.();
            }
        },
        deps
    );
};
