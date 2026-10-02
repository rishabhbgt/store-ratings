import { useState } from 'react';
import { api, session } from './api.js';
import { Form } from './components.jsx';

export default function Auth({ onLogin }) {
    const [mode, setMode] = useState('login');
    const [note, setNote] = useState(() =>
        sessionStorage.getItem('expired')
            ? 'Your session expired. Please log in again.'
            : ''
    );

    const isLogin = mode === 'login';

    const go = nextMode => {
        setMode(nextMode);
        setNote('');
    };

    return (
        <div className={`login-page ${!isLogin ? 'signup-mode' : ''}`}>
            <div className="login-wrap">

                <div className="login-card">

                    {/* Gradient Header */}
                    <div className="login-header">
                        <div className="login-header-mark">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
                            </svg>
                        </div>

                        <h1>Store Ratings</h1>

                        <p>
                            {isLogin
                                ? 'Welcome back to your store rating platform'
                                : 'Create your account to start rating stores'}
                        </p>
                    </div>

                    {/* Form Content */}
                    <div className="login-content">

                        <div className="login-intro">
                            <h2>
                                {isLogin
                                    ? 'Welcome Back'
                                    : 'Create your account'}
                            </h2>

                            <p>
                                {isLogin
                                    ? 'Sign in to continue to Store Ratings'
                                    : 'Sign up to start rating stores'}
                            </p>
                        </div>

                        {note && <p className="ok login-note">{note}</p>}

                        {isLogin ? (
                            <Form
                                key="login"
                                submitLabel="Sign In"
                                fields={[
                                    {
                                        name: 'email',
                                        label: 'Email Address',
                                        type: 'email',
                                        rule: 'email',
                                        placeholder: 'Enter your email',
                                        auto: 'email'
                                    },
                                    {
                                        name: 'password',
                                        label: 'Password',
                                        type: 'password',
                                        placeholder: 'Enter your password',
                                        auto: 'current-password'
                                    },
                                ]}
                                onSubmit={async body => {
                                    const s = await api('/auth/login', {
                                        method: 'POST',
                                        body
                                    });

                                    sessionStorage.removeItem('expired');
                                    session.set(s);
                                    onLogin(s);
                                }}
                            />
                        ) : (
                            <Form
                                key="signup"
                                submitLabel="Create Account"
                                fields={[
                                    {
                                        name: 'name',
                                        label: 'Full Name',
                                        rule: 'name',
                                        placeholder: 'Enter your full name',
                                        hint: '20 to 60 characters',
                                        auto: 'name'
                                    },
                                    {
                                        name: 'email',
                                        label: 'Email Address',
                                        type: 'email',
                                        rule: 'email',
                                        placeholder: 'Enter your email',
                                        auto: 'email'
                                    },
                                    {
                                        name: 'address',
                                        label: 'Address',
                                        rule: 'address',
                                        long: true,
                                        placeholder: 'Enter your address',
                                        hint: 'Up to 400 characters',
                                        auto: 'street-address'
                                    },
                                    {
                                        name: 'password',
                                        label: 'Password',
                                        type: 'password',
                                        rule: 'password',
                                        placeholder: 'Create a password',
                                        hint: '8-16 characters, one uppercase letter and one special character',
                                        auto: 'new-password'
                                    },
                                ]}
                                onSubmit={async body => {
                                    await api('/auth/signup', {
                                        method: 'POST',
                                        body
                                    });

                                    setMode('login');
                                    setNote('Account created. Log in to continue.');
                                }}
                            />
                        )}

                        {/* Bottom switch */}
                        <div className="login-switch">
                            <p>
                                {isLogin
                                    ? "Don't have an account?"
                                    : 'Already have an account?'}

                                <button
                                    type="button"
                                    onClick={() =>
                                        go(isLogin ? 'signup' : 'login')
                                    }
                                >
                                    {isLogin
                                        ? 'Create Account'
                                        : 'Sign In'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>

                <p className="login-foot">
                    Your password is stored securely.
                </p>
            </div>
        </div>
    );
}