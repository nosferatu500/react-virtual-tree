import { useMemo } from "react";
import { useTreeEnvironment } from "../controlledEnvironment/ControlledTreeEnvironment";
import { TreeInformation, TreeItemIndex, TreeProps } from "../types";

export const useCreatedTreeInformation = (
    tree: TreeProps,
    renamingItem: TreeItemIndex | null,
    search: string | null
) => {
    const environment = useTreeEnvironment();
    const selectedItems = environment.viewState[tree.treeId]?.selectedItems;
    return useMemo<TreeInformation>(
        () => ({
            isFocused: environment.activeTreeId === tree.treeId,
            isRenaming: !!renamingItem,
            areItemsSelected: (selectedItems?.length ?? 0) > 0,
            isSearching: search !== null,
            search,
            treeId: tree.treeId,
            rootItem: tree.rootItem,
        }),
        [environment.activeTreeId, tree.treeId, tree.rootItem, renamingItem, selectedItems?.length, search]
    );
};
