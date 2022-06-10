import { useRef, useState } from 'react'
import './App.css'
import { UncontrolledTreeEnvironment, StaticTreeDataProvider, TreeItem, Tree, ExplicitDataSource } from '../../../src';
import '../../../src/style.css';
import { demoContent } from './demoData';

const itemsWithManyChildren: ExplicitDataSource = {
    items: {
        root: {
            index: "root",
            children: ["innerRoot"],
            data: "root",
            hasChildren: true,
            canMove: true,
            canRename: true,
        },
        innerRoot: {
            index: "innerRoot",
            children: [],
            data: "innerRoot",
            hasChildren: true,
            canMove: true,
            canRename: true,
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
        canRename: true,
    };
    itemsWithManyChildren.items.innerRoot.children!.push(id);
}

function App() {
    const ref = useRef(demoContent.data.items);
    const [data, setData] = useState<any>(ref.current);

    return (
        <UncontrolledTreeEnvironment
            canDragAndDrop
            canDragOnRoot
            canDropOnItemWithChildren
            canReorderItems
            allowCollapse
            containerSize={{ width: 300, height: 300 }}
            autoScrollDetectionZone={{ vertical: 50, horizontal: 50 }}
            dataProvider={new StaticTreeDataProvider(data, (item, itemData) => ({ ...item, itemData }))}
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
}

App.whyDidYouRender = true

export default App
