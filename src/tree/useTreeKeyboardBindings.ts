import { useCallback } from "react";
import { useTreeEnvironment } from "../controlledEnvironment/ControlledTreeEnvironment";
import { useHotkey } from "../hotkeys/useHotkey";
import { useTree } from "./Tree";
import { useViewState } from "./useViewState";

export const useTreeKeyboardBindings = () => {
    const environment = useTreeEnvironment();
    const { treeId, setSearch } = useTree();
    const viewState = useViewState();

    const isActiveTree = environment.activeTreeId === treeId;

    useHotkey(
        "primaryAction",
        useCallback(
            (e) => {
                e.preventDefault();
                if (viewState.focusedItem !== undefined) {
                    environment.onSelectItems?.([viewState.focusedItem], treeId);
                    environment.onPrimaryAction?.(environment.items[viewState.focusedItem], treeId);
                }
            },
            [environment, treeId, viewState.focusedItem]
        ),
        isActiveTree
    );

    useHotkey(
        "toggleSelectItem",
        useCallback(
            (e) => {
                e.preventDefault();
                if (viewState.focusedItem !== undefined) {
                    if (viewState.selectedItems && viewState.selectedItems.includes(viewState.focusedItem)) {
                        environment.onSelectItems?.(
                            viewState.selectedItems.filter((item) => item !== viewState.focusedItem),
                            treeId
                        );
                    } else {
                        environment.onSelectItems?.(
                            [...(viewState.selectedItems ?? []), viewState.focusedItem],
                            treeId
                        );
                    }
                }
            },
            [environment, treeId, viewState.focusedItem, viewState.selectedItems]
        ),
        isActiveTree
    );

    useHotkey(
        "startSearch",
        useCallback(
            (e) => {
                e.preventDefault();
                setSearch("");
                (document.querySelector('[data-rct-search-input="true"]') as any)?.focus?.();
            },
            [setSearch]
        ),
        isActiveTree
    );
};
