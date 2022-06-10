import * as React from "react";
import { useContext, useEffect, useMemo, useState } from "react";
import { useTreeEnvironment } from "../controlledEnvironment/ControlledTreeEnvironment";
import { AllTreeRenderProps, TreeContextProps, TreeProps } from "../types";
import { getItemsLinearly } from "./getItemsLinearly";
import { TreeManager } from "./TreeManager";
import { useCreatedTreeInformation } from "./useCreatedTreeInformation";

const TreeContext = React.createContext<TreeContextProps>(null as any); // TODO default value

export const useTree = () => useContext(TreeContext);

export const Tree = (props: TreeProps) => {
    const environment = useTreeEnvironment();
    const renderers = useMemo<AllTreeRenderProps>(() => ({ ...environment, ...props }), [props, environment]);
    const [search, setSearch] = useState<string | null>(null);
    const rootItem = environment.items[props.rootItem];
    const viewState = React.useMemo(() => {
        return environment.viewState[props.treeId] ?? {};
    }, [environment.viewState, props.treeId]);

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

    const treeContextProps: TreeContextProps = React.useMemo(() => {
        return {
            treeId: props.treeId,
            rootItem: props.rootItem,
            getItemsLinearly: () => getItemsLinearly(props.rootItem, viewState, environment.items),
            treeInformation,
            search,
            setSearch,
            renderers,
        };
    }, [environment.items, props.rootItem, props.treeId, renderers, search, treeInformation, viewState]);

    if (rootItem === undefined) {
        environment.onMissingItems?.([props.rootItem]);
        return null;
    }

    return (
        <TreeContext.Provider value={treeContextProps}>
            <TreeManager />
        </TreeContext.Provider>
    );
};
