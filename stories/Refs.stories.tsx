import { useEffect, useRef, useState } from "react";
import { Meta } from "@storybook/react";
import {
    DataProvider,
    TreeContextProps,
    TreeItem,
    VirtualForestWrapper,
    VirtualTree,
    VirtualTreeContextProps,
} from "../src";
import { demoContent } from "./demoData";

export default {
    title: "React Refs",
} as Meta;

export const ControlTreeExternally = () => {
    const treeEnvironment = useRef<VirtualTreeContextProps>(null);
    const tree = useRef<TreeContextProps>(null);

    const ref = useRef(demoContent.data.items);
    const [data, setData] = useState<any>(ref.current);

    useEffect(() => {
        const interval = setInterval(() => {
            console.log(treeEnvironment.current, tree.current);
            if (treeEnvironment.current && tree.current) {
                const linearItems = tree.current.getItemsLinearly();
                const currentlyActive =
                    treeEnvironment.current.viewState[tree.current.treeId]?.focusedItem ?? linearItems[0].item;
                let nextActiveIndex = linearItems.findIndex((item) => item.item === currentlyActive) + 1;

                if (nextActiveIndex > linearItems.length - 1) {
                    nextActiveIndex = 0;
                }

                const nextActiveItem = linearItems[nextActiveIndex].item;

                if (treeEnvironment.current.items[nextActiveItem].isFolder) {
                    if (
                        treeEnvironment.current.viewState[tree.current.treeId]?.expandedItems?.includes(nextActiveItem)
                    ) {
                        treeEnvironment.current.onCollapseItem?.(
                            treeEnvironment.current.items[nextActiveItem],
                            tree.current.treeId
                        );
                    } else {
                        treeEnvironment.current.onExpandItem?.(
                            treeEnvironment.current.items[nextActiveItem],
                            tree.current.treeId
                        );
                    }
                }

                treeEnvironment.current.onFocusItem?.(
                    treeEnvironment.current.items[nextActiveItem],
                    tree.current.treeId
                );
            }
        }, 300);

        return () => clearInterval(interval);
    }, []);

    return (
        <VirtualForestWrapper
            ref={treeEnvironment}
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
            <VirtualTree treeId="tree-1" rootItem="root" ref={tree} />
        </VirtualForestWrapper>
    );
};
