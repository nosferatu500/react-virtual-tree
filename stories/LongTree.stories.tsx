import React, { useRef, useState } from "react";
import { Meta } from "@storybook/react";
import { ExplicitDataSource, StaticTreeDataProvider, Tree, TreeItem, UncontrolledTreeEnvironment } from "../src";

const itemsWithManyChildren: ExplicitDataSource = {
    items: {
        root: {
            index: "root",
            children: ["innerRoot"],
            data: "root",
            hasChildren: true,
            canMove: true,
        },
        innerRoot: {
            index: "innerRoot",
            children: [],
            data: "innerRoot",
            hasChildren: true,
            canMove: true,
        },
    },
};

for (let i = 0; i < 1000; i++) {
    const id = `item${i}`;
    itemsWithManyChildren.items[id] = {
        index: id,
        hasChildren: false,
        data: id,
        canMove: true,
    };
    itemsWithManyChildren.items.innerRoot.children!.push(id);
}

export default {
    title: "LongTree",
} as Meta;

export const LongTree = () => {
    const ref = useRef(itemsWithManyChildren.items);
    const [data, setData] = useState<any>(ref.current);

    return (
        <UncontrolledTreeEnvironment
            canDragAndDrop
            canDropOnItemWithChildren
            canReorderItems
            allowCollapse
            dataProvider={new StaticTreeDataProvider(data)}
            getItemTitle={(item) => item.data}
            containerSize={{ width: 300, height: 300 }}
            autoScrollDetectionZone={{ vertical: 50, horizontal: 50 }}
            viewState={{}}
            onChange={setData}
            onReorder={(outData) => {
                console.log({ outData });
            }}
            onClick={(item: TreeItem) => console.log(item)}
        >
            <Tree treeId="tree-1" rootItem="root" />
        </UncontrolledTreeEnvironment>
    );
};
