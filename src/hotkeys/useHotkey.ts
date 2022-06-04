import { useMemo, useRef } from "react";
import { KeyboardBindings } from "../types";
import { useCallSoon } from "../useCallSoon";
import { useHtmlElementEventListener } from "../useHtmlElementEventListener";
import { useKeyboardBindings } from "./useKeyboardBindings";

const elementsThatCanTakeText = new Set(["input", "textarea"]);

export const useHotkey = (
    combinationName: keyof KeyboardBindings,
    onHit: (e: KeyboardEvent) => void,
    active?: boolean,
    activatableWhileFocusingInput = false,
    deps?: any[]
) => {
    const pressedKeys = useRef<string[]>([]);
    const keyboardBindings = useKeyboardBindings();
    const callSoon = useCallSoon();

    const possibleCombinations = useMemo(
        () => keyboardBindings[combinationName].map((combination) => combination.split("+")),
        [combinationName, keyboardBindings]
    );

    useHtmlElementEventListener(
        document,
        "keydown",
        (e) => {
            if (active === false) {
                return;
            }

            if (
                (elementsThatCanTakeText.has((e.target as HTMLElement).tagName.toLowerCase()) ||
                    (e.target as HTMLElement).isContentEditable) &&
                !activatableWhileFocusingInput
            ) {
                // Skip if an input is selected
                return;
            }

            if (!pressedKeys.current.includes(e.key)) {
                pressedKeys.current.push(e.key);
                const pressedKeysLowercase = pressedKeys.current.map((key) => key.toLowerCase());

                const partialMatch = possibleCombinations
                    .map((combination) =>
                        pressedKeysLowercase
                            .map((key) => combination.includes(key.toLowerCase()))
                            .reduce((a, b) => a && b, true)
                    )
                    .reduce((a, b) => a || b, false);

                if (partialMatch && (pressedKeys.current.length > 1 || !/^[A-Za-z]$/.test(e.key))) {
                    // Prevent default, but not if this is the first input and a letter (which should trigger a search)
                    e.preventDefault();
                }
            }
        },
        [active]
    );

    useHtmlElementEventListener(
        document,
        "keyup",
        (e) => {
            if (active === false) {
                return;
            }

            const pressedKeysLowercase = new Set(pressedKeys.current.map((key) => key.toLowerCase()));
            const match = possibleCombinations
                .map((combination) =>
                    combination.map((key) => pressedKeysLowercase.has(key.toLowerCase())).reduce((a, b) => a && b, true)
                )
                .reduce((a, b) => a || b, false);

            if (match) {
                callSoon(() => onHit(e));
            }

            pressedKeys.current = pressedKeys.current.filter((key) => key !== e.key);
        },
        [possibleCombinations, onHit, active, callSoon, ...(deps ?? [])]
    );
};
