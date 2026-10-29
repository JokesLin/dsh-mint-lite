// dsh-mint-lite — browser half. MIT licensed.
//
// A moonlight palette with three controls, registered as one extra row in
// Settings -> General, directly under the shell's own Appearance row.
//
// THE CONTROLS
//   Message shape  bubble | conversation — the shape of YOUR OWN messages.
//   Palette        moonlight | stock     — this palette, or whatever is under it.
//   Sidebar        0..100               — how far the sidebar sits from the
//                                          content colour. 0 makes them match.
//
// PREFERENCES LIVE IN localStorage, PER BROWSER.
//   Key `dsh-mint-lite:prefs`. Not a Host settings namespace on purpose: that
//   would mean a Config schema in index.js, a settings contract, and a
//   migration story, all for three cosmetic values. The cost is real: these
//   three do NOT sync across devices, while ui-theme's light/dark/system does.
//
// WHY !important INSTEAD OF ctx.theme.overrideTokens()
//   ds-bot also stacks a token layer and re-stacks it on every roster change,
//   so its layer always lands above ours. A token layer here would be silently
//   outranked — the palette switch and the slider would move nothing at all.
//   CSS declarations marked !important outrank inline style, which is how
//   ui-layout and ds-bot both write tokens, so a stylesheet takes authority
//   back. Fonts stay on overrideTokens precisely BECAUSE they must remain
//   overwritable by ui-theme's own font settings.
//
// "STOCK" IS A PAINT, NOT AN ABSENCE
//   Turning this palette off cannot mean "stop painting": ds-bot's layer keeps
//   writing moonlight values into body's inline style, so an absent sheet would
//   leave the shell moonlight. The stock branch therefore writes the shell's
//   own token definitions back, with the same !important authority. See STOCK.
//
// WHAT THE PALETTE SWITCH CANNOT REACH
//   ds-bot paints its own components from --bt-* values computed inside its
//   bundle. On "stock" those stay moonlight, so ds-bot's own chrome keeps its
//   colours while the DSH shell around it goes native. Nothing here can fix
//   that; ds-bot would have to be told to follow.
//
// TYPE IS NOT PART OF THE PALETTE SWITCH
//   The rounded stack and the 0.18px stroke apply to both palettes. They are
//   the "lite" part of the package, not a colour.

window.__ModuleLoader__.load({
	id: "dsh-mint-lite",
	factory: (require) => {
		const React = require("react");
		const h = React.createElement;

		const exports = {};
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		// --- Type ----------------------------------------------------------------
		const FONT_ROUNDED =
			'"SF Pro Rounded", ui-rounded, "PingFang SC", -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif';
		const FONT_STOCK =
			'-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif';
		const STROKE = "0.18px";

		// --- The card ------------------------------------------------------------
		// The only place raw colours are written down.
		const MOON = {
			light: {
				bg: "#f7f9fc",
				sidebar: "#eef2f8",
				bubble: "#e5ebf5",
				bubbleHi: "#d8e2f2",
				card: "#ffffff",
				code: "#f1f4fa",
				text: "#121826",
			},
			dark: {
				bg: "#0b1020",
				sidebar: "#10172a",
				bubble: "#1a2340",
				bubbleHi: "#232f52",
				card: "#141c33",
				code: "#141c33",
				text: "#e8edf7",
			},
		};

		/** `rgba()` from a hex colour plus an alpha. */
		const ink = (hex, alpha) => {
			const n = parseInt(hex.slice(1), 16);
			return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + alpha + ")";
		};

		/** Linear mix in sRGB; `t` 0 gives `from`, 1 gives `to`. */
		function mixHex(from, to, t) {
			const a = parseInt(from.slice(1), 16);
			const b = parseInt(to.slice(1), 16);
			const channel = (shift) =>
				Math.round(((a >> shift) & 255) + (((b >> shift) & 255) - ((a >> shift) & 255)) * t);
			return "#" + [16, 8, 0].map((s) => channel(s).toString(16).padStart(2, "0")).join("");
		}

		/**
		 * The palette as two columns of [token, value] pairs. `sidebar` arrives
		 * already mixed, because it depends on the slider.
		 */
		function paletteTokens(sidebar) {
			const column = (M, side) => [
				// --- surfaces
				["--dsw-alias-bg-base", M.bg],
				["--dsw-specific-sidebar-fill", side],
				["--dsw-specific-bubble", M.bubble],
				["--dsw-specific-bubble-highlight", M.bubbleHi],
				["--dsw-alias-bg-layer-1", M.card],
				["--dsw-alias-bg-layer-2", M.card],
				["--dsw-alias-bg-layer-3", M.card],
				["--dsw-alias-bg-module-platform", M.sidebar],
				// Stays on the content step, not `card`: ds-bot writes this token too,
				// and the composer card is where a mismatch between the two shows first.
				["--dsw-specific-input-major", M.bg],
				// --- interactive fills
				["--dsw-alias-interactive-bg-hover", ink(M.text, 0.06)],
				["--dsw-alias-interactive-bg-active", ink(M.text, 0.1)],
				["--dsw-alias-interactive-bg-hover-solid", M.sidebar],
				["--dsw-specific-sidebar-nav-item-hover", ink(M.text, 0.06)],
				["--dsw-specific-sidebar-nav-item-active", M.bubble],
				// --- inks
				["--dsw-alias-label-primary", M.text],
				["--dsw-alias-label-secondary", ink(M.text, 0.74)],
				["--dsw-alias-label-tertiary", ink(M.text, 0.6)],
				// --- borders
				["--dsw-alias-border-l1", ink(M.text, 0.04)],
				["--dsw-alias-border-l2", ink(M.text, 0.1)],
				["--dsw-alias-border-l3", ink(M.text, 0.12)],
				["--dsw-alias-border-l4", ink(M.text, 0.16)],
				// --- code
				["--dsw-alias-markdown-code-block", M.code],
			];
			return { light: column(MOON.light, sidebar.light), dark: column(MOON.dark, sidebar.dark) };
		}

		/**
		 * The shell's own values for the same tokens, per scheme.
		 *
		 * Needed because "stock" cannot simply stop painting: ds-bot's token layer
		 * keeps writing moonlight values into body's inline style, so an absent
		 * sheet would leave the shell moonlight, not stock. Writing the shell's
		 * definitions back with !important is what actually makes the switch work.
		 *
		 * Values reference the shell's own static scale (`--dsw-static-*`) rather
		 * than spelling out hex, so a future palette change in the shell flows
		 * through here for free.
		 */
		const STOCK = {
			light: [
				["--dsw-alias-bg-base", "var(--dsw-static-neutral-bluish-00)"],
				["--dsw-specific-sidebar-fill", "var(--dsw-static-neutral-bluish-50)"],
				["--dsw-specific-bubble", "var(--dsw-static-deepseek-50)"],
				["--dsw-specific-bubble-highlight", "var(--dsw-static-deepseek-200)"],
				["--dsw-alias-bg-layer-1", "var(--dsw-static-neutral-bluish-00)"],
				["--dsw-alias-bg-layer-2", "var(--dsw-static-neutral-bluish-00)"],
				["--dsw-alias-bg-layer-3", "var(--dsw-static-neutral-bluish-00)"],
				["--dsw-alias-bg-module-platform", "var(--dsw-static-neutral-bluish-60)"],
				["--dsw-specific-input-major", "var(--dsw-static-neutral-bluish-00)"],
				["--dsw-alias-interactive-bg-hover", "#2631480f"],
				["--dsw-alias-interactive-bg-active", "#2631481a"],
				["--dsw-alias-interactive-bg-hover-solid", "var(--dsw-static-neutral-bluish-75)"],
				["--dsw-specific-sidebar-nav-item-hover", "var(--dsw-static-neutral-bluish-75)"],
				["--dsw-specific-sidebar-nav-item-active", "var(--dsw-static-neutral-bluish-100)"],
				["--dsw-alias-label-primary", "var(--dsw-static-neutral-bluish-1000)"],
				["--dsw-alias-label-secondary", "var(--dsw-static-neutral-bluish-700)"],
				["--dsw-alias-label-tertiary", "var(--dsw-static-neutral-bluish-600)"],
				["--dsw-alias-border-l1", "#0000000a"],
				["--dsw-alias-border-l2", "#0000001a"],
				["--dsw-alias-border-l3", "#0000001f"],
				["--dsw-alias-border-l4", "#00000029"],
				["--dsw-alias-markdown-code-block", "var(--dsw-static-neutral-bluish-50)"],
			],
			dark: [
				["--dsw-alias-bg-base", "var(--dsw-static-neutral-bluish-950)"],
				["--dsw-specific-sidebar-fill", "var(--dsw-static-neutral-bluish-900)"],
				["--dsw-specific-bubble", "var(--dsw-static-neutral-bluish-850)"],
				["--dsw-specific-bubble-highlight", "var(--dsw-static-neutral-bluish-750)"],
				["--dsw-alias-bg-layer-1", "var(--dsw-static-neutral-bluish-875)"],
				["--dsw-alias-bg-layer-2", "var(--dsw-static-neutral-bluish-850)"],
				["--dsw-alias-bg-layer-3", "var(--dsw-static-neutral-bluish-800)"],
				["--dsw-alias-bg-module-platform", "var(--dsw-static-neutral-bluish-800)"],
				["--dsw-specific-input-major", "var(--dsw-static-neutral-bluish-850)"],
				["--dsw-alias-interactive-bg-hover", "#ffffff14"],
				["--dsw-alias-interactive-bg-active", "#ffffff24"],
				["--dsw-alias-interactive-bg-hover-solid", "var(--dsw-static-neutral-bluish-800)"],
				["--dsw-specific-sidebar-nav-item-hover", "var(--dsw-static-neutral-bluish-850)"],
				["--dsw-specific-sidebar-nav-item-active", "var(--dsw-static-neutral-bluish-750)"],
				["--dsw-alias-label-primary", "var(--dsw-static-neutral-bluish-50)"],
				["--dsw-alias-label-secondary", "var(--dsw-static-neutral-bluish-300)"],
				["--dsw-alias-label-tertiary", "var(--dsw-static-neutral-bluish-400)"],
				["--dsw-alias-border-l1", "#ffffff0f"],
				["--dsw-alias-border-l2", "#ffffff1f"],
				["--dsw-alias-border-l3", "#ffffff29"],
				["--dsw-alias-border-l4", "#fff3"],
				["--dsw-alias-markdown-code-block", "var(--dsw-static-neutral-bluish-900)"],
			],
		};

		// --- Preferences ---------------------------------------------------------
		const PREFS_KEY = "dsh-mint-lite:prefs";
		const DEFAULTS = Object.freeze({ layout: "bubble", palette: "moonlight", sidebarAlpha: 40 });

		function normalize(raw) {
			const value = raw !== null && typeof raw === "object" ? raw : {};
			const alpha = Number(value.sidebarAlpha);
			return {
				layout: value.layout === "flat" ? "flat" : "bubble",
				palette: value.palette === "stock" ? "stock" : "moonlight",
				sidebarAlpha: Number.isFinite(alpha) ? Math.max(0, Math.min(100, Math.round(alpha))) : DEFAULTS.sidebarAlpha,
			};
		}

		function readPrefs() {
			try {
				return normalize(JSON.parse(window.localStorage.getItem(PREFS_KEY) ?? "null"));
			} catch {
				return { ...DEFAULTS };
			}
		}

		let prefs = readPrefs();
		const listeners = new Set();

		/** A fresh object each read, so React sees a new reference. */
		function getPrefs() {
			return { ...prefs };
		}

		function update(patch) {
			prefs = normalize({ ...prefs, ...patch });
			try {
				window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
			} catch {
				// Full or blocked storage: the in-memory value still applies.
			}
			paint();
			for (const listener of listeners) listener(getPrefs());
		}

		function subscribe(listener) {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		}

		// --- Stylesheet ----------------------------------------------------------
		const STYLE_ID = "dsh-mint-lite-theme";

		const declarations = (pairs) =>
			pairs.map(([name, value]) => name + ":" + value + " !important").join(";");

		/**
		 * Palette block. Both branches paint — see the STOCK note: on the stock
		 * palette the shell's own definitions are written back, because otherwise
		 * ds-bot's layer would keep the shell moonlight.
		 */
		function paletteCss(current) {
			if (current.palette === "stock") {
				return [
					"body:not([data-ds-dark-theme]){" + declarations(STOCK.light) + "}",
					"body[data-ds-dark-theme]{" + declarations(STOCK.dark) + "}",
				].join("\n");
			}
			const t = current.sidebarAlpha / 100;
			const tokens = paletteTokens({
				light: mixHex(MOON.light.bg, MOON.light.sidebar, t),
				dark: mixHex(MOON.dark.bg, MOON.dark.sidebar, t),
			});
			return [
				"body:not([data-ds-dark-theme]){" + declarations(tokens.light) + "}",
				"body[data-ds-dark-theme]{" + declarations(tokens.dark) + "}",
			].join("\n");
		}

		/**
		 * Conversation layout: your own messages drop the panel and read as body
		 * text. The colour is reset alongside the background — ds-bot paints white
		 * ink for its dark user bubble, so removing only the background would leave
		 * white text on a light surface.
		 */
		function layoutCss(current) {
			if (current.layout !== "flat") return "";
			return [
				// DSH's own bubbles (ui-chat, ui-goal, ui-user-questions): the hashed
				// class prefixes change between builds, the suffixes do not.
				'body[data-mint-layout="flat"] [class*="_userRow"] [class*="_bubble"],',
				'body[data-mint-layout="flat"] [data-chat-flow-kind="question-reply"] [class*="_bubble"],',
				'body[data-mint-layout="flat"] [data-chat-flow-kind="command-input"] [class*="_bubble"]{',
				"  background:transparent !important;",
				"  border-radius:0 !important;",
				"  padding:0 !important;",
				"  color:var(--dsw-alias-label-primary) !important;",
				"}",
				'body[data-mint-layout="flat"] [class*="_userRow"],',
				'body[data-mint-layout="flat"] [class*="_userStack"]{',
				"  align-items:stretch !important;",
				"  max-width:100% !important;",
				"}",
				// ds-bot paints its own transcript cells from --bt-*.
				'body[data-mint-layout="flat"] .bt-urow{justify-content:flex-start !important}',
				'body[data-mint-layout="flat"] .bt-urow .bt-ububble{',
				"  background:transparent !important;",
				"  border-radius:0 !important;",
				"  padding:0 !important;",
				"  max-width:100% !important;",
				"  color:var(--bt-ink) !important;",
				"}",
				'body[data-mint-layout="flat"] .bt-side-qrow .bt-side-q{',
				"  background:transparent !important;",
				"  border-radius:0 !important;",
				"  padding:0 !important;",
				"  color:var(--bt-ink) !important;",
				"}",
			].join("\n");
		}

		/** Heavier ink: a stroke, because font-weight only jumps 400 -> 500 (+25%). */
		const INK_CSS = [
			"body[data-ds-dark-theme] h1, body[data-ds-dark-theme] h2,",
			"body[data-ds-dark-theme] h3, body[data-ds-dark-theme] h4,",
			"body[data-ds-dark-theme] p, body[data-ds-dark-theme] li,",
			"body[data-ds-dark-theme] td, body[data-ds-dark-theme] th,",
			"body:not([data-ds-dark-theme]) h1, body:not([data-ds-dark-theme]) h2,",
			"body:not([data-ds-dark-theme]) h3, body:not([data-ds-dark-theme]) h4,",
			"body:not([data-ds-dark-theme]) p, body:not([data-ds-dark-theme]) li,",
			"body:not([data-ds-dark-theme]) td, body:not([data-ds-dark-theme]) th {",
			"  -webkit-text-stroke-width:" + STROKE + ";",
			"  -webkit-text-stroke-color:currentColor;",
			"  paint-order:stroke fill;",
			"}",
		].join("\n");

		/** Settings row chrome, matched to the shell's own rows. */
		const ROW_CSS = [
			".dml-row{border-bottom:.5px solid var(--dsw-alias-border-l2);justify-content:space-between;align-items:center;gap:24px;padding:16px 0;display:flex}",
			".dml-text{min-width:0}",
			".dml-title{color:var(--dsw-alias-label-primary);font-size:14px;line-height:20px}",
			".dml-desc{color:var(--dsw-alias-label-secondary);margin-top:4px;font-size:12px;line-height:18px}",
			".dml-control{flex:none;align-items:center;gap:10px;display:flex}",
			".dml-slider{accent-color:var(--dsw-alias-state-business-primary);cursor:pointer;width:150px}",
			".dml-slider:disabled{cursor:default;opacity:.4}",
			".dml-value{color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;font-size:12px;text-align:right;min-width:34px}",
			".dml-fallback{border:1px solid var(--dsw-alias-border-l3);border-radius:6px;padding:4px 10px;font:inherit;color:var(--dsw-alias-label-primary);background:transparent;cursor:pointer}",
			".dml-fallback[aria-pressed=true]{background:var(--dsw-alias-interactive-bg-active)}",
			// The shell removes the hairline from a slot item's last child only, and
			// the item here is our wrapper; without this the last row keeps one.
			".dml-wrap>.dml-row:last-child{border-bottom:none}",
		].join("\n");

		/**
		 * The next block is concatenated after one that ends in `}`, so a newline is
		 * required for legibility only — `}body{` is valid CSS but unreadable.
		 */
		const styleSheet = (current) =>
			[paletteCss(current), layoutCss(current), INK_CSS, ROW_CSS].filter((part) => part !== "").join("\n");

		let styleElement = null;

		/** Recompute the sheet and the body attribute from `prefs`. */
		function paint() {
			if (typeof document === "undefined" || styleElement === null) return;
			styleElement.textContent = styleSheet(prefs);
			if (document.body === null) return;
			if (prefs.layout === "flat") document.body.dataset.mintLayout = "flat";
			else delete document.body.dataset.mintLayout;
		}

		// --- Settings row --------------------------------------------------------
		const NS = "settings.mintLite";

		const TEXT = {
			zh: {
				layout: "消息形态",
				layoutDesc: "你自己的消息显示为气泡，还是铺成正文。",
				layoutBubble: "气泡",
				layoutFlat: "会话",
				palette: "配色",
				paletteDesc: "这套月光配色，或回到 DeepSeek Harness 原生。",
				paletteMoon: "月光",
				paletteStock: "原生",
				alpha: "侧栏浓度",
				alphaDesc: "侧栏颜色相对内容区拉开多少；0 时两栏同色。",
				alphaOff: "（原生配色下不生效）",
			},
			en: {
				layout: "Message shape",
				layoutDesc: "Show your own messages as a bubble, or as body text.",
				layoutBubble: "Bubble",
				layoutFlat: "Conversation",
				palette: "Palette",
				paletteDesc: "This moonlight palette, or stock DeepSeek Harness.",
				paletteMoon: "Moonlight",
				paletteStock: "Stock",
				alpha: "Sidebar strength",
				alphaDesc: "How far the sidebar colour sits from the content area; 0 makes them match.",
				alphaOff: " (not applied on the stock palette)",
			},
		};

		/**
		 * Resolved once. A missing primitives module must not take the plugin
		 * down, so the row falls back to plain buttons that speak the same
		 * { value, options, onChange } contract.
		 */
		const segmented = (() => {
			try {
				const primitives = require("@deepseek-ai/dsh-client-ui-primitives");
				if (typeof primitives?.SegmentedControl === "function") return primitives.SegmentedControl;
			} catch {
				// Fall through to the local control.
			}
			return function FallbackSegmented(props) {
				return h(
					"div",
					{ className: "dml-control", role: "group", "aria-label": props.label },
					props.options.map((option) =>
						h(
							"button",
							{
								key: option.value,
								type: "button",
								className: "dml-fallback",
								"aria-pressed": option.value === props.value,
								onClick: () => props.onChange(option.value),
							},
							option.label
						)
					)
				);
			};
		})();

		/** One labelled row: title + description on the left, control on the right. */
		function Row({ title, description, children }) {
			return h("div", { className: "dml-row" }, [
				h("div", { className: "dml-text", key: "text" }, [
					h("div", { className: "dml-title", key: "title" }, title),
					h("div", { className: "dml-desc", key: "desc" }, description),
				]),
				h("div", { className: "dml-control", key: "control" }, children),
			]);
		}

		/**
		 * The three controls. State comes from the module-level preference store
		 * rather than a slot store: the row and the stylesheet must agree on the
		 * same value, and a single subscription is enough for both.
		 */
		function ThemeRow(props) {
			const t = props.t;
			const [state, setState] = React.useState(getPrefs);

			React.useEffect(() => subscribe(setState), []);

			return h("div", { className: "dml-wrap" }, [
				h(Row, {
					key: "layout",
					title: t("layout"),
					description: t("layoutDesc"),
					children: h(segmented, {
						id: "dsh-mint-lite-layout",
						label: t("layout"),
						value: state.layout,
						options: [
							{ value: "bubble", label: t("layoutBubble") },
							{ value: "flat", label: t("layoutFlat") },
						],
						onChange: (next) => update({ layout: next }),
					}),
				}),
				h(Row, {
					key: "palette",
					title: t("palette"),
					description: t("paletteDesc"),
					children: h(segmented, {
						id: "dsh-mint-lite-palette",
						label: t("palette"),
						value: state.palette,
						options: [
							{ value: "moonlight", label: t("paletteMoon") },
							{ value: "stock", label: t("paletteStock") },
						],
						onChange: (next) => update({ palette: next }),
					}),
				}),
				h(Row, {
					key: "alpha",
					title: t("alpha"),
					description: t("alphaDesc") + (state.palette === "stock" ? t("alphaOff") : ""),
					children: [
						h("input", {
							key: "range",
							className: "dml-slider",
							type: "range",
							min: 0,
							max: 100,
							step: 5,
							value: state.sidebarAlpha,
							disabled: state.palette === "stock",
							"aria-label": t("alpha"),
							onChange: (event) => update({ sidebarAlpha: Number(event.target.value) }),
						}),
						h("output", { key: "out", className: "dml-value" }, state.sidebarAlpha + "%"),
					],
				}),
			]);
		}

		// --- Plugin --------------------------------------------------------------
		const inject = ["theme", "slots", "locale"];

		function apply(ctx) {
			// The sheet is created once and rewritten in place: no observer, no timer.
			ctx.effect(() => {
				const element = document.createElement("style");
				element.id = STYLE_ID;
				document.head.appendChild(element);
				styleElement = element;
				const unsubscribe = subscribe(paint);
				paint();
				return () => {
					unsubscribe();
					styleElement = null;
					element.remove();
					if (document.body !== null) delete document.body.dataset.mintLayout;
				};
			}, "dsh-mint-lite: theme sheet");

			// Type stays on the token layer so ui-theme's font settings keep working:
			// an !important font here would make those settings inert.
			ctx.effect(
				() =>
					ctx.theme.overrideTokens("dsh-mint-lite:tokens", {
						"--dsh-font-family-text-default": { light: FONT_ROUNDED, dark: FONT_STOCK },
					}),
				"dsh-mint-lite: type layer"
			);

			ctx.effect(
				() =>
					ctx.locale.register(NS, {
						zh: TEXT.zh,
						en: TEXT.en,
					}),
				"dsh-mint-lite: row copy"
			);

			ctx.slots.inject("settings.general.item", () =>
				ctx.slots.register(
					{
						name: "settings.general.item",
						id: "mint-lite",
						order: 12,
						locale: NS,
					},
					ThemeRow
				)
			);
		}

		exports.inject = inject;
		exports.apply = apply;
		return exports;
	},
});
