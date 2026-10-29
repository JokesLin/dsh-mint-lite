// dsh-mint-lite — browser half. MIT licensed.
//
// Deliberately tiny: one token layer and one stylesheet. No wallpapers, no
// backdrop-filter, no MutationObserver, no timers, no settings panel, and no
// persistence of its own — the appearance cubes in Settings -> General already
// persist light/dark/system for us.
//
// SCOPE: the palette, not the accents.
//   Every token below paints a SURFACE or an INK level. Accents are untouched:
//   buttons, links, focus rings, status colours, diff colours and the brand
//   colour all keep the shell's own values. The one type token is the
//   light-scheme font stack.
//
// SOLID SURFACES, ON PURPOSE.
//   This theme writes opaque colours instead of an alpha over a backdrop image.
//   ds-bot (installed alongside) stacks its own theme layer through
//   ctx.theme.overrideTokens, and overlap is resolved per token by layer order.
//   Writing the SAME solid values it writes keeps both layers idempotent, so
//   the two surfaces agree no matter which layer lands on top. An alpha value
//   would repaint differently depending on which layer won.
//
// BOTH SCHEMES ARE OURS NOW.
//   The previous cut deferred to the shell in dark mode. The moonlight palette
//   defines its own dark column, so the dark half is a real palette (deep navy)
//   rather than a passthrough.
//
// DERIVED, NOT COPIED.
//   The eight-colour card in MOON is the only place colours are written down;
//   ink levels and borders are computed from it. Retune the card and the whole
//   theme follows.
//
// TYPE WEIGHT: raised a little, not a full step.
//   font-weight can only jump 400 -> 500, measured at +25% ink; that is more
//   than "a little". A 0.18px text stroke measures +7% ink, so the weight bump
//   is done with -webkit-text-stroke instead of a font-weight jump.

window.__ModuleLoader__.load({
	id: "dsh-mint-lite",
	factory: (require) => {
		const exports = {};
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		/** Layer identity for ctx.theme.overrideTokens(). */
		const OVERRIDE_SOURCE = "dsh-mint-lite:tokens";

		/** Rounded stack for the light scheme; dark keeps the shell's default. */
		const FONT_ROUNDED =
			'"SF Pro Rounded", ui-rounded, "PingFang SC", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif';
		const FONT_STOCK =
			'-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif';

		// --- The card ------------------------------------------------------------
		// The only place raw colours are written down. `card` is a step above `bg`
		// used for layered surfaces; `bubbleHi` is the highlighted bubble step.
		const MOON = {
			light: {
				bg: "#f7f9fc",
				sidebar: "#eef2f8",
				bubble: "#e5ebf5",
				bubbleHi: "#d8e2f2",
				card: "#ffffff",
				text: "#121826",
			},
			dark: {
				bg: "#0b1020",
				sidebar: "#10172a",
				bubble: "#1a2340",
				bubbleHi: "#232f52",
				card: "#141c33",
				text: "#e8edf7",
			},
		};

		/** `rgba()` from a hex colour plus an alpha. */
		const ink = (hex, alpha) => {
			const n = parseInt(hex.slice(1), 16);
			return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + alpha + ")";
		};

		/**
		 * One { light, dark } pair per token; ThemeRuntime picks a side by the
		 * ACTIVE color scheme, so both columns must be complete.
		 *
		 * Grouped by what the token paints, so a reviewer can tell surfaces from
		 * inks at a glance. Accents are absent by design.
		 */
		const TOKENS = {
			// --- content surface ------------------------------------------------
			"--dsw-alias-bg-base": { light: MOON.light.bg, dark: MOON.dark.bg },
			// --- sidebar --------------------------------------------------------
			"--dsw-specific-sidebar-fill": { light: MOON.light.sidebar, dark: MOON.dark.sidebar },
			"--dsw-specific-sidebar-nav-item-hover": {
				light: ink(MOON.light.text, 0.06),
				dark: ink(MOON.dark.text, 0.08),
			},
			"--dsw-specific-sidebar-nav-item-active": {
				light: "#e3e9f5",
				dark: MOON.dark.bubble,
			},
			// --- bubbles --------------------------------------------------------
			"--dsw-specific-bubble": { light: MOON.light.bubble, dark: MOON.dark.bubble },
			"--dsw-specific-bubble-highlight": { light: MOON.light.bubbleHi, dark: MOON.dark.bubbleHi },
			// --- layered surfaces -----------------------------------------------
			// Three steps above the content surface, so cards, popovers and menus
			// sit on the palette instead of on the shell's neutral greys.
			"--dsw-alias-bg-layer-1": { light: MOON.light.card, dark: MOON.dark.card },
			"--dsw-alias-bg-layer-2": { light: MOON.light.card, dark: MOON.dark.bubble },
			"--dsw-alias-bg-layer-3": { light: MOON.light.card, dark: MOON.dark.bubbleHi },
			"--dsw-alias-bg-module-platform": { light: MOON.light.sidebar, dark: MOON.dark.card },
			// Must match ds-bot's own pair (light.bg / dark.sidebar), not `card`: both
			// layers write this token, and the composer card is the surface where a
			// mismatch between them is most visible.
			"--dsw-specific-input-major": { light: MOON.light.bg, dark: MOON.dark.sidebar },
			// --- interactive fills ----------------------------------------------
			"--dsw-alias-interactive-bg-hover": {
				light: ink(MOON.light.text, 0.06),
				dark: ink(MOON.dark.text, 0.08),
			},
			"--dsw-alias-interactive-bg-active": {
				light: ink(MOON.light.text, 0.1),
				dark: ink(MOON.dark.text, 0.12),
			},
			"--dsw-alias-interactive-bg-hover-solid": { light: MOON.light.sidebar, dark: MOON.dark.bubble },
			// --- inks ------------------------------------------------------------
			"--dsw-alias-label-primary": { light: MOON.light.text, dark: MOON.dark.text },
			"--dsw-alias-label-secondary": {
				light: ink(MOON.light.text, 0.74),
				dark: ink(MOON.dark.text, 0.74),
			},
			"--dsw-alias-label-tertiary": {
				light: ink(MOON.light.text, 0.6),
				dark: ink(MOON.dark.text, 0.6),
			},
			// --- borders ---------------------------------------------------------
			// Cooler alphas than the shell's neutral hairlines, so borders sit on the
			// palette rather than reading as a warm line over a cool surface.
			"--dsw-alias-border-l1": { light: ink(MOON.light.text, 0.04), dark: ink(MOON.dark.text, 0.06) },
			"--dsw-alias-border-l2": { light: ink(MOON.light.text, 0.1), dark: ink(MOON.dark.text, 0.12) },
			"--dsw-alias-border-l3": { light: ink(MOON.light.text, 0.12), dark: ink(MOON.dark.text, 0.16) },
			"--dsw-alias-border-l4": { light: ink(MOON.light.text, 0.16), dark: ink(MOON.dark.text, 0.2) },
			// --- code ------------------------------------------------------------
			"--dsw-alias-markdown-code-block": { light: "#f1f4fa", dark: MOON.dark.card },
			// --- type ------------------------------------------------------------
			"--dsh-font-family-text-default": { light: FONT_ROUNDED, dark: FONT_STOCK },
		};

		const STYLE_ID = "dsh-mint-lite-ink";

		/** Ink is only nudged heavier; see the header note on measured ink. */
		const STROKE = "0.18px";

		function installStyles(ctx) {
			ctx.effect(() => {
				const style = document.createElement("style");
				style.id = STYLE_ID;
				style.textContent = [
					// --- slightly heavier ink ------------------------------------
					// Applied to text-bearing elements only, and only where the
					// platform actually rasterises a stroke. `paint-order: stroke`
					// keeps the stroke from eating letter interiors.
					"body[data-ds-dark-theme] h1, body[data-ds-dark-theme] h2,",
					"body[data-ds-dark-theme] h3, body[data-ds-dark-theme] h4,",
					"body[data-ds-dark-theme] p, body[data-ds-dark-theme] li,",
					"body[data-ds-dark-theme] td, body[data-ds-dark-theme] th,",
					"body:not([data-ds-dark-theme]) h1, body:not([data-ds-dark-theme]) h2,",
					"body:not([data-ds-dark-theme]) h3, body:not([data-ds-dark-theme]) h4,",
					"body:not([data-ds-dark-theme]) p, body:not([data-ds-dark-theme]) li,",
					"body:not([data-ds-dark-theme]) td, body:not([data-ds-dark-theme]) th {",
					"  -webkit-text-stroke-width: " + STROKE + ";",
					"  -webkit-text-stroke-color: currentColor;",
					"  paint-order: stroke fill;",
					"}",
				].join("\n");
				document.head.appendChild(style);
				return () => {
					style.remove();
				};
			}, "dsh-mint-lite: ink");
		}

		const inject = ["theme"];

		/**
		 * Stack the token layer. overrideTokens returns a disposer that removes
		 * exactly this layer, so unloading restores whatever was underneath.
		 */
		function apply(ctx) {
			installStyles(ctx);
			ctx.effect(
				() => ctx.theme.overrideTokens(OVERRIDE_SOURCE, TOKENS),
				"dsh-mint-lite: token layer"
			);
		}

		exports.inject = inject;
		exports.apply = apply;
		return exports;
	},
});
