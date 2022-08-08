// @flow
import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import Dialog from '../Dialog';

jest.mock('../../../utils/Translator', () => ({
    translate: jest.fn((key) => key),
}));

test('The component should render in body when open', () => {
    const {baseElement} = render(<Dialog
        cancelText="Cancel"
        confirmText="Confirm"
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
        open={true}
        title="My dialog title"
    >
        <div>My dialog content</div>
    </Dialog>
    );

    expect(baseElement).toMatchSnapshot();
    expect(screen.getByText('My dialog content')).toBeInTheDocument();
});

test('The component should render aligned to the left', () => {
    render(
        <Dialog
            align="left"
            cancelText="Cancel"
            confirmText="Confirm"
            onCancel={jest.fn()}
            onConfirm={jest.fn()}
            open={true}
            title="My dialog title"
        >
            <div>My dialog content</div>
        </Dialog>
    );

    expect(screen.queryByText('My dialog content').parentElement).toHaveClass('left');
});

test('The component should render in body without cancel button', () => {
    const onConfirm = jest.fn();
    render(
        <Dialog
            confirmText="Confirm"
            onConfirm={onConfirm}
            open={true}
            title="My dialog title"
        >
            <div>My dialog content</div>
        </Dialog>
    );

    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
});

test('The component should render in body with disabled confirm button', () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();
    render(
        <Dialog
            cancelText="Cancel"
            confirmDisabled={true}
            confirmText="Confirm"
            onCancel={onCancel}
            onConfirm={onConfirm}
            open={true}
            title="My dialog title"
        >
            <div>My dialog content</div>
        </Dialog>
    );

    const button = screen.queryByText('Confirm').parentElement;

    expect(button).toBeDisabled();
});

test('The component should render in body with a large class', () => {
    render(
        <Dialog
            cancelText="Cancel"
            confirmText="Confirm"
            onCancel={jest.fn()}
            onConfirm={jest.fn()}
            open={true}
            size="large"
            title="My dialog title"
        >
            <div>My dialog content</div>
        </Dialog>
    );

    const largeDiv = screen.queryByLabelText('su-exclamation-triangle')
        .parentElement
        .parentElement
        .parentElement
        .parentElement;

    expect(largeDiv).toBeInTheDocument();
    expect(largeDiv).toHaveClass('large');
});

test('The component should render in body with loader instead of confirm button', () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();
    render(
        <Dialog
            cancelText="Cancel"
            confirmLoading={true}
            confirmText="Confirm"
            onCancel={onCancel}
            onConfirm={onConfirm}
            open={true}
            title="My dialog title"
        >
            <div>My dialog content</div>
        </Dialog>
    );

    const loader = screen.queryByText('Confirm').nextElementSibling;
    expect(loader).toBeInTheDocument();
    expect(loader).toHaveClass('loader');
});

test('The component should not render in body when closed', () => {
    render(
        <Dialog
            cancelText="Cancel"
            confirmText="Confirm"
            onCancel={jest.fn()}
            onConfirm={jest.fn()}
            open={false}
            title="My dialog title"
        >
            My dialog content
        </Dialog>
    );
    expect(screen.queryByText('My dialog content')).not.toBeInTheDocument();
});

test('The component should call the callback when the confirm button is clicked', () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();
    render(
        <Dialog
            cancelText="Cancel"
            confirmText="Confirm"
            onCancel={onCancel}
            onConfirm={onConfirm}
            open={true}
            title="My dialog title"
        >
            My dialog content
        </Dialog>
    );
    const button = screen.queryByText('Confirm');

    expect(onConfirm).not.toBeCalled();
    fireEvent.click(button);
    expect(onConfirm).toBeCalled();
});

test('The component should call the callback when the cancel button is clicked', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    render(
        <Dialog
            cancelText="Cancel"
            confirmText="Confirm"
            onCancel={onCancel}
            onConfirm={onConfirm}
            open={true}
            title="My dialog title"
        >
            My dialog content
        </Dialog>
    );
    const button = screen.queryByText('Cancel');

    expect(onCancel).not.toBeCalled();
    fireEvent.click(button);
    expect(onCancel).toBeCalled();
});

test('The component should render with a warning', () => {
    const onConfirm = jest.fn();
    render(
        <Dialog
            confirmText="Confirm"
            onConfirm={onConfirm}
            open={true}
            snackbarMessage="Something really strange happened"
            snackbarType="warning"
            title="My dialog title"
        >
            <div>My dialog content</div>
        </Dialog>
    );

    const snackbar = screen.queryByText(/Something really strange happened/).parentElement;

    expect(snackbar).toBeInTheDocument();
    expect(snackbar).toHaveClass('snackbar', 'warning');
    expect(snackbar).not.toHaveClass('error');
    expect(snackbar.children[1]).toHaveTextContent('sulu_admin.warning - Something really strange happened');
});

test('The component should render with an error', () => {
    const onConfirm = jest.fn();
    render(
        <Dialog
            confirmText="Confirm"
            onConfirm={onConfirm}
            open={true}
            snackbarMessage="Money transfer unsuccessful"
            snackbarType="error"
            title="My dialog title"
        >
            <div>My dialog content</div>
        </Dialog>
    );

    const snackbar = screen.queryByText(/Money transfer unsuccessful/).parentElement;

    expect(snackbar).toBeInTheDocument();
    expect(snackbar).toHaveClass('snackbar', 'error');
    expect(snackbar).not.toHaveClass('warning');
    expect(snackbar.children[1]).toHaveTextContent('sulu_admin.error - Money transfer unsuccessful');
});

test('The component should render with an error if the type is unknown', () => {
    const onConfirm = jest.fn();
    render(
        <Dialog
            confirmText="Confirm"
            onConfirm={onConfirm}
            open={true}
            snackbarMessage="Money transfer unsuccessful"
            title="My dialog title"
        >
            <div>My dialog content</div>
        </Dialog>
    );

    const snackbar = screen.queryByText(/Money transfer unsuccessful/).parentElement;

    expect(snackbar).toBeInTheDocument();
    expect(snackbar).toHaveClass('snackbar', 'error');
    expect(snackbar).not.toHaveClass('warning');
    expect(snackbar.children[1]).toHaveTextContent('sulu_admin.error - Money transfer unsuccessful');
});

test('The component should call the callback when the snackbar close button is clicked', () => {
    const onSnackbarCloseClick = jest.fn();
    render(
        <Dialog
            confirmText="Confirm"
            onConfirm={jest.fn()}
            onSnackbarCloseClick={onSnackbarCloseClick}
            open={true}
            snackbarMessage="Money transfer unsuccessful"
            snackbarType="error"
            title="My dialog title"
        >
            My dialog content
        </Dialog>
    );

    const snackbar = screen.queryByText(/Money transfer unsuccessful/).parentElement;
    const closeIcon = screen.queryByLabelText('su-times');

    expect(snackbar).toBeInTheDocument();
    expect(onSnackbarCloseClick).not.toBeCalled();
    fireEvent.click(closeIcon);
    expect(onSnackbarCloseClick).toBeCalled();
});

test('The component should call the callback when the snackbar is clicked', () => {
    const onSnackbarClick = jest.fn();
    render(
        <Dialog
            confirmText="Confirm"
            onConfirm={jest.fn()}
            onSnackbarClick={onSnackbarClick}
            open={true}
            snackbarMessage="Something really strange happened"
            snackbarType="warning"
            title="My dialog title"
        >
            My dialog content
        </Dialog>
    );

    const snackbar = screen.queryByText(/Something really strange happened/).parentElement;

    expect(snackbar).toBeInTheDocument();
    expect(onSnackbarClick).not.toBeCalled();
    fireEvent.click(snackbar);
    expect(onSnackbarClick).toBeCalled();
});
