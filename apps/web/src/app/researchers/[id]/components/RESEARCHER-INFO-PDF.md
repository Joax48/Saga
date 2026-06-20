# Researcher info PDF

Client-side PDF download of the full researcher profile. No server involved — the file is generated and downloaded entirely in the browser.

## Files

- `components/ResearcherInfoDocument.tsx` — PDF document definition (layout, styles, sections).
- `components/DownloadInfoButton.tsx` — button that triggers generation and download.
- `page.tsx` — imports `DownloadInfoButton` via `dynamic(..., { ssr: false })` and renders it below the metrics panel.

## How it works

1. The user clicks **Descargar info**.
2. `DownloadInfoButton` fetches the profile photo and converts it to a base64 data URL (`toBase64`). If the fetch fails (no connection, CORS), it falls back to a generated avatar from `ui-avatars.com`.
3. It calls `pdf(<ResearcherInfoDocument ... />).toBlob()` from `@react-pdf/renderer`, which builds the PDF in a Web Worker and returns a `Blob`.
4. A temporary `<a>` is created with `URL.createObjectURL(blob)`, clicked programmatically, and immediately revoked to free memory.

Generation happens only on click — not on page load — so users who never download do not pay any cost.

## Why these decisions

**`pdf().toBlob()` over `usePDF`**
`usePDF` starts building on component mount. Since most visitors do not download, pre-generating wastes CPU and memory for every page view. `pdf().toBlob()` runs only when needed.

**Base64 photo over direct URL**
`@react-pdf/renderer` fetches images inside a Web Worker using its own `fetch` call, which is subject to stricter CORS rules. Pre-fetching in the React component (same-origin context) and passing the result as a data URL avoids this entirely.

**Helvetica over custom fonts**
`@react-pdf/renderer` fetches font files via `fetch` (also inside the Worker). External font services either returned 404 for the required TTF format or had CORS restrictions. Helvetica and Helvetica-Bold are ISO 32000 standard fonts embedded in every PDF viewer — no network request needed, and they cover the full Latin/Spanish character set.

**`dynamic(..., { ssr: false })`**
`@react-pdf/renderer` uses browser-only APIs (`Blob`, `URL.createObjectURL`). It cannot run during Next.js server-side rendering, so the button component must be loaded client-side only.

## Adjusting colors and typography

All visual constants are at the top of `ResearcherInfoDocument.tsx`:

```ts
const BRAND  = '#0D8ABC'; // headings, links, tags, badge background
const DARK   = '#1f2937'; // body text, researcher name
const MUTED  = '#6b7280'; // secondary text, bullets, footer
const BORDER = '#e5e7eb'; // section dividers
const TAG_BG = '#f0f9ff'; // keyword tag background
```

All styles are in the `s = StyleSheet.create({...})` object immediately below. `@react-pdf/renderer` uses a React Native-like subset of CSS — `flexDirection`, `marginBottom`, `paddingHorizontal`, etc. There is no cascade or inheritance; every element needs its own style.

Base font size is `10` (set on `page`). Section titles use `9` with `textTransform: 'uppercase'` and `letterSpacing: 1.2`. The researcher name uses `18`.

## Adding or removing sections

Each section in `ResearcherInfoDocument.tsx` follows this pattern:

```tsx
{profile.someField.length > 0 && (
  <View style={s.section}>
    <Text style={s.sectionTitle}>Section Title</Text>
    {profile.someField.map((item, idx) => (
      <View key={idx} style={s.row}>
        <Text style={s.bullet}>• </Text>
        <Text style={s.itemMain}>{item.name}</Text>
      </View>
    ))}
  </View>
)}
```

To remove a section, delete its `{profile.x.length > 0 && (...)}` block.
To add a section, copy the pattern above and place it in the desired position within the `<Page>` element.

Available layout helpers:

| Style key | Use |
|-----------|-----|
| `s.section` | Wrapper with bottom margin between sections |
| `s.sectionTitle` | Uppercase label with bottom border |
| `s.row` | Horizontal row with small gap (`marginBottom: 4`) |
| `s.rowGap` | Same but larger gap (`marginBottom: 7`) — used for publications |
| `s.bullet` | Fixed-width column for the `•` character |
| `s.itemMain` | Flex column that fills remaining width |
| `s.bold` | Helvetica-Bold |
| `s.muted` | Gray, font size 9 |

## Item limits

Scientific outputs are capped at 30 and projects at 20 to keep the PDF size reasonable. Adjust the `.slice(0, N)` calls in `ResearcherInfoDocument.tsx` if needed.

## Footer

The footer (`s.footer`) is marked `fixed`, which means `@react-pdf/renderer` repeats it on every page. It shows the system name on the left and `page / total | date` on the right. The date is generated at click time using `toLocaleDateString('es-CR')`.
