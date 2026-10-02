const BASE = import.meta.env.VITE_API_URL;

export const session = {
    get: () => {
        try {
            return JSON.parse(sessionStorage.getItem('session'));
        } catch {
            return null;
        }
    },

    set: s => sessionStorage.setItem('session', JSON.stringify(s)),

    clear: () => sessionStorage.removeItem('session'),
};

export async function api(path, { method = 'GET', body, params } = {}) {
    const qs = params
        ? '?' +
          new URLSearchParams(
              Object.fromEntries(
                  Object.entries(params).filter(([, v]) => v)
              )
          )
        : '';

    const res = await fetch(BASE + path + qs, {
        method,
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + (session.get()?.token || ''),
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 401 && path !== '/auth/login') {
        session.clear();
        sessionStorage.setItem('expired', '1');
        window.location.reload();
        throw new Error('Session expired');
    }

    if (!res.ok) {
        throw new Error(data.message || 'Request failed');
    }

    return data;
}

const emailPattern = new RegExp(
    '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
);

const passwordPattern = new RegExp(
    '^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$'
);

export const rules = {
    name: v =>
        (typeof v === 'string' &&
            v.trim().length >= 20 &&
            v.trim().length <= 60) ||
        'Name must be 20-60 characters',

    email: v =>
        (typeof v === 'string' &&
            emailPattern.test(v.trim())) ||
        'Enter a valid email',

    address: v =>
        (typeof v === 'string' &&
            v.trim().length >= 1 &&
            v.trim().length <= 400) ||
        'Address is required (max 400 characters)',

    password: v =>
        (typeof v === 'string' &&
            passwordPattern.test(v)) ||
        'Password must be 8-16 characters with one uppercase letter and one special character',
};