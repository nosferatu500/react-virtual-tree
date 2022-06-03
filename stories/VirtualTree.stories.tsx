import React, { useRef, useState } from "react";
import { Meta } from "@storybook/react";
import { DataProvider, TreeItem, VirtualForestWrapper, VirtualTree } from "../src";
import { demoContent } from "./demoData";

export default {
    title: "Tree",
} as Meta;

export const SingleTree = () => {
    const ref = useRef(demoContent.data.items);
    const [data, setData] = useState<any>(ref.current);

    return (
        <VirtualForestWrapper
            allowDragAndDrop
            allowDropOnItemWithChildren
            allowReorderingItems
            allowCollapse
            containerSize={{ width: 300, height: 300 }}
            autoScrollDetectionZone={{ vertical: 50, horizontal: 50 }}
            dataProvider={new DataProvider(data, (item, data) => ({ ...item, data }))}
            getItemTitle={(item) => item.title}
            onChange={setData}
            onReorder={(outData) => {
                console.log({ outData });
            }}
            onClick={(item: TreeItem) => console.log(item)}
            viewState={{
                "tree-1": {
                    expandedItems: ["child1", "child11", "child2"],
                },
            }}
        >
            <VirtualTree treeId="tree-1" rootItem="root" />
        </VirtualForestWrapper>
    );
};

export const SingleTreeAllCollapsed = () => {
    const ref = useRef(demoContent.data.items);
    const [data, setData] = useState<any>(ref.current);

    return (
        <VirtualForestWrapper
            allowDragAndDrop
            allowDropOnItemWithChildren
            allowReorderingItems
            containerSize={{ width: 300, height: 300 }}
            autoScrollDetectionZone={{ vertical: 50, horizontal: 50 }}
            dataProvider={new DataProvider(data, (item, data) => ({ ...item, data }))}
            getItemTitle={(item) => item.title}
            onChange={setData}
            onReorder={(outData) => {
                console.log({ outData });
            }}
            onClick={(item: TreeItem) => console.log(item)}
            viewState={{
                "tree-1": {},
            }}
        >
            <VirtualTree treeId="tree-1" rootItem="root" />
        </VirtualForestWrapper>
    );
};

export const MultipleTrees = () => {
    const ref = useRef(demoContent.data.items);
    const [data, setData] = useState<any>(ref.current);

    return (
        <VirtualForestWrapper
            allowDragAndDrop
            allowDropOnItemWithChildren
            allowReorderingItems
            containerSize={{ width: 500, height: 300 }}
            autoScrollDetectionZone={{ vertical: 50, horizontal: 50 }}
            dataProvider={new DataProvider(data, (item, data) => ({ ...item, data }))}
            getItemTitle={(item) => item.title}
            onChange={setData}
            onReorder={(outData) => {
                console.log({ outData });
            }}
            onClick={(item: TreeItem) => console.log(item)}
            viewState={{
                "tree-1": {},
            }}
        >
            <div
                style={{
                    display: "flex",
                    backgroundColor: "#eee",
                    justifyContent: "space-evenly",
                    alignItems: "baseline",
                    padding: "20px 0",
                }}
            >
                <div
                    style={{
                        width: "28%",
                        backgroundColor: "white",
                    }}
                >
                    <VirtualTree treeId="tree-1" rootItem="root" />
                </div>
                <div
                    style={{
                        width: "28%",
                        backgroundColor: "white",
                    }}
                >
                    <VirtualTree treeId="tree-2" rootItem="root" />
                </div>
                <div
                    style={{
                        width: "28%",
                        backgroundColor: "white",
                    }}
                >
                    <VirtualTree treeId="tree-3" rootItem="root" />
                </div>
            </div>
        </VirtualForestWrapper>
    );
};

export const NoDragAndDrop = () => {
    const ref = useRef(demoContent.data.items);
    const [data, setData] = useState<any>(ref.current);

    return (
        <VirtualForestWrapper
            allowCollapse
            containerSize={{ width: 300, height: 300 }}
            autoScrollDetectionZone={{ vertical: 50, horizontal: 50 }}
            dataProvider={new DataProvider(data, (item, data) => ({ ...item, data }))}
            getItemTitle={(item) => item.title}
            onChange={setData}
            onReorder={(outData) => {
                console.log({ outData });
            }}
            onClick={(item: TreeItem) => console.log(item)}
            viewState={{
                "tree-1": {
                    expandedItems: ["child1", "child11", "child2"],
                },
            }}
        >
            <VirtualTree treeId="tree-1" rootItem="root" />
        </VirtualForestWrapper>
    );
};

export const NoReorderingAllowed = () => {
    const ref = useRef(demoContent.data.items);
    const [data, setData] = useState<any>(ref.current);

    return (
        <VirtualForestWrapper
            allowDragAndDrop
            allowDropOnItemWithChildren
            allowCollapse
            containerSize={{ width: 300, height: 300 }}
            autoScrollDetectionZone={{ vertical: 50, horizontal: 50 }}
            dataProvider={new DataProvider(data, (item, data) => ({ ...item, data }))}
            getItemTitle={(item) => item.title}
            onChange={setData}
            onReorder={(outData) => {
                console.log({ outData });
            }}
            onClick={(item: TreeItem) => console.log(item)}
            viewState={{
                "tree-1": {
                    expandedItems: ["child1", "child11", "child2"],
                },
            }}
        >
            <VirtualTree treeId="tree-1" rootItem="root" />
        </VirtualForestWrapper>
    );
};

export const NoCollapseAllowed = () => {
    const ref = useRef(demoContent.data.items);
    const [data, setData] = useState<any>(ref.current);

    return (
        <VirtualForestWrapper
            allowDragAndDrop
            allowDropOnItemWithChildren
            allowReorderingItems
            containerSize={{ width: 300, height: 300 }}
            autoScrollDetectionZone={{ vertical: 50, horizontal: 50 }}
            dataProvider={new DataProvider(data, (item, data) => ({ ...item, data }))}
            getItemTitle={(item) => item.title}
            onChange={setData}
            onReorder={(outData) => {
                console.log({ outData });
            }}
            onClick={(item: TreeItem) => console.log(item)}
            viewState={{
                "tree-1": {
                    expandedItems: ["child1", "child11", "child2"],
                },
            }}
        >
            <VirtualTree treeId="tree-1" rootItem="root" />
        </VirtualForestWrapper>
    );
};

export const ThemeTree = () => {
    const ref = useRef(demoContent.data.items);
    const [data, setData] = useState<any>(ref.current);

    return (
        <VirtualForestWrapper
            allowDragAndDrop
            allowDropOnItemWithChildren
            allowReorderingItems
            allowCollapse
            containerSize={{ width: 300, height: 300 }}
            autoScrollDetectionZone={{ vertical: 50, horizontal: 50 }}
            dataProvider={new DataProvider(data, (item, data) => ({ ...item, data }))}
            getItemTitle={(item) => item.title}
            onChange={setData}
            onReorder={(outData) => {
                console.log({ outData });
            }}
            onClick={(item: TreeItem) => console.log(item)}
            viewState={{
                "tree-1": {
                    expandedItems: ["child1", "child11", "child2"],
                },
            }}
            renderItemTitle={({ title }) => <span>{title}</span>}
            renderItemArrow={({ item, context }) =>
                item.isFolder ? context.isExpanded ? <span>{">"}</span> : <span>{"v"}</span> : null
            }
            renderItem={({ title, arrow, depth, context, children }) => (
                <li {...context.itemContainerWithChildrenProps}>
                    <button {...context.itemContainerWithoutChildrenProps} {...(context.elementProps as any)}>
                        {arrow}
                        {title}
                    </button>
                    {children}
                </li>
            )}
            renderItemsContainer={({ children, containerProps }) => <ul {...containerProps}>{children}</ul>}
        >
            <VirtualTree treeId="tree-1" rootItem="root" />
        </VirtualForestWrapper>
    );
};
