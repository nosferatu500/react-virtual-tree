import React, { useContext, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { useTreeMeta } from "./hooks/useTreeMeta";
import { TreeManager } from "./TreeManager";
import { TreeContextProps, TreeItemIndex, TreeProps, TreeRenderProps } from "./types";
import { getItemsLinearly } from "./utils";
import { useVirtualTreeContext } from "./VirtualTreeContext";

const TreeContext = React.createContext<TreeContextProps>(null as any);

export const useTreeContext = () => useContext(TreeContext);

export const VirtualTree = React.forwardRef<TreeContextProps, TreeProps>((props, ref) => {
    const context = useVirtualTreeContext();
    const renderer = useMemo<Required<TreeRenderProps>>(() => ({ ...context, ...props }), [props, context]);
    const rootItem = context.items[props.rootItem];
    const viewState = context.viewState[props.treeId] ?? {};
    const [search, setSearch] = useState<string | null>(null);
    const [renamingItem, setRenamingItem] = useState<TreeItemIndex | null>(null);

    useEffect(() => {
        context.addTree({
            treeId: props.treeId,
            rootItem: props.rootItem,
        });

        return () => context.removeTree(props.treeId);
    }, [props.treeId, props.rootItem]);

    const treeMeta = useTreeMeta(
        {
            treeId: props.treeId,
            rootItem: props.rootItem,
        },
        search
    );

    const treeContextProps: TreeContextProps = {
        treeId: props.treeId,
        rootItem: props.rootItem,
        getItemsLinearly: () => getItemsLinearly(props.rootItem, viewState, context.items),
        treeMeta,
        search,
        setSearch,
        renamingItem,
        setRenamingItem,
        renderer,
    };

    useImperativeHandle(ref, () => treeContextProps);

    if (rootItem === undefined) {
        context.onMissingItems?.([props.rootItem]);
        return null;
    }

    return (
        <TreeContext.Provider value={treeContextProps}>
            <TreeManager />
        </TreeContext.Provider>
    );
});
