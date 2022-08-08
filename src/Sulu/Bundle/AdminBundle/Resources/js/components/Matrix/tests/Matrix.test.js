// @flow
import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import Matrix from '../Matrix';
import Row from '../Row';
import Item from '../Item';

afterEach(() => {
    if (document.body) {
        document.body.innerHTML = '';
    }
});

jest.mock('../../../utils/Translator', () => ({
    translate(key) {
        switch (key) {
            case 'sulu_admin.activate_all':
                return 'Activate all';
            case 'sulu_admin.deactivate_all':
                return 'Deactivate all';
        }
    },
}));

test('Render the Matrix component', () => {
    const handleChange = jest.fn();
    const {container} = render(
        <Matrix className="test" onChange={handleChange}>
            <Row name="global.articles" title="articles">
                <Item icon="su-pen" name="view" />
                <Item icon="su-plus" name="edit" />
                <Item icon="su-trash-alt" name="delete" />
            </Row>
            <Row name="global.redirects" title="redirects">
                <Item icon="su-pen" name="view" />
            </Row>
            <Row name="global.settings" title="settings">
                <Item icon="su-pen" name="view" />
                <Item icon="su-plus" name="edit" />
            </Row>
        </Matrix>
    );

    expect(container).toMatchSnapshot();
});

test('Render the Matrix component with values', () => {
    const handleChange = jest.fn();
    const values = {
        'global.articles': {
            'view': true,
            'edit': true,
            'delete': false,
        },
        'global.redirects': {
            'view': true,
        },
        'global.settings': {
            'view': true,
            'edit': false,
        },
    };

    const {container} = render(
        <Matrix onChange={handleChange} values={values}>
            <Row name="global.articles" title="articles">
                <Item icon="su-pen" name="view" />
                <Item icon="su-plus" name="edit" />
                <Item icon="su-trash-alt" name="delete" />
            </Row>
            <Row name="global.redirects" title="redirects">
                <Item icon="su-pen" name="view" />
            </Row>
            <Row name="global.settings" title="settings">
                <Item icon="su-pen" name="view" />
                <Item icon="su-plus" name="edit" />
            </Row>
        </Matrix>
    );

    expect(container).toMatchSnapshot();
});

test('Render the Matrix component with values in disabled state', () => {
    const handleChange = jest.fn();
    const values = {
        'global.articles': {
            'view': true,
            'edit': true,
            'delete': false,
        },
        'global.redirects': {
            'view': true,
        },
        'global.settings': {
            'view': true,
            'edit': false,
        },
    };

    const {container} = render(
        <Matrix disabled={true} onChange={handleChange} values={values}>
            <Row name="global.articles" title="articles">
                <Item icon="su-pen" name="view" />
                <Item icon="su-plus" name="edit" />
                <Item icon="su-trash-alt" name="delete" />
            </Row>
            <Row name="global.redirects" title="redirects">
                <Item icon="su-pen" name="view" />
            </Row>
            <Row name="global.settings" title="settings">
                <Item icon="su-pen" name="view" />
                <Item icon="su-plus" name="edit" />
            </Row>
        </Matrix>
    );

    expect(container).toMatchSnapshot();
});

test('Changing a value should call onChange ', () => {
    const handleChange = jest.fn();
    const values = {
        'global.articles': {
            'view': true,
            'edit': true,
            'delete': false,
        },
        'global.redirects': {
            'view': true,
        },
        'global.settings': {
            'view': true,
            'edit': false,
        },
    };

    render(
        <Matrix onChange={handleChange} values={values}>
            <Row name="global.articles" title="articles">
                <Item icon="su-pen" name="view" />
                <Item icon="su-plus" name="edit" />
                <Item icon="su-trash-alt" name="delete" />
            </Row>
            <Row name="global.redirects" title="redirects">
                <Item icon="su-pen" name="view" />
            </Row>
            <Row name="global.settings" title="settings">
                <Item icon="su-pen" name="view" />
                <Item icon="su-plus" name="edit" />
            </Row>
        </Matrix>
    );

    const expectedValues = {
        'global.articles': {
            'view': true,
            'edit': true,
            'delete': false,
        },
        'global.redirects': {
            'view': false,
        },
        'global.settings': {
            'view': true,
            'edit': false,
        },
    };

    const item = screen.queryAllByLabelText('su-pen')[1].parentElement;
    fireEvent.click(item);
    expect(handleChange).toHaveBeenCalledWith(expectedValues);
});

test('Deactivate all button should call onChange', () => {
    const handleChange = jest.fn();
    const values = {
        'global.articles': {
            'view': true,
            'edit': true,
            'delete': false,
        },
        'global.redirects': {
            'view': true,
        },
        'global.settings': {
            'view': true,
            'edit': false,
        },
    };

    render(
        <Matrix onChange={handleChange} values={values}>
            <Row name="global.articles" title="articles">
                <Item icon="su-pen" name="view" />
                <Item icon="su-plus" name="edit" />
                <Item icon="su-trash-alt" name="delete" />
            </Row>
            <Row name="global.redirects" title="redirects">
                <Item icon="su-pen" name="view" />
            </Row>
            <Row name="global.settings" title="settings">
                <Item icon="su-pen" name="view" />
                <Item icon="su-plus" name="edit" />
            </Row>
        </Matrix>
    );

    const expectedValues = {
        'global.articles': {
            'view': false,
            'edit': false,
            'delete': false,
        },
        'global.redirects': {
            'view': true,
        },
        'global.settings': {
            'view': true,
            'edit': false,
        },
    };

    const disableRowButton = screen.queryAllByText('Deactivate all')[0];
    fireEvent.click(disableRowButton);
    expect(handleChange).toHaveBeenCalledWith(expectedValues);
});

test('Activate all button should call onChange', () => {
    const handleChange = jest.fn();
    const values = {
        'global.articles': {
            'view': false,
            'edit': false,
            'delete': false,
        },
        'global.redirects': {
            'view': true,
        },
        'global.settings': {
            'view': true,
            'edit': false,
        },
    };

    render(
        <Matrix onChange={handleChange} values={values}>
            <Row name="global.articles" title="articles">
                <Item icon="su-pen" name="view" />
                <Item icon="su-plus" name="edit" />
                <Item icon="su-trash-alt" name="delete" />
            </Row>
            <Row name="global.redirects" title="redirects">
                <Item icon="su-pen" name="view" />
            </Row>
            <Row name="global.settings" title="settings">
                <Item icon="su-pen" name="view" />
                <Item icon="su-plus" name="edit" />
            </Row>
        </Matrix>
    );

    const expectedValues = {
        'global.articles': {
            'view': true,
            'edit': true,
            'delete': true,
        },
        'global.redirects': {
            'view': true,
        },
        'global.settings': {
            'view': true,
            'edit': false,
        },
    };

    const activateRowButton = screen.queryAllByText('Activate all')[0];
    fireEvent.click(activateRowButton);
    expect(handleChange).toHaveBeenCalledWith(expectedValues);
});

test('Activate all button should call onChange with all values, even when the value does not exists', () => {
    const handleChange = jest.fn();
    const values = {
        'global.articles': {
            'view': false,
            'edit': false,
            'delete': false,
        },
        'global.redirects': {
            'view': true,
        },
    };

    render(
        <Matrix onChange={handleChange} values={values}>
            <Row name="global.articles" title="articles">
                <Item icon="su-pen" name="view" />
                <Item icon="su-plus" name="edit" />
                <Item icon="su-trash-alt" name="delete" />
            </Row>
            <Row name="global.redirects" title="redirects">
                <Item icon="su-pen" name="view" />
            </Row>
            <Row name="global.settings" title="settings">
                <Item icon="su-pen" name="view" />
                <Item icon="su-plus" name="edit" />
            </Row>
        </Matrix>
    );

    const expectedValues = {
        'global.articles': {
            'view': false,
            'edit': false,
            'delete': false,
        },
        'global.redirects': {
            'view': true,
        },
        'global.settings': {
            'view': true,
            'edit': true,
        },
    };

    const activateRowButton = screen.queryAllByText('Activate all')[1];
    fireEvent.click(activateRowButton);
    expect(handleChange).toHaveBeenCalledWith(expectedValues);
});
