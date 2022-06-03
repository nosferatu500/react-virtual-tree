import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { TreeManager } from "./TreeManager";
import { Tree, TreeProps, TreeRenderProps } from "./types";
import { VirtualTreeContext } from "./VirtualTreeContext";

export const TreeRenderContext = React.createContext<Required<TreeRenderProps>>(null as any);
export const TreeContext = React.createContext<Tree>({
    treeId: "__no_tree",
    rootItem: "__no_tree",
});

export const TreeSearchContext = React.createContext<{
    search: string | null;
    setSearch: (searchValue: string | null) => void;
}>({
    search: null,
    setSearch: () => {},
});

export const VirtualTree = (props: TreeProps) => {
    const context = useContext(VirtualTreeContext);
    const renderer = useMemo<Required<TreeRenderProps>>(() => ({ ...context, ...props }), [props, context]);
    const rootItem = context.items[props.rootItem];
    const [search, setSearch] = useState<string | null>(null);

    useEffect(() => {
        context.addTree({
            treeId: props.treeId,
            rootItem: props.rootItem,
        });

        return () => context.removeTree(props.treeId);
    }, [props.treeId, props.rootItem]);

    if (rootItem === undefined) {
        context.onMissingItems?.([props.rootItem]);
        return null;
    }

    return (
        <TreeRenderContext.Provider value={renderer}>
            <TreeContext.Provider value={{ treeId: props.treeId, rootItem: props.rootItem }}>
                <TreeSearchContext.Provider value={{ search, setSearch }}>
                    <TreeManager />
                </TreeSearchContext.Provider>
            </TreeContext.Provider>
        </TreeRenderContext.Provider>
    );
};
