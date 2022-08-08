//@flow
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import UserSection from '../UserSection';

jest.mock('../../../utils/Translator', () => ({
    translate: jest.fn((key) => key),
}));

test('The component should render with all available props and handle clicks correctly', async() => {
    const handleLogoutClick = jest.fn();
    const handleProfileClick = jest.fn();

    const {container} = render(
        <UserSection
            onLogoutClick={handleLogoutClick}
            onProfileClick={handleProfileClick}
            suluVersion="2.0.0-RC1"
            suluVersionLink="http://link.com"
            userImage="http://lorempixel.com/200/200"
            username="John Travolta"
        />
    );

    expect(container).toMatchSnapshot();

    await userEvent.click(screen.queryByText(/sulu_admin.edit_profile/));
    expect(handleProfileClick).toBeCalled();

    await userEvent.click(screen.queryByText(/sulu_admin.logout/));
    expect(handleLogoutClick).toBeCalled();
});
