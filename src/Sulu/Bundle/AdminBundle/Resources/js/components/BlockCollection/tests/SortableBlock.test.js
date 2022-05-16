// @flow
import React from 'react';
import {mount, render, shallow} from 'enzyme';
import SortableBlock from '../SortableBlock';

jest.mock('react-sortable-hoc', () => ({
    SortableElement: jest.fn().mockImplementation((component) => component),
    SortableHandle: jest.fn().mockImplementation((component) => component),
}));

jest.mock('../../../utils/Translator', () => ({
    translate: (key) => key,
}));

test('Render collapsed sortable block', () => {
    expect(render(
        <SortableBlock
            actions={[]}

            activeType="editor"
            expanded={false}
            icons={['su-eye', 'su-people']}
            onCollapse={jest.fn()}
            onExpand={jest.fn()}
            onRemove={jest.fn()}
            renderBlockContent={jest.fn()}
            sortIndex={1}
            value={{content: 'Test Content'}}
        />
    )).toMatchSnapshot();
});

test('Render expanded sortable, non-collapsable block with types', () => {
    const renderBlockContent = jest.fn().mockImplementation(
        (value, type) => 'Test for ' + value.content + (type ? ' and type ' + type : '')
    );

    expect(render(
        <SortableBlock
            actions={[]}

            activeType="type2"
            expanded={true}
            onRemove={jest.fn()}
            onSettingsClick={jest.fn()}
            renderBlockContent={renderBlockContent}
            sortIndex={1}
            types={{type1: 'Type 1', type2: 'Type 2'}}
            value={{content: 'Test Content'}}
        />
    )).toMatchSnapshot();
});

test('Should not show block types if only a single block is passed', () => {
    const sortableBlock = mount(
        <SortableBlock
            actions={[]}

            activeType="editor"
            expanded={true}
            onCollapse={jest.fn()}
            onExpand={jest.fn()}
            onRemove={jest.fn()}
            renderBlockContent={jest.fn()}
            sortIndex={1}
            value={{content: 'Test Content'}}
        />
    );

    expect(sortableBlock.find('SingleSelect')).toHaveLength(0);
});

test('Should not show remove icon if no onRemove callback is passed', () => {
    const sortableBlock = mount(
        <SortableBlock
            actions={[]}

            activeType="editor"
            expanded={true}
            onCollapse={jest.fn()}
            onExpand={jest.fn()}
            renderBlockContent={jest.fn()}
            sortIndex={1}
            value={{content: 'Test Content'}}
        />
    );

    expect(sortableBlock.find('Icon[name="su-trash-alt"]')).toHaveLength(0);
});

test('Should not show the settings icon if no onSettingsClick callback is passed', () => {
    const sortableBlock = mount(
        <SortableBlock
            actions={[]}

            activeType="editor"
            expanded={true}
            onCollapse={jest.fn()}
            onExpand={jest.fn()}
            renderBlockContent={jest.fn()}
            sortIndex={1}
            value={{content: 'Test Content'}}
        />
    );

    expect(sortableBlock.find('Icon[name="su-cog"]')).toHaveLength(0);
});

test('Should call onCollapse when the block is being collapsed', () => {
    const collapseSpy = jest.fn();
    const expandSpy = jest.fn();
    const removeSpy = jest.fn();

    const sortableBlock = shallow(
        <SortableBlock
            actions={[]}

            activeType="editor"
            expanded={true}
            onCollapse={collapseSpy}
            onExpand={expandSpy}
            onRemove={removeSpy}
            renderBlockContent={jest.fn()}
            sortIndex={1}
            value={{content: 'Test Content'}}
        />
    );

    sortableBlock.find('Block').prop('onCollapse')();

    expect(collapseSpy).toBeCalledWith(1);
    expect(expandSpy).not.toBeCalled();
    expect(removeSpy).not.toBeCalled();
});

test('Should call onExpand when the block is being expanded', () => {
    const collapseSpy = jest.fn();
    const expandSpy = jest.fn();
    const removeSpy = jest.fn();

    const sortableBlock = shallow(
        <SortableBlock
            actions={[]}

            activeType="editor"
            expanded={true}
            onCollapse={collapseSpy}
            onExpand={expandSpy}
            onRemove={removeSpy}
            renderBlockContent={jest.fn()}
            sortIndex={1}
            value={{content: 'Test Content'}}
        />
    );

    sortableBlock.find('Block').prop('onExpand')();

    expect(collapseSpy).not.toBeCalled();
    expect(expandSpy).toBeCalledWith(1);
    expect(removeSpy).not.toBeCalled();
});

test('Should call onRemove when the block is being removed', () => {
    const collapseSpy = jest.fn();
    const expandSpy = jest.fn();
    const removeSpy = jest.fn();

    const sortableBlock = shallow(
        <SortableBlock
            actions={[]}

            activeType="editor"
            expanded={true}
            onCollapse={collapseSpy}
            onExpand={expandSpy}
            onRemove={removeSpy}
            renderBlockContent={jest.fn()}
            sortIndex={1}
            value={{content: 'Test Content'}}
        />
    );

    sortableBlock.find('Block').prop('onRemove')();

    expect(collapseSpy).not.toBeCalled();
    expect(expandSpy).not.toBeCalled();
    expect(removeSpy).toBeCalledWith(1);
});

test('Should call onSettingClick when the block setting icon is clicked', () => {
    const collapseSpy = jest.fn();
    const expandSpy = jest.fn();
    const settingsClickSpy = jest.fn();

    const sortableBlock = shallow(
        <SortableBlock
            actions={[]}

            activeType="editor"
            expanded={true}
            onCollapse={collapseSpy}
            onExpand={expandSpy}
            onSettingsClick={settingsClickSpy}
            renderBlockContent={jest.fn()}
            sortIndex={1}
            value={{content: 'Test Content'}}
        />
    );

    sortableBlock.find('Block').prop('onSettingsClick')();

    expect(collapseSpy).not.toBeCalled();
    expect(expandSpy).not.toBeCalled();
    expect(settingsClickSpy).toBeCalledWith(1);
});

test('Should call onTypeChange when the block has changed its type', () => {
    const typeChangeSpy = jest.fn();

    const sortableBlock = shallow(
        <SortableBlock
            actions={[]}

            activeType="editor"
            expanded={true}
            onCollapse={jest.fn()}
            onExpand={jest.fn()}
            onRemove={jest.fn()}
            onTypeChange={typeChangeSpy}
            renderBlockContent={jest.fn()}
            sortIndex={1}
            value={{content: 'Test Content'}}
        />
    );

    sortableBlock.find('Block').prop('onTypeChange')('type1');

    expect(typeChangeSpy).toBeCalledWith('type1', 1);
});

test('Should call renderBlockContent with the correct arguments', () => {
    const renderBlockContentSpy = jest.fn();
    const value = {content: 'Test 1'};

    shallow(
        <SortableBlock
            actions={[]}

            activeType="editor"
            expanded={true}
            onCollapse={jest.fn()}
            onExpand={jest.fn()}
            onRemove={jest.fn()}
            renderBlockContent={renderBlockContentSpy}
            sortIndex={7}
            value={value}
        />
    );

    expect(renderBlockContentSpy).toBeCalledWith(value, 'editor', 7, true);
});

test('Should call renderBlockContent with the correct arguments when block is collapsed', () => {
    const renderBlockContentSpy = jest.fn();
    const value = {content: 'Test 1'};

    shallow(
        <SortableBlock
            actions={[]}

            activeType="editor"
            expanded={false}
            onCollapse={jest.fn()}
            onExpand={jest.fn()}
            onRemove={jest.fn()}
            renderBlockContent={renderBlockContentSpy}
            sortIndex={7}
            value={value}
        />
    );

    expect(renderBlockContentSpy).toBeCalledWith(value, 'editor', 7, false);
});

test('Should call renderBlockContent with the correct arguments when types are involved', () => {
    const renderBlockContentSpy = jest.fn();
    const value = {content: 'Test 2'};

    shallow(
        <SortableBlock
            actions={[]}
            activeType="test"
            expanded={true}
            onCollapse={jest.fn()}
            onExpand={jest.fn()}
            onRemove={jest.fn()}
            renderBlockContent={renderBlockContentSpy}
            sortIndex={7}
            value={value}
        />
    );

    expect(renderBlockContentSpy).toBeCalledWith(value, 'test', 7, true);
});
