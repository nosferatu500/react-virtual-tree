import React, { useRef, useState } from "react";
import { Meta } from "@storybook/react";
import { StaticTreeDataProvider, Tree, TreeItem, UncontrolledTreeEnvironment } from "../src";
import { demoContent } from "./demoData";

export default {
    title: "Tree",
} as Meta;

export const SingleTree = () => {
    const ref = useRef(demoContent.data.items);
    const [data, setData] = useState<any>(ref.current);

    return (
        <UncontrolledTreeEnvironment
            canDragAndDrop
            canDropOnItemWithChildren
            canReorderItems
            allowCollapse
            containerSize={{ width: 300, height: 300 }}
            autoScrollDetectionZone={{ vertical: 50, horizontal: 50 }}
            dataProvider={new StaticTreeDataProvider(data)}
            getItemTitle={(item) => item.data}
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
            <Tree treeId="tree-1" rootItem="root" />
        </UncontrolledTreeEnvironment>
    );
};

export const MultipleTrees = () => {
    const ref = useRef(demoContent.data.items);
    const [data, setData] = useState<any>(ref.current);

    return (
        <UncontrolledTreeEnvironment
            canDragAndDrop
            canDropOnItemWithChildren
            canReorderItems
            allowCollapse
            containerSize={{ width: 300, height: 300 }}
            autoScrollDetectionZone={{ vertical: 50, horizontal: 50 }}
            dataProvider={new StaticTreeDataProvider(data)}
            getItemTitle={(item) => item.data}
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
                    <Tree treeId="tree-1" rootItem="root" />
                </div>
                <div
                    style={{
                        width: "28%",
                        backgroundColor: "white",
                    }}
                >
                    <Tree treeId="tree-2" rootItem="root" />
                </div>
                <div
                    style={{
                        width: "28%",
                        backgroundColor: "white",
                    }}
                >
                    <Tree treeId="tree-3" rootItem="root" />
                </div>
            </div>
        </UncontrolledTreeEnvironment>
    );
};
