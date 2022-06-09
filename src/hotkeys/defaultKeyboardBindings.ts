import { KeyboardBindings } from "../types";

export const defaultKeyboardBindings: Required<KeyboardBindings> = {
    expandSiblings: ["control+*"],
    primaryAction: ["enter"],
    renameItem: ["f2"],
    abortRenameItem: ["escape"],
    toggleSelectItem: ["control+space"],
    abortSearch: ["escape", "enter"],
    startSearch: [],
};
