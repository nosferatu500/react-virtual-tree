import { useMemo } from "react";
import { Tree, TreeItemIndex, TreeMeta, VirtualTreeContextProps } from "../types";
import { useVirtualTreeContext } from "../VirtualTreeContext";

const createTreeMeta = (
    context: VirtualTreeContextProps,
    treeConf: Tree,
    search: string | null,
    renamingItem?: TreeItemIndex | undefined
): TreeMeta => ({
    isFocused: context.activeTreeId === treeConf.treeId,
    isRenaming: !!renamingItem,
    areItemsSelected: (context.viewState[treeConf.treeId]?.selectedItems?.length ?? 0) > 0,
    isSearching: search !== null,
    search,
    ...treeConf,
});

const createTreeMetaDeps = (
    context: VirtualTreeContextProps,
    treeId: string,
    search: string | null,
    renamingItem?: TreeItemIndex | undefined
) => [context.activeTreeId, context.viewState[treeId]?.selectedItems, renamingItem, treeId, search];

export const useTreeMeta = (treeConf: Tree, search: string | null) => {
    const context = useVirtualTreeContext();
    return useMemo(
        () => createTreeMeta(context, treeConf, search),
        createTreeMetaDeps(context, treeConf.treeId, search)
    );
};
