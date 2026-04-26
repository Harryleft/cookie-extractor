# Cookie Extractor

A minimal Chrome extension that reads cookies from any website and copies them to your clipboard. No accounts, no cloud, no data leaves your browser.

## Features

- One-click cookie reading for the current site
- Copy as **header string** (`name=val; name2=val2`) — paste into HTTP requests
- Copy as **structured JSON** — includes domain, path, flags, and expiration
- Value masking in the UI (full values are copied to clipboard)
- Shows HttpOnly / Secure / SameSite flags per cookie

## Install

1. Clone this repo
2. Open `chrome://extensions` in Chrome
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select the project folder

## Use

1. Navigate to any website
2. Click the Cookie Extractor icon in the toolbar
3. Click **Read Cookies**
4. Click **Copy as Header** or **Copy as JSON**

## JSON Output Example

```json
{
  "sourceUrl": "https://example.com",
  "exportedAt": "2026-04-26T12:00:00.000Z",
  "cookies": [
    {
      "name": "session_id",
      "value": "abc123...",
      "domain": ".example.com",
      "path": "/",
      "secure": true,
      "httpOnly": true,
      "sameSite": "Lax",
      "expirationDate": 1745673600
    }
  ]
}
```

## Permissions

| Permission | Why |
|---|---|
| `cookies` | Read cookie data for the current site |
| `activeTab` | Access the URL of the active tab |
| `clipboardWrite` | Copy cookies to your clipboard |
| `<all_urls>` | Read cookies from any site you visit |

## License

[MIT](LICENSE)
