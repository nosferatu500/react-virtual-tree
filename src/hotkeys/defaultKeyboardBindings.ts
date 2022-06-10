import { KeyboardBindings } from "../types";

export const defaultKeyboardBindings: Required<KeyboardBindings> = {
    expandSiblings: ["control+*"],
    primaryAction: ["enter"],
    toggleSelectItem: ["control+space"],
    abortSearch: ["escape", "enter"],
    startSearch: [],
};
