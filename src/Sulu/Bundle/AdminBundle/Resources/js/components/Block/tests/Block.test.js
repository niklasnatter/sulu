// @flow
import React from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Block from '../Block';

jest.mock('../../../utils/Translator', () => ({
    translate: (key) => key,
}));

test('Render an expanded block with multiple types', () => {
    const {container} = render(
        <Block
            activeType="type1"
            dragHandle={<span>Test</span>}
            expanded={true}
            icons={['su-eye', 'su-people']}
            onCollapse={jest.fn()}
            onExpand={jest.fn()}
            onSettingsClick={jest.fn()}
            types={{'type1': 'Type1', 'type2': 'Type2'}}
        >
            Some block content
        </Block>);

    expect(container).toMatchSnapshot();
});

test('Render an block without dragHandle or collapse or expand button', () => {
    const {container} = render(
        <Block expanded={true}>
            Some block content
        </Block>
    );
    expect(container).toMatchSnapshot();
});

test('Render a collapsed block', () => {
    const {container} = render(
        <Block expanded={false} icons={['su-eye', 'su-people']} onCollapse={jest.fn()} onExpand={jest.fn()}>
            Some block content
        </Block>
    );
    expect(container).toMatchSnapshot();
});

test('Do not show type dropdown if only a single type is passed', () => {
    const {container} = render(
        <Block expanded={true} onCollapse={jest.fn()} onExpand={jest.fn()} types={{'type': 'Type'}}>
            Some block content
        </Block>
    );

    // eslint-disable-next-line testing-library/no-container
    const elements = container.getElementsByClassName('select');

    expect(elements).toHaveLength(0);
});

test('Do not show remove icon if no onRemove prop has been passed', () => {
    render(
        <Block expanded={true} onCollapse={jest.fn()} onExpand={jest.fn()} types={{'type': 'Type'}}>
            Some block content
        </Block>
    );

    expect(screen.queryByLabelText('su-trash-alt')).not.toBeInTheDocument();
});

test('Do not show settings icon if no onSettingsClick prop has been passed', () => {
    render(
        <Block expanded={true} onCollapse={jest.fn()} onExpand={jest.fn()} types={{'type': 'Type'}}>
            Some block content
        </Block>
    );

    expect(screen.queryByLabelText('su-cog')).not.toBeInTheDocument();
});

test('Clicking on a collapsed block should call the onExpand callback', async() => {
    const expandSpy = jest.fn();
    render(<Block onCollapse={jest.fn()} onExpand={expandSpy}>Block content</Block>);

    await userEvent.click(screen.queryByRole('switch'));

    expect(expandSpy).toHaveBeenCalledTimes(1);
});

test('Clicking on a expanded block should not call the onExpand callback', async() => {
    const expandSpy = jest.fn();
    render(<Block expanded={true} onCollapse={jest.fn()} onExpand={expandSpy}>Block content</Block>);

    await userEvent.click(screen.queryByRole('switch'));

    expect(expandSpy).not.toBeCalled();
});

test('Clicking the close icon in an expanded block should collapse it', async() => {
    const collapseSpy = jest.fn();
    render(<Block expanded={true} onCollapse={collapseSpy} onExpand={jest.fn()}>Block content</Block>);

    const closeIcon = screen.queryByLabelText('su-angle-up');
    expect(closeIcon).toBeInTheDocument();

    await userEvent.click(closeIcon);

    expect(collapseSpy).toHaveBeenCalledTimes(1);
});

test('Clicking the remove icon in an expanded block should remove it', async() => {
    const removeSpy = jest.fn();
    render(
        <Block expanded={true} onCollapse={jest.fn()} onExpand={jest.fn()} onRemove={removeSpy}>Block content</Block>
    );

    const removeIcon = screen.queryByLabelText('su-trash-alt');
    expect(removeIcon).toBeInTheDocument();

    await userEvent.click(removeIcon);

    expect(removeSpy).toHaveBeenCalledTimes(1);
});

test('Changing the type should call the onTypeChange callback', async() => {
    const typeChangeSpy = jest.fn();
    const types = {
        type1: 'Type 1',
        type2: 'Type 2',
    };

    render(
        <Block
            activeType="type1"
            expanded={true}
            onCollapse={jest.fn()}
            onExpand={jest.fn()}
            onTypeChange={typeChangeSpy}
            types={types}
        >
            Block content
        </Block>
    );

    const selectButton = screen.queryByText('Type 1');
    await userEvent.click(selectButton);

    const typeButton = screen.queryByText('Type 2');
    await userEvent.click(typeButton);

    expect(typeChangeSpy).toBeCalledWith('type2');
    expect(typeChangeSpy).toHaveBeenCalledTimes(1);
});
