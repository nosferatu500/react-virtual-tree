import React, { useRef, useState } from "react";
import { Meta } from "@storybook/react";
import { DataProvider, DataSource, TreeItem, VirtualForestWrapper, VirtualTree } from "../src";

const itemsWithManyChildren: DataSource = {
    items: {
        root: {
            index: "root",
            children: ["innerRoot"],
            title: "root",
            isFolder: true,
            canMove: true,
        },
        innerRoot: {
            index: "innerRoot",
            children: [],
            title: "innerRoot",
            isFolder: true,
            canMove: true,
        },
    },
};

for (let i = 0; i < 1000; i++) {
    const id = `item${i}`;
    itemsWithManyChildren.items[id] = {
        index: id,
        isFolder: false,
        title: id,
        canMove: true,
        children: [],
    };
    itemsWithManyChildren.items.innerRoot.children.push(id);
}

export default {
    title: "LongTree",
} as Meta;

export const LongTree = () => {
    const ref = useRef(itemsWithManyChildren.items);
    const [data, setData] = useState<any>(ref.current);

    return (
        <VirtualForestWrapper
            allowDragAndDrop
            allowDropOnItemWithChildren
            allowReorderingItems
            allowCollapse
            dataProvider={new DataProvider(data, (item, data) => ({ ...item, data }))}
            getItemTitle={(item) => item.title}
            containerSize={{ width: 300, height: 300 }}
            autoScrollDetectionZone={{ vertical: 50, horizontal: 50 }}
            viewState={{}}
            onChange={setData}
            onReorder={(outData) => {
                console.log({ outData });
            }}
            onClick={(item: TreeItem) => console.log(item)}
        >
            <VirtualTree treeId="tree-1" rootItem="root" />
        </VirtualForestWrapper>
    );
};
