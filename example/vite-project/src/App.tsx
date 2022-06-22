import { useRef, useState } from 'react'
import './App.css'
import { UncontrolledTreeEnvironment, StaticTreeDataProvider, TreeItem, Tree, ExplicitDataSource } from '../../../src';
import '../../../src/style.css';
import { demoContent } from './demoData';
import { DndContext } from 'react-dnd';

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

for (let i = 0; i < 100; i++) {
    const id = `item${i}`;
    itemsWithManyChildren.items[id] = {
        index: id,
        hasChildren: false,
        data: id,
        canMove: true,
    };
    itemsWithManyChildren.items.innerRoot.children!.push(id);
}

function App() {
    const [data, setData] = useState<any>(itemsWithManyChildren.items);

    const dataProvider = new StaticTreeDataProvider(data);

    return (
        <>
            <button onClick={() => {
                const i = Math.random()
                const id = `item${i}`;
                itemsWithManyChildren.items[id] = {
                    index: id,
                    hasChildren: false,
                    data: id,
                    canMove: true,
                };
                itemsWithManyChildren.items.innerRoot.children!.push(id);
                setData(itemsWithManyChildren.items)
                dataProvider.onChangeItemChildren("root", ["innerRoot"])
            }}>
                text
            </button>
            <DndContext.Consumer>
                {({ dragDropManager }) =>
                    !dragDropManager ? undefined : (
                        <UncontrolledTreeEnvironment
                            canDragAndDrop
                            canDragOnRoot
                            canDropOnItemWithChildren
                            canReorderItems
                            allowCollapse
                            dragDropManager={dragDropManager}
                            containerSize={{ width: 300, height: 300 }}
                            autoScrollDetectionZone={{ vertical: 50, horizontal: 50 }}
                            dataProvider={dataProvider}
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
                    )
                }
            </DndContext.Consumer>

        </>
    );
}

App.whyDidYouRender = true

export default App
