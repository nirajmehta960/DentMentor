import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				/* Site band system. Values resolve from the custom properties each
				   `data-band` sets in src/components/site/site.css, so a section is
				   re-toned there rather than in its component. Stored as RGB triplets so
				   `<alpha-value>` works; the rules carry their own alpha. */
				band: {
					ground: 'rgb(var(--band-ground) / <alpha-value>)',
					raised: 'rgb(var(--band-raised) / <alpha-value>)',
					fg: 'rgb(var(--band-fg) / <alpha-value>)',
					muted: 'rgb(var(--band-muted) / <alpha-value>)',
					faint: 'rgb(var(--band-faint) / <alpha-value>)',
					signal: 'rgb(var(--band-signal) / <alpha-value>)',
					accent: 'rgb(var(--band-accent) / <alpha-value>)',
					'accent-hover': 'rgb(var(--band-accent-hover) / <alpha-value>)',
					'on-accent': 'rgb(var(--band-on-accent) / <alpha-value>)',
					rule: 'var(--band-rule)',
					'rule-faint': 'var(--band-rule-faint)',
					'rule-strong': 'var(--band-rule-strong)'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					hover: 'hsl(var(--primary-hover))',
					light: 'hsl(var(--primary-light))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					hover: 'hsl(var(--secondary-hover))',
					light: 'hsl(var(--secondary-light))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					hover: 'hsl(var(--accent-hover))',
					light: 'hsl(var(--accent-light))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-secondary': 'var(--gradient-secondary)',
				'gradient-accent': 'var(--gradient-accent)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-card': 'var(--gradient-card)'
			},
			boxShadow: {
				'soft': 'var(--shadow-soft)',
				'medium': 'var(--shadow-medium)',
				'large': 'var(--shadow-large)',
				'glow': 'var(--shadow-glow)',
				'orange-glow': 'var(--shadow-orange-glow)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				pill: '999px',
				panel: '14px',
				tile: '10px',
				sticker: '4px'
			},
			/* Inter is the whole app's typeface. Preflight applies `sans` to <html>, so
			   this one key restyles every page; `display` stays separate so headings
			   can take a different face later without touching markup. */
			fontFamily: {
				sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
				display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
			},
			fontSize: {
				'display-1': ['clamp(2.5rem, 1.2rem + 4.6vw, 5rem)', { lineHeight: '1.06' }],
				'display-2': ['clamp(2.25rem, 1.65rem + 2.7vw, 3.5rem)', { lineHeight: '1.04' }],
				'display-3': ['clamp(1.75rem, 1.35rem + 1.7vw, 2.5rem)', { lineHeight: '1.08' }],
				'body-lg': ['clamp(1.0625rem, 1rem + 0.4vw, 1.25rem)', { lineHeight: '1.55' }],
				'body-sm': ['clamp(0.9375rem, 0.9rem + 0.2vw, 1rem)', { lineHeight: '1.6' }]
			},
			transitionTimingFunction: {
				dm: 'var(--ease-dm)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
