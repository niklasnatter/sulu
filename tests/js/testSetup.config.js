// @flow
import Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import '@testing-library/jest-dom';

Enzyme.configure({adapter: new Adapter()});

jest.mock('sulu-admin-bundle/services/Config', () => ({
    endpoints: {
        'config': 'config_url',
        'translations': 'translations_url',
        'loginCheck': 'login_check_url',
        'logout': 'logout_url',
        'profileSettings': 'profile_settings_url',
        'forgotPasswordReset': 'forgot_password_reset_url',
        'resetPassword': 'reset_password',
        'resources': 'resources_url/:resource',
        'routing': 'routing',
    },
    translations: ['en', 'de'],
    fallbackLocale: 'en',
}));
