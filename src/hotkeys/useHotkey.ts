import { useContext, useMemo, useRef } from "react";
import { useHtmlElementEventListener } from "../hooks/useHtmlElementEventListener";
import { KeyboardBindings } from "../types";
import { VirtualTreeContext } from "../VirtualTreeContext";
import { defaultKeyboardBindings } from "./defaultKeyboardBindings";

export const useHotkey = (
    combinationName: keyof KeyboardBindings,
    onHit: (e: KeyboardEvent) => void,
    active?: boolean,
    deps?: any[]
) => {
    const context = useContext(VirtualTreeContext);
    const pressedKeys = useRef<string[]>([]);
    const possibleCombinations = useMemo(
        () => context.keyboardBindings?.[combinationName] ?? defaultKeyboardBindings[combinationName],
        [combinationName, context.keyboardBindings]
    );

    useHtmlElementEventListener(
        document,
        "keydown",
        (e) => {
            if (!active) {
                return;
            }
            if (!pressedKeys.current.includes(e.key)) {
                pressedKeys.current.push(e.key);
            }
        },
        [active]
    );

    useHtmlElementEventListener(
        document,
        "keyup",
        (e) => {
            if (!active) {
                return;
            }

            const pressedKeysLowercase = new Set(pressedKeys.current.map((key) => key.toLowerCase()));
            const match = possibleCombinations
                .map((combination) =>
                    combination
                        .split("+")
                        .map((key) => pressedKeysLowercase.has(key.toLowerCase()))
                        .reduce((a, b) => a && b, true)
                )
                .reduce((a, b) => a || b, false);

            if (match) {
                onHit(e);
            }

            pressedKeys.current = pressedKeys.current.filter((key) => key !== e.key);
        },
        [possibleCombinations, onHit, active, ...(deps ?? [])]
    );
};
