# Stella Wiki

A direct, practical guide to actually building with Stella. If you want the philosophy behind these decisions, read the [README](./README.md#design-language) first — this doc assumes you already know what a "grade" is and just want to know what to type.

**Contents**

1. [Buttons & ButtonIsland](#buttons--buttonisland)
2. [SettingsMenu](#settingsmenu)
3. [Every other component](#every-other-component)
4. [Writing new components](#writing-new-components)
5. [Overlay & notification hooks](#overlay--notification-hooks)

---

## Buttons & ButtonIsland

**The rule: a `Button` never renders on its own. It always goes inside a `ButtonIsland`.** `Button` has no border, background, or radius of its own — all of that comes from the `ButtonIsland` wrapping it. A bare `<Button>` outside an island will look broken, because it is.

### `Button` props

| Prop                           | Type                                  | Default     | What it does                                                                                    |
| ------------------------------ | ------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------- |
| `size`                         | `'xs' \| 'sm' \| 'md' \| 'lg'`        | `'md'`      | Usually left unset — `ButtonIsland` sets this on every button it wraps.                         |
| `grade`                        | `'global' \| 'default' \| 'elevated'` | `'default'` | Usually left unset for the same reason — the island sets it.                                    |
| `active`                       | `boolean`                             | `false`     | Marks the button as "currently picked" (a selection row, a tab, a toggle).                      |
| `loading`                      | `boolean`                             | `false`     | Shows a spinner in place of the icon, disables the button, sets `aria-busy`.                    |
| `leadingIcon` / `trailingIcon` | `ReactNode`                           | —           | Icon before/after the label.                                                                    |
| `iconOnly`                     | `boolean`                             | `false`     | Renders as a square icon button. Uses `children` or `leadingIcon` as the icon, hides any label. |

Plus every normal `<button>` attribute — `onClick`, `disabled`, `type`, `aria-label`, etc.

### `ButtonIsland` props

| Prop          | Type                                  | Default        | What it does                                                                                                    |
| ------------- | ------------------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------- |
| `size`        | `'xs' \| 'sm' \| 'md' \| 'lg'`        | `'md'`         | Cascades to every `Button` child automatically — you don't set size on the buttons themselves.                  |
| `grade`       | `'global' \| 'default' \| 'elevated'` | auto-resolved  | Cascades to every `Button` child. Leave it unset and it escalates one step above wherever the island is nested. |
| `orientation` | `'horizontal' \| 'vertical'`          | `'horizontal'` | `'vertical'` turns the island into a sidebar-style stack instead of a toolbar row.                              |
| `floating`    | `boolean`                             | `false`        | A lighter visual treatment used for menus/popovers/dialog headers — you rarely need this yourself.              |

`ButtonIsland` also accepts `FlexContainer` layout props (`gap`, `align`, `justify`, `wrap`) since it lays its children out in one internally.

### Structure

A `ButtonIsland` is an `Island` (pill or panel, depending on orientation) wrapping a `FlexContainer` of your children. Only `Button` children are touched — their `size`/`grade` get overwritten to match the island's; anything else passes through untouched. The hairline that appears between two adjacent buttons is pure CSS (a shared-border trick using `:has()`) — you never add it yourself.

For an **explicit break** between two logical clusters inside one island, drop a plain `<Divider />` between them. The island's CSS recognizes it and adjusts the spacing/borders around it on both sides — you don't need anything fancier than that.

### Examples

A basic toolbar:

```tsx
<ButtonIsland>
	<Button leadingIcon={<SaveIcon />}>Save</Button>
	<Button>Cancel</Button>
</ButtonIsland>
```

An icon-only action cluster:

```tsx
<ButtonIsland size="sm">
	<Button iconOnly aria-label="Bold">
		<BoldIcon />
	</Button>
	<Button iconOnly aria-label="Italic">
		<ItalicIcon />
	</Button>
</ButtonIsland>
```

A selection row (segmented control) — `active` does the highlighting, you do the state:

```tsx
<ButtonIsland>
	<Button active={view === "grid"} onClick={() => setView("grid")}>
		Grid
	</Button>
	<Button active={view === "list"} onClick={() => setView("list")}>
		List
	</Button>
</ButtonIsland>
```

A vertical sidebar, with an explicit break before "Sign out":

```tsx
<ButtonIsland orientation="vertical" size="lg">
	<Button leadingIcon={<HomeIcon />}>Home</Button>
	<Button leadingIcon={<SettingsIcon />}>Settings</Button>
	<Divider />
	<Button leadingIcon={<LogOutIcon />}>Sign out</Button>
</ButtonIsland>
```

A context menu, a segmented switcher, an icon toolbar in a title bar — they're all this same pairing. `Menu` is literally built out of `ButtonIsland` + `Button` internally; you're using the same primitive it uses.

---

## SettingsMenu

`SettingsMenu` itself doesn't manage being open or closed — it's just a nav-plus-fields panel. To make it dismissable, put it inside a `Dialog` yourself.

### 1. Build a schema

A schema is a list of categories, each with a list of fields. Three field types: `text`, `boolean`, `choice`.

```tsx
import type { SettingsSchema } from "@stella-componente/terra";

const schema: SettingsSchema = {
	categories: [
		{
			id: "general",
			label: "General",
			icon: <GearIcon />,
			fields: [
				{
					key: "displayName",
					type: "text",
					label: "Display name",
					placeholder: "Jane Doe",
				},
				{
					key: "autoSave",
					type: "boolean",
					label: "Auto-save",
					description: "Save changes as you type",
				},
				{
					key: "startupView",
					type: "choice",
					label: "Startup view",
					control: "segmented", // or 'radio'
					options: [
						{ value: "home", label: "Home" },
						{ value: "last", label: "Last opened" },
					],
				},
			],
		},
	],
};
```

### 2. Track values, handle changes

`values` is `{ [categoryId]: { [fieldKey]: value } }`. `onChange` fires with `(categoryId, fieldKey, value)`.

```tsx
const [generalValues, setGeneralValues] = useState({
	displayName: "",
	autoSave: true,
	startupView: "home",
});

const handleChange = (
	categoryId: string,
	key: string,
	value: string | boolean
) => {
	setGeneralValues((prev) => ({ ...prev, [key]: value }));
};
```

### 3. Add the built-in Appearance category (optional)

Stella ships a ready-made "Appearance" category wired straight to `ThemeManager`. It plugs into the same schema/values/onChange plumbing as your own categories — the twist is that its values come from live theme state, not your own component state.

```tsx
import {
	appearanceSettingsCategory,
	getAppearanceValues,
	applyAppearanceChange,
	useTheme,
} from "@stella-componente/terra";

const theme = useTheme();

const schema: SettingsSchema = {
	categories: [generalCategory, appearanceSettingsCategory],
};

const values = {
	general: generalValues,
	appearance: getAppearanceValues(theme.config),
};

const handleChange = (
	categoryId: string,
	key: string,
	value: string | boolean
) => {
	if (categoryId === "appearance") {
		applyAppearanceChange(theme, key, value);
		return;
	}
	setGeneralValues((prev) => ({ ...prev, [key]: value }));
};
```

### 4. Make it dismissable with `Dialog`

`Dialog.Header` adds its own close button automatically as soon as you pass `onClose` to `Dialog` — you don't add one yourself.

```tsx
const [open, setOpen] = useState(false);

<Dialog open={open} onClose={() => setOpen(false)} size="lg">
	<Dialog.Header>
		<Dialog.Title>Settings</Dialog.Title>
	</Dialog.Header>
	<Dialog.Body>
		<SettingsMenu schema={schema} values={values} onChange={handleChange} />
	</Dialog.Body>
</Dialog>;
```

That's the whole pattern: schema describes the fields, `values`/`onChange` is a plain controlled-component loop, and `Dialog` is what makes the whole thing dismissable.

---

## Every other component

Short reference for everything not covered above. One snippet, one or two sentences, next.

### Atoms

**Avatar** — circular image with an initials or icon fallback.

```tsx
<Avatar src={user.photoUrl} initials="JD" size="md" />
```

**Badge** — a small, non-interactive status label.

```tsx
<Badge color="success" variant="tinted">
	Active
</Badge>
```

**Checkbox** — native checkbox, with an `indeterminate` state.

```tsx
<Checkbox
	label="Remember me"
	checked={remember}
	onChange={(e) => setRemember(e.target.checked)}
/>
```

**Code** — inline code with click-to-copy. Needs a `NotificationProvider` ancestor for the copy toast.

```tsx
<Code>pnpm install</Code>
```

**Divider** — a separator line, horizontal or vertical.

```tsx
<Divider orientation="vertical" />
```

**Icon** — sizes and colors whatever icon element you hand it.

```tsx
<Icon size="lg">
	<MyIcon />
</Icon>
```

**Input** — text field, with optional label, icons, and error state.

```tsx
<Input label="Email" leadingIcon={<MailIcon />} error={hasError} />
```

**Island** — the base surface. Nearly everything else is built on it.

```tsx
<Island shape="panel" grade="elevated" padding="4">
	…
</Island>
```

**Kbd** — inline keyboard-shortcut label.

```tsx
<Kbd>⌘K</Kbd>
```

**Link** — anchor wrapper; `external` sets `target`/`rel` safely.

```tsx
<Link href="https://example.com" external>
	Docs
</Link>
```

**Progress** — a determinate progress bar.

```tsx
<Progress value={40} max={100} />
```

**Radio** — native radio input; normally used inside `RadioGroup`.

```tsx
<Radio name="plan" value="pro" label="Pro" />
```

**Skeleton** — a shimmering loading placeholder.

```tsx
<Skeleton variant="circular" width={40} height={40} />
```

**Slider** — a range input with a live, editable value readout.

```tsx
<Slider label="Volume" value={volume} onValueChange={setVolume} showValue />
```

**Spinner** — indeterminate loading indicator.

```tsx
<Spinner size="sm" />
```

**Switch** — a GTK-style toggle.

```tsx
<Switch checked={notify} onCheckedChange={setNotify} label="Notifications" />
```

**Text** — the typography primitive. Everything that renders text should go through this.

```tsx
<Text variant="title-2" as="h2">
	Heading
</Text>
```

**Textarea** — native textarea with optional auto-grow.

```tsx
<Textarea label="Notes" autoGrow maxRows={6} />
```

### Layout

**FlexContainer** — the one-dimensional layout primitive everything composes with.

```tsx
<FlexContainer direction="column" gap="4" align="stretch">
	…
</FlexContainer>
```

**ScrollArea** — a styled scroll container, with an option to hide the scrollbar chrome.

```tsx
<ScrollArea axis="vertical" grow padding="4">
	…
</ScrollArea>
```

### Molecules

**Alert** — an inline status banner, optionally dismissible.

```tsx
<Alert variant="warning" title="Heads up" onDismiss={() => setShow(false)}>
	Your session expires soon.
</Alert>
```

**Breadcrumbs** — a nav trail; the last item is marked current automatically.

```tsx
<Breadcrumbs>
	<Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
	<Breadcrumbs.Item href="/settings">Settings</Breadcrumbs.Item>
	<Breadcrumbs.Item>Profile</Breadcrumbs.Item>
</Breadcrumbs>
```

**Card** — an `Island`-based content box with `Header`/`Title`/`Description`/`Body`/`Footer`. Pass `nested` so a card inside a card auto-escalates its grade.

```tsx
<Card>
	<Card.Header>
		<Card.Title>Plan</Card.Title>
	</Card.Header>
	<Card.Body>You're on the Pro plan.</Card.Body>
</Card>
```

**CheckboxGroup** — a fieldset of checkboxes sharing one value array.

```tsx
<CheckboxGroup
	legend="Notify me about"
	value={topics}
	onValueChange={setTopics}
>
	<Checkbox value="billing" label="Billing" />
	<Checkbox value="security" label="Security" />
</CheckboxGroup>
```

**Field** — wraps one form control with a hint or error message.

```tsx
<Field hint="We'll never share this" error={emailError}>
	<Input label="Email" />
</Field>
```

**Notification** — the toast card. You'll almost always reach for `useNotifications()` instead of rendering this directly — see [Overlay & notification hooks](#overlay--notification-hooks).

**RadioGroup** — a fieldset of radios sharing one value.

```tsx
<RadioGroup legend="Plan" value={plan} onValueChange={setPlan}>
	<Radio value="free" label="Free" />
	<Radio value="pro" label="Pro" />
</RadioGroup>
```

**SearchField** — an `Input` preset with a search icon, clear button, and loading state.

```tsx
<SearchField
	placeholder="Search…"
	onValueChange={setQuery}
	loading={isSearching}
/>
```

**Select** — a custom dropdown built on `Menu`, for when native `<select>` styling isn't enough.

```tsx
<Select label="Country" value={country} onValueChange={setCountry}>
	<Select.Option value="us">United States</Select.Option>
	<Select.Option value="ca">Canada</Select.Option>
</Select>
```

**Tooltip** — wraps exactly one child element and labels it on hover/focus.

```tsx
<Tooltip label="Save">
	<Button iconOnly aria-label="Save">
		<SaveIcon />
	</Button>
</Tooltip>
```

**WindowControls** — minimize/maximize/close cluster for a custom title bar.

```tsx
<WindowControls controls={{ minimize, maximize, close, maximized }} />
```

### Organisms

**Dialog** — modal, compound, focus-trapped.

```tsx
<Dialog open={open} onClose={() => setOpen(false)}>
	<Dialog.Header>
		<Dialog.Title>Delete item?</Dialog.Title>
	</Dialog.Header>
	<Dialog.Body>This can't be undone.</Dialog.Body>
	<Dialog.Footer>
		<ButtonIsland>
			<Button onClick={() => setOpen(false)}>Cancel</Button>
			<Button onClick={confirmDelete}>Delete</Button>
		</ButtonIsland>
	</Dialog.Footer>
</Dialog>
```

**EmptyState** — a centered placeholder for an empty list or view.

```tsx
<EmptyState
	icon={<InboxIcon />}
	title="No messages"
	description="You're all caught up."
>
	<Button>Refresh</Button>
</EmptyState>
```

**List** — a keyboard-navigable, single-select list.

```tsx
<List value={selected} onValueChange={setSelected}>
	<List.Item value="a">Item A</List.Item>
	<List.Item value="b">Item B</List.Item>
</List>
```

**Menu** — an anchored dropdown or context menu. It needs a real DOM element to anchor to — a state-based ref callback is the safe way to get one (see the note in [Overlay & notification hooks](#overlay--notification-hooks) about why not a plain `useRef`).

```tsx
const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
const [open, setOpen] = useState(false);

<Button ref={setAnchorEl} onClick={() => setOpen(true)}>Options</Button>
<Menu open={open} onClose={() => setOpen(false)} anchor={anchorEl}>
	<Menu.Item onSelect={rename}>Rename</Menu.Item>
	<Menu.Item onSelect={duplicate}>Duplicate</Menu.Item>
	<Menu.Separator />
	<Menu.Item destructive onSelect={remove}>Delete</Menu.Item>
</Menu>
```

**Popover** — anchored floating content, same anchoring mechanics as `Menu`, no menu semantics.

```tsx
<Popover open={open} onClose={() => setOpen(false)} anchor={anchorEl}>
	<Text>Any content you want.</Text>
</Popover>
```

**WindowChrome** — a runtime-agnostic custom title bar.

```tsx
<WindowChrome
	icon={<AppIcon />}
	title="My App"
	tools={
		<Button iconOnly aria-label="Search">
			<SearchIcon />
		</Button>
	}
	windowControls={{ minimize, maximize, close, maximized }}
/>
```

---

## Writing new components

Stella's set won't cover everything. Adding your own is meant to be easy — you're using the same building blocks Stella's own components use.

**1. File shape.** Same as every Stella component:

```
Component/
├─ Component.tsx
├─ Component.module.css
└─ index.ts
```

**2. Load the tokens once.** As long as `@stella-componente/terra/styles/tokens.css` is imported somewhere at your app's entry (same as any Stella consumer), every `--stella-*` custom property is available in your own `.module.css` files.

**3. Sizing.** Use the same five-step scale everything else uses — don't invent your own pixel values.

```css
.sm {
	min-height: var(--stella-size-sm);
}
.md {
	min-height: var(--stella-size-md);
}
```

`--stella-size-xs` (24px) → `--stella-size-xl` (52px).

**4. Grade.** Set `data-stella-grade="global" | "default" | "elevated"` on your root element to opt into the nesting system. Inside your CSS, read colors through the _grade-indirected_ tokens — `var(--stella-g-surface-0)`, `var(--stella-g-border-0)`, and so on — never the raw numbered scale (`--stella-surface-3`, `--stella-border-5`) directly. The indirected tokens are what remap automatically depending on the active `data-stella-grade`, which is the entire mechanism that makes elevation "just work" without your component needing to know what it's nested inside.

```tsx
function MyPanel({
	grade = "default",
	children,
}: {
	grade?: Grade;
	children?: React.ReactNode;
}) {
	return (
		<div data-stella-grade={grade} className={styles.panel}>
			{children}
		</div>
	);
}
```

```css
.panel {
	background: var(--stella-g-surface-0);
	border: 1px solid var(--stella-g-border-0);
}
```

If you want a nested instance to auto-escalate one grade above its parent (the way `Island` and `Card` do), resolve it yourself rather than hardcoding a value — accept an optional `parentGrade` prop and fall back to it when `grade` isn't explicitly set.

**5. Stamp a component hook.** Terra's own components set `data-stella-component="button"`-style attributes on their root node. It costs nothing and gives you (or anyone debugging later) a reliable hook for style overrides or end-to-end tests that doesn't depend on class names surviving a refactor.

**6. Follow the design language.** No bare buttons outside `ButtonIsland`, no more than three grades deep, controls separated from data via islands. See the [README's Design Language section](./README.md#design-language) if you haven't already.

---

## Overlay & notification hooks

Stella's overlay-type components (`Dialog`, `Menu`, `Popover`, `Tooltip`) all share the same two pieces of infrastructure instead of each reinventing stacking and dismissal.

### `OverlayProvider` / `useOverlayLayer`

Wrap your app once:

```tsx
<OverlayProvider>
	<App />
</OverlayProvider>
```

`OverlayProvider` creates one shared portal root and tracks which open overlay is topmost. `useOverlayLayer({ open, onClose })` is what an overlay-type component calls to register itself in that stack:

```tsx
const { root, topmost } = useOverlayLayer({ open, onClose: handleClose });
```

- `root` — the DOM node to portal your content into.
- `topmost` — true only for the most-recently-opened overlay. Escape closes only the topmost one, so a `Popover` opened from inside a `Dialog` doesn't also close the `Dialog` behind it.

You'll only reach for `useOverlayLayer` directly if you're building your own overlay-shaped component (Terra's `Tooltip` does exactly this). For an anchored, positioned overlay specifically (a dropdown, a popover), reach for `useDismissableOverlay` instead — it wraps `useOverlayLayer` together with `useAnchorPosition` (positioning math) and `useClickOutside` (click-away dismissal), which is what `Menu`, `Popover`, and `Select` are actually built on.

```tsx
const { root, panelRef, style, requestClose } = useDismissableOverlay({
	open,
	onClose,
	anchor: anchorEl, // an HTMLElement, not a ref object
	placement: "bottom-start",
});
```

A quick note on `anchor`: it wants a real `HTMLElement`, not a React ref object. The reliable way to get one is a state-based ref callback (`const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)`, then `<Button ref={setAnchorEl}>`) rather than a plain `useRef().current` read during render — the latter can be `null` on the very first render before the DOM node exists.

### `NotificationProvider` / `useNotifications`

Wrap your app once (usually right alongside `OverlayProvider`):

```tsx
<NotificationProvider>
	<App />
</NotificationProvider>
```

Then anywhere inside it:

```tsx
const notify = useNotifications();

notify.success("Saved.");
notify.error("Something went wrong.", { duration: 8000 });
const id = notify.info("Uploading…", { duration: 0 }); // 0 = stays until dismissed
notify.dismiss(id);
```

Five variants: `success`, `warning`, `error`, `info`, `debug`. Each returns an id you can pass to `dismiss()` early. Toasts auto-dismiss after 5 seconds by default, pause while hovered, and announce via `aria-live="polite"`. This is also what `Code`'s click-to-copy feedback uses under the hood — it's why `Code` needs a `NotificationProvider` ancestor to work.
