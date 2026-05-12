import * as fs from 'fs';
import * as path from 'path';

export function getAuthHeadersFromState(stateFilePath: string) {
	try {
		const state = JSON.parse(fs.readFileSync(path.resolve(stateFilePath), 'utf-8'));
        const cookies = state.cookies;

        const xsrfCookie = cookies.find(
			(cookie: any) => cookie.name === 'XSRF-TOKEN' && cookie.domain.includes('self-service.danads.com'),
		);

        const domain = xsrfCookie?.domain || 'nin-stage.self-service.danads.com';
        const origin = `https://${domain.startsWith('.') ? domain.substring(1) : domain}`;

		const browserCookie = cookies.map((cookie: any) => ({
			name: cookie.name,
			value: cookie.value,
			domain: cookie.domain || domain,
			path: cookie.path || '/',
		}));

		const cookieString = cookies.map((cookie: any) => `${cookie.name}=${cookie.value}`).join('; ');

		const xsrfToken = xsrfCookie?.value;

		return {
			browserCookie,
			headers: {
				Cookie: cookieString,
				'Content-Type': 'application/json',
				Accept: 'application/json',
				'User-Agent': 'k6-load-test',
				Origin: origin,
				Referer: `${origin}/`,
				'x-xsrf-token': xsrfToken ? decodeURIComponent(xsrfToken) : '',
			},
		};
	} catch (error) {
		console.error('Error preparing auth headers:', error);
		throw error;
	}
}
