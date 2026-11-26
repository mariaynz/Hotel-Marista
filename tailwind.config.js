/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				primary: '#0F5C6E',
				secondary: '#F5F1E8',
				accent: '#C8963E',
				success: '#2E7D32',
				warning: '#B26A00',
				error: '#C62828',
				ink: '#1F2933',
				'ink-soft': '#5F6B76'
			},
			fontFamily: {
				display: ['"Playfair Display"', 'Georgia', 'serif'],
				sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
			}
		}
	},
	plugins: []
};
