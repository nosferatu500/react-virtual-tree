import { useCallback } from "react";
import { useTreeEnvironment } from "../controlledEnvironment/ControlledTreeEnvironment";
import { useLinearItems } from "../controlledEnvironment/useLinearItems";
import { TreeItem } from "../types";
import { useTree } from "./Tree";
import { useViewState } from "./useViewState";

export const useSelectUpTo = () => {
    const viewState = useViewState();
    const { treeId } = useTree();
    const linearItems = useLinearItems(treeId);
    const { onSelectItems } = useTreeEnvironment();

    return useCallback(
        (item: TreeItem) => {
            // TODO doesnt work that well if there are spaces between selections
            if (viewState && viewState.selectedItems && viewState.selectedItems.length > 0) {
                const selectionStart = linearItems.findIndex((linearItem) =>
                    viewState.selectedItems?.includes(linearItem.item)
                );
                const selectionEnd = linearItems.findIndex((linearItem) => linearItem.item === item.index);

                if (selectionStart < selectionEnd) {
                    const selection = linearItems.slice(selectionStart, selectionEnd + 1).map(({ item }) => item);
                    onSelectItems?.([...(viewState?.selectedItems ?? []), ...selection], treeId);
                } else {
                    const selection = linearItems.slice(selectionEnd, selectionStart).map(({ item }) => item);
                    onSelectItems?.([...(viewState?.selectedItems ?? []), ...selection], treeId);
                }
            } else {
                onSelectItems?.([item.index], treeId);
            }
        },
        [onSelectItems, linearItems, treeId, viewState]
    );
};
