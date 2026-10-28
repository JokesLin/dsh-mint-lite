// dsh-mint-lite — browser half. MIT licensed.
//
// Deliberately tiny: three overridden tokens, one stylesheet, zero runtime
// machinery. No wallpapers, no backdrop-filter, no MutationObserver, no timers,
// no settings panel, and no persistence of its own — the appearance cubes in
// Settings -> General already persist light/dark/system for us.
//
// SCOPE: the content-area background, and nothing else.
//   Accents are untouched: buttons, links, focus rings, status colours,
//   borders, scrollbars, code blocks, diff colours and every text colour come
//   from the shell's own palette. Three tokens survive: the content surface,
//   the sidebar fill (green-grey so the two panes stay separable) and the
//   light-scheme font stack.
//
// LIGHT: 15% see-through, not "alpha 0.85".
//   Two nested surfaces paint --dsw-alias-bg-base (ui-layout's center column,
//   then ui-conversation's root), so alphas COMPOUND: the visible show-through
//   is (1-a)^2. Writing 0.85 would leave 2% showing; 0.61 gives ~15%.
//
// DARK IS STOCK DSH.
//   The stylesheet's paint rule only matches the light scheme, so in dark mode
//   this plugin adds no paint at all, and the token layer's dark column repeats
//   the shell's own values.
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

		/**
		 * One { light, dark } pair per token; ThemeRuntime picks a side by the
		 * ACTIVE color scheme, so both columns must be complete.
		 *
		 * Every dark value below is the shell's own value, so dark is stock.
		 */
		const TOKENS = {
			// Content surface: white at alpha 0.61 -> (1-0.61)^2 ≈ 15% show-through.
			"--dsw-alias-bg-base": {
				light: "rgba(255, 255, 255, 0.61)",
				dark: "var(--dsw-static-neutral-bluish-950)",
			},
			// Sidebar: green-grey, kept on purpose so the panes stay separable.
			"--dsw-specific-sidebar-fill": {
				light: "#dfe4df",
				dark: "var(--dsw-static-neutral-bluish-900)",
			},
			"--dsh-font-family-text-default": {
				light: FONT_ROUNDED,
				dark: FONT_STOCK,
			},
		};

		/**
		 * The only custom paint: a pale green wash behind the content surface.
		 * Deep enough to survive the 15% show-through — a near-white gradient
		 * would land within 1 RGB step of white and read as plain white.
		 */
		const BACKDROP_LIGHT =
			"linear-gradient(178deg, #eefcf4 0%, #eafaf0 38%, #e6f8ec 68%, #e2f6e8 100%)";

		const STYLE_ID = "dsh-mint-lite-backdrop";

		/** Ink is only nudged heavier; see the header note on measured ink. */
		const STROKE = "0.18px";

		function installStyles(ctx) {
			ctx.effect(() => {
				const style = document.createElement("style");
				style.id = STYLE_ID;
				style.textContent = [
					// --- backdrop, light scheme only ----------------------------
					// No dark rule on purpose: stock dark already paints its own
					// background, and an image there would only add work.
					"body:not([data-ds-dark-theme]) {",
					"  background-image: " + BACKDROP_LIGHT + ";",
					"  background-attachment: fixed;",
					"}",
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
			}, "dsh-mint-lite: backdrop + ink");
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
