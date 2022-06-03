import React, { HTMLProps } from "react";
import { TreeItem } from "./TreeItem";
import { TreeItemIndex } from "./types";
import { useTreeContext } from "./VirtualTree";

export const TreeItemChildren = (props: { children: TreeItemIndex[]; depth: number }): JSX.Element => {
    const { renderer, treeMeta } = useTreeContext();

    const childElements: JSX.Element[] = [];

    for (const child of props.children) {
        childElements.push(<TreeItem key={child} itemIndex={child} depth={props.depth} />);
    }

    if (childElements.length === 0) {
        return null as any;
    }

    const containerProps: HTMLProps<any> = {
        role: "group",
    };

    return renderer.renderItemsContainer({
        children: childElements,
        treeMeta,
        containerProps,
    }) as any;
};
