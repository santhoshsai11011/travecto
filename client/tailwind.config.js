/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary:   '#0f1f4b',
        'primary-mid': '#1a2f6b',
        coral:     '#f76b5e',
        'coral-hover': '#f55244',
        'hero-center': '#1a3fd4',
        'hero-edge':   '#0e2494',
        'gray-bg':     '#f0f4f8',
        'gray-border': '#e5e9f0',
        'gray-muted':  '#6b7280',
        'green-ok':    '#22c55e',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
        input: '12px',
        badge: '8px',
      },
      boxShadow: {
        card:  '0 2px 12px rgba(15,31,75,0.08)',
        'card-hover': '0 4px 24px rgba(15,31,75,0.13)',
        hero:  '0 8px 40px rgba(15,31,75,0.18)',
      },
    },
  },
  plugins: [],
}
