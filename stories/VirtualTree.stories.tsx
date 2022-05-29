import React from 'react';
import { Meta } from '@storybook/react';
import { VirtualForest } from '../src';
import { DataSource, TreeItem, TreeItemRenderContext, TreeRenderProps } from '../src/types';
import { VirtualTree } from '../src/VirtualTree';
import { VirtualForestWrapper } from '../src/VirtualForestWrapper';
import { DataProvider } from '../src/static/DataProvider';

const demoRenderer: TreeRenderProps<string> = {
  renderItemTitle(item: TreeItem<string>, context: TreeItemRenderContext): string {
    return item.data;
  },
};

const demoContent: { data: DataSource } = {
  data: {
    items: {
      root: {
        index: 'root',
        data: 'root',
        children: ['child1', 'child2'],
        canMove: true,
      },
      child1: {
        index: 'child1',
        data: 'child1',
        children: ['child11'],
        canMove: true,
      },
      child2: {
        index: 'child2',
        data: 'child2',
        children: ['child21'],
        canMove: true,
      },
      child21: {
        index: 'child21',
        data: 'child21',
        children: [],
        canMove: true,
      },
      child11: {
        index: 'child11',
        data: 'child11',
        children: ['child111', 'child112'],
        canMove: true,
      },
      child111: {
        index: 'child111',
        data: 'child111',
        children: [],
        canMove: true,
      },
      child112: {
        index: 'child112',
        data: 'child112',
        children: ['child1121'],
        canMove: true,
      },
      child1121: {
        index: 'child1121',
        data: 'child1121',
        children: [],
        canMove: true,
      },
    }
  }
};

export default {
  title: 'Tree',
  component: VirtualForest,
} as Meta;

export const SingleTree = () => (
  <VirtualForestWrapper
    dataProvider={new DataProvider(demoContent.data.items)}
    viewState={{
      ['tree-1']: {
        expandedItems: ['child1', 'child11', 'child2']
      }
    }}
    {...demoRenderer}
  >
    <VirtualTree treeId="tree-1" rootItem="root" />
  </VirtualForestWrapper>
)
