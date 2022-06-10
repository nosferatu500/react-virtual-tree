import * as React from "react";
import { useContext, useEffect, useMemo, useState } from "react";
import { useTreeEnvironment } from "../controlledEnvironment/ControlledTreeEnvironment";
import { TreeActionsProvider } from "../treeActions/TreeActionsProvider";
import { AllTreeRenderProps, TreeContextProps, TreeItemIndex, TreeProps, TreeRef } from "../types";
import { getItemsLinearly } from "./getItemsLinearly";
import { TreeManager } from "./TreeManager";
import { useCreatedTreeInformation } from "./useCreatedTreeInformation";

const TreeContext = React.createContext<TreeContextProps>(null as any); // TODO default value

export const useTree = () => useContext(TreeContext);

export const Tree = React.forwardRef<TreeRef, TreeProps>((props, ref) => {
    const environment = useTreeEnvironment();
    const renderers = useMemo<AllTreeRenderProps>(() => ({ ...environment, ...props }), [props, environment]);
    const [search, setSearch] = useState<string | null>(null);
    const rootItem = environment.items[props.rootItem];
    const viewState = environment.viewState[props.treeId] ?? {};

    useEffect(() => {
        environment.registerTree({
            treeId: props.treeId,
            rootItem: props.rootItem,
        });

        return () => environment.unregisterTree(props.treeId);
        // TODO should be able to remove soon, and add environment.registerTree, environment.unregisterTree as deps
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.treeId, props.rootItem]);

    const treeInformation = useCreatedTreeInformation(props, search);

    const treeContextProps: TreeContextProps = {
        treeId: props.treeId,
        rootItem: props.rootItem,
        getItemsLinearly: () => getItemsLinearly(props.rootItem, viewState, environment.items),
        treeInformation,
        search,
        setSearch,
        renderers,
    };

    if (rootItem === undefined) {
        environment.onMissingItems?.([props.rootItem]);
        return null;
    }

    return (
        <TreeContext.Provider value={treeContextProps}>
            <TreeActionsProvider ref={ref}>
                <TreeManager />
            </TreeActionsProvider>
        </TreeContext.Provider>
    );
}) as <T = any>(p: TreeProps<T> & { ref?: React.Ref<TreeRef<T>> }) => React.ReactElement;
