import React, { useContext, useEffect, useMemo, useState } from "react";
import { TreeManager } from "./TreeManager";
import { TreeContextProps, TreeProps, TreeRenderProps } from "./types";
import { createTreeMeta, createTreeMetaDeps } from "./utils";
import { useVirtualTreeContext } from "./VirtualTreeContext";

const TreeContext = React.createContext<TreeContextProps>(null as any);

export const useTreeContext = () => useContext(TreeContext);

export const VirtualTree = (props: TreeProps) => {
    const context = useVirtualTreeContext();
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

    const meta = useMemo(
        () => createTreeMeta(context, props.treeId, search),
        createTreeMetaDeps(context, props.treeId, search),
    );

    if (rootItem === undefined) {
        context.onMissingItems?.([props.rootItem]);
        return null;
    }

    return (
        <TreeContext.Provider value={{
            treeId: props.treeId,
            rootItem: props.rootItem,
            meta,
            search,
            setSearch,
            renderer,
          }}>
            <TreeManager />
          </TreeContext.Provider>
    );
};
