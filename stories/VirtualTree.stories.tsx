import React, { useRef, useState } from "react";
import { Meta } from "@storybook/react";
import {
    VirtualForest,
    VirtualTree,
    VirtualForestWrapper,
    DataProvider,
    DataSource,
    TreeItem,
    TreeItemRenderContext,
    TreeRenderProps,
} from "../src";

const demoRenderer: TreeRenderProps = {
    renderItemTitle(item: TreeItem, context: TreeItemRenderContext): string {
        return item.title;
    },
};

const demoContent: { data: DataSource } = {
    data: {
        items: {
            root: {
                index: "root",
                title: "root",
                isFolder: true,
                children: ["child1", "child2"],
                canMove: true,
            },
            child1: {
                index: "child1",
                title: "child1",
                isFolder: true,
                children: ["child11"],
                canMove: false,
            },
            child2: {
                index: "child2",
                title: "child2",
                isFolder: true,
                children: ["child21", "child22", "child23", "child24", "child25", "child26", "child27", "child28"],
                canMove: false,
            },
            child21: {
                index: "child21",
                title: "child21",
                isFolder: false,
                children: [],
                canMove: true,
            },
            child22: {
                index: "child22",
                title: "child22",
                isFolder: false,
                children: [],
                canMove: true,
            },
            child23: {
                index: "child23",
                title: "child23",
                isFolder: false,
                children: [],
                canMove: true,
            },
            child24: {
                index: "child24",
                title: "child24",
                isFolder: false,
                children: [],
                canMove: true,
            },
            child25: {
                index: "child25",
                title: "child25",
                isFolder: false,
                children: [],
                canMove: true,
            },
            child26: {
                index: "child26",
                title: "child26",
                isFolder: false,
                children: [],
                canMove: true,
            },
            child27: {
                index: "child27",
                title: "child27",
                isFolder: false,
                children: [],
                canMove: true,
            },
            child28: {
                index: "child28",
                title: "child28",
                isFolder: false,
                children: [],
                canMove: true,
            },
            child11: {
                index: "child11",
                title: "child11",
                isFolder: true,
                children: ["child111", "child112"],
                canMove: true,
            },
            child111: {
                index: "child111",
                title: "child111",
                isFolder: false,
                children: [],
                canMove: true,
            },
            child112: {
                index: "child112",
                title: "child112",
                isFolder: true,
                children: ["child1121", "child1122", "child1123", "child1124", "child1125"],
                canMove: true,
            },
            child1121: {
                index: "child1121",
                title: "child1121",
                isFolder: false,
                children: [],
                canMove: true,
            },
            child1122: {
                index: "child1122",
                title: "child1122",
                isFolder: false,
                children: [],
                canMove: true,
            },
            child1123: {
                index: "child1123",
                title: "child1123",
                isFolder: false,
                children: [],
                canMove: true,
            },
            child1124: {
                index: "child1124",
                title: "child1124",
                isFolder: false,
                children: [],
                canMove: true,
            },
            child1125: {
                index: "child1125",
                title: "child1125",
                isFolder: false,
                children: [],
                canMove: true,
            },
        },
    },
};

export default {
    title: "Tree",
    component: VirtualForest,
} as Meta;

export const SingleTree = () => {
    const ref = useRef(demoContent.data.items);
    const [data, setData] = useState<any>(ref.current);

    return (
        <VirtualForestWrapper
            allowDragAndDrop={true}
            allowDropOnItemWithChildren={true}
            allowReorderingItems={true}
            containerSize={{ width: 300, height: 300 }}
            dataProvider={new DataProvider(data)}
            onChange={setData}
            onReorder={(data) => {
                console.log({ data });
            }}
            onClick={(item: TreeItem) => console.log(item)}
            viewState={{
                ["tree-1"]: {
                    expandedItems: ["child1", "child11", "child2"],
                },
            }}
            {...demoRenderer}
        >
            <VirtualTree treeId="tree-1" rootItem="root" />
        </VirtualForestWrapper>
    );
};

// export const SingleTreeAllCollapsed = () => (
//   <VirtualForestWrapper
//     allowDragAndDrop={true}
//     allowDropOnItemWithChildren={true}
//     allowReorderingItems={true}
//     dataProvider={new DataProvider(demoContent.data.items)}
//     viewState={{
//       ['tree-1']: {
//       }
//     }}
//     {...demoRenderer}
//   >
//     <VirtualTree treeId="tree-1" rootItem="root" />
//   </VirtualForestWrapper>
// );

// export const MultipleTrees = () => (
//   <VirtualForestWrapper
//     allowDragAndDrop={true}
//     allowDropOnItemWithChildren={true}
//     allowReorderingItems={true}
//     dataProvider={new DataProvider(demoContent.data.items)}
//     viewState={{
//       ['tree-1']: {
//       }
//     }}
//     {...demoRenderer}
//   >
//     <div style={{
//       display: 'flex',
//       backgroundColor: '#eee',
//       justifyContent: 'space-evenly',
//       alignItems: 'baseline',
//       padding: '20px 0',
//     }}>
//       <div style={{
//         width: '28%',
//         backgroundColor: 'white',
//       }}>
//         <VirtualTree treeId="tree-1" rootItem="root" />
//       </div>
//       <div style={{
//         width: '28%',
//         backgroundColor: 'white',
//       }}>
//         <VirtualTree treeId="tree-2" rootItem="root" />
//       </div>
//       <div style={{
//         width: '28%',
//         backgroundColor: 'white',
//       }}>
//         <VirtualTree treeId="tree-3" rootItem="root" />
//       </div>
//     </div>
//   </VirtualForestWrapper>
// );

// export const NoDragAndDrop = () => (
//   <VirtualForestWrapper
//     dataProvider={new DataProvider(demoContent.data.items)}
//     viewState={{
//       ['tree-1']: {
//         expandedItems: ['child1', 'child11', 'child2']
//       }
//     }}
//     {...demoRenderer}
//   >
//     <VirtualTree treeId="tree-1" rootItem="root" />
//   </VirtualForestWrapper>
// );

// export const NoReorderingAllowed = () => (
//   <VirtualForestWrapper
//     allowDragAndDrop={true}
//     allowDropOnItemWithChildren={true}
//     dataProvider={new DataProvider(demoContent.data.items)}
//     viewState={{
//       ['tree-1']: {
//         expandedItems: ['child1', 'child11', 'child2']
//       }
//     }}
//     {...demoRenderer}
//   >
//     <VirtualTree treeId="tree-1" rootItem="root" />
//   </VirtualForestWrapper>
// );
