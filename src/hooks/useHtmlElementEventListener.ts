import { useEffect } from "react";

export const useHtmlElementEventListener = <K extends keyof HTMLElementEventMap>(
    element: HTMLElement | undefined | null,
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
    deps: any[] = []
) => {
    useEffect(() => {
        if (element) {
            element.addEventListener(type, listener as any);
        }

        const clearEventListener = () => {
            if (element) {
                element.removeEventListener(type, listener as any);
            }
        };

        return () => {
            clearEventListener();
        };
    }, [element, listener, type, ...deps]);
};
