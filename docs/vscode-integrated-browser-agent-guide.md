# Interacting with the VS Code integrated browser

This guide records a workflow verified on macOS on 12 September 2026. An agent
used `mcp__cua_repl.js` to control the running VS Code app, navigate its integrated
browser, upload a repository image, and inspect the formatted and raw results.
Read [AGENTS.md](../AGENTS.md) first. It remains the source of repository rules.

## Why this works

The computer-use tool exposes native app controls through an accessibility tree
and screenshots. In this session, VS Code exposed both the browser toolbar and
the rendered webpage in that tree. The agent could click the address field,
type a URL, select a file through the macOS file dialog, and click page controls.

This used the running VS Code app through `cua.getApp`, not a DevTools connection
to the integrated browser. The separately available `edge_devtools` MCP returned
an `about:blank` page. That did not establish access to the VS Code browser.

Tool availability depends on the agent session. Another LLM needs an equivalent
computer-use tool with access to VS Code. Reading this guide does not grant that
access. Prefer dedicated VS Code browser tools when available, as AGENTS.md
requires. If the existing browser cannot be accessed, ask the user to open or
share it. Do not launch a standalone browser as a workaround.

## Discover the app

The examples below are JavaScript inputs to `mcp__cua_repl.js`. They are not shell
commands, page-console scripts, or Playwright scripts. Read the tool's current
documentation before using them.

On the first call, or after resetting the session, make exactly one entry-point
call. To discover available surfaces:

```js
await cua.getState()
```

The returned app inventory included `Code`, with bundle identifier
`com.microsoft.VSCode`. In a subsequent call:

```js
let codeApp = await cua.getApp('com.microsoft.VSCode')
```

This returns the initial accessibility tree. The `codeApp` binding persists
between calls until the computer-use session resets. If the app is already
known, `cua.getApp` can be the first entry-point call instead of inventorying
every surface.

## Read state before acting

```js
await codeApp.getAXState()
```

Look for the intended browser tab, a text field with description `Address`,
and an `HTML content` node whose URL matches the target page. The VS Code
workbench, terminal, chat panel, and embedded webpage can all appear in the same
tree. Check which surface a control belongs to before clicking it.

The numbers next to controls are temporary element indices. They can change
after navigation, interaction, or a fresh full snapshot. Never reuse indices
from this guide or another session. Variables such as `addressIndex` below mean
an index selected from the latest observation.

For a full tree instead of the default incremental diff:

```js
await codeApp.getAXState({ disableDiffing: true })
```

For visual inspection:

```js
await codeApp.getScreenshot()
```

These observation methods display their results automatically. Do not wrap
them in another image emitter. After a screenshot-only observation, refresh the
full accessibility tree before relying on element indices again.

## Navigate the existing integrated browser

Select the address field index from the current tree. Then, in one call:

```js
await codeApp.click(addressIndex)
await codeApp.pressKey('super+a')
await codeApp.typeText('http://localhost:8787/en-US/labs/dominant-color')
await codeApp.pressKey('Return')
await codeApp.getAXState()
```

On macOS, `super` represents Command. Verify the resulting page URL and content.
The address field changing alone does not prove navigation completed. In the
observed session, the first tree after navigation still contained the previous
page, while the following screenshot showed the new route.

Use the tool's built-in observation waits. Avoid fixed sleeps. If the tree is
unchanged but relevant content is missing, inspect a screenshot or request a full
tree rather than repeatedly polling the same incremental state.

## Interact with page controls

Choose current element indices and inspect the state after each action batch:

```js
await codeApp.click(extractButtonIndex)
await codeApp.getAXState()
```

```js
await codeApp.click(rawJsonTabIndex)
await codeApp.getAXState()
```

Confirm the selected tab changes and the expected output becomes visible. Test
keyboard behavior independently. A successful click does not establish keyboard
accessibility. For example, while a tab has focus:

```js
await codeApp.pressKey('Left')
await codeApp.getAXState()
```

Use `scroll` to reveal content. A coordinate target must come from a current
screenshot, and the scroll direction should apply to the intended page or inner
output panel. Refresh state afterward. Prefer accessibility indices for clicks
when the relevant control is exposed.

## Upload a repository fixture

Click the upload control in the webpage, then inspect the resulting native file
dialog. The tested flow selected `docs/sunset.jpg` from this repository.

With the macOS Open dialog active:

```js
await codeApp.pressKey('super+shift+g')
await codeApp.typeText('/Users/rongsen/motss/test-hono-react-router-vite/docs/sunset.jpg')
await codeApp.pressKey('Return')
await codeApp.getAXState()
```

Confirm the intended file is selected and the Open button is enabled. Click the
Open button using its current index, then inspect the webpage for the filename
and preview before submitting the analysis. Use task-authorized fixtures and
destinations. Do not select unrelated personal files.

## Handle user activity and errors

If the tool reports that the user changed VS Code, discard the pending action
and refresh state through `codeApp.getAXState()`. Do not retry a stale click.
Avoid interrupting the user's typing or changing focus repeatedly.

A Vite error overlay can cover otherwise loaded page content. Record the error
before dismissing it. When appropriate, focus the browser and press Escape,
then inspect the recovered page. Dismissing an overlay does not fix its cause
or make a failed verification pass.

Never click a sharing or permission control merely because it appears in the
tree. Follow the current tool's permission policy and ask the user when required.
This session could inspect and operate the page without toggling Share with Agent.

## Report evidence accurately

Record the route, fixture, interactions, visible results, and limitations. The
observed workflow verified upload, extraction, formatted color rows, and the Raw
JSON toggle. It also exposed missing arrow-key navigation in the output tabs.

Native app screenshots include surrounding VS Code UI. Inspect them for layout,
but avoid publishing unrelated editor or chat content. A displayed screenshot
does not imply a screenshot file was saved.

Manual browser inspection is separate from automated VRT. It does not prove that
`deno task test:visual` passed or that fresh files exist under `__screenshots__/`.
Resolve any conflict between the current VRT runner and AGENTS.md's browser
restrictions before running it. Report blocked checks explicitly.
