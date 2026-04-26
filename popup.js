const $ = (sel) => document.querySelector(sel);

let currentTabUrl = "";
let detectedCookies = [];

function setStatus(type, text) {
  const el = $("#status");
  el.className = `status ${type}`;
  $("#status-icon").textContent =
    type === "ok" ? "\u2713" : type === "err" ? "\u2717" : type === "loading" ? "\u25CE" : "i";
  $("#status-text").textContent = text;
}

function setCopyEnabled(enabled) {
  $("#btn-copy-string").disabled = !enabled;
  $("#btn-copy-json").disabled = !enabled;
}

function maskValue(value) {
  if (!value) return "";
  if (value.length <= 12) return `${value.slice(0, 3)}...`;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function getCookieBadges(cookie) {
  const badges = [];
  if (cookie.httpOnly) badges.push("HttpOnly");
  if (cookie.secure) badges.push("Secure");
  if (cookie.sameSite) badges.push(`SameSite=${cookie.sameSite}`);
  return badges;
}

function renderTable(cookies) {
  const tbody = $("#cookies-table tbody");
  tbody.innerHTML = "";

  for (const cookie of cookies) {
    const tr = document.createElement("tr");
    const badges = getCookieBadges(cookie)
      .map((badge) => `<span class="badge">${badge}</span>`)
      .join("");

    tr.innerHTML = `
      <td><code>${cookie.name}</code><div class="muted">${cookie.domain}${cookie.path}</div></td>
      <td>${badges || '<span class="muted">—</span>'}</td>
      <td><code>${maskValue(cookie.value)}</code></td>
    `;
    tbody.appendChild(tr);
  }

  $("#cookies-table").style.display = cookies.length ? "" : "none";
  $("#empty-state").style.display = cookies.length ? "none" : "";
}

function toCookieHeader(cookies) {
  return cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
}

function toCookieJson(cookies) {
  return JSON.stringify(
    {
      sourceUrl: currentTabUrl,
      exportedAt: new Date().toISOString(),
      cookies: cookies.map((cookie) => ({
        name: cookie.name,
        value: cookie.value,
        domain: cookie.domain,
        path: cookie.path,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: cookie.sameSite,
        expirationDate: cookie.expirationDate,
      })),
    },
    null,
    2,
  );
}

async function getCurrentHttpTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url || !/^https?:\/\//i.test(tab.url)) {
    throw new Error("Current page is not an HTTP/HTTPS website");
  }
  return tab;
}

async function detectCookies() {
  setStatus("loading", "Reading cookies...");
  setCopyEnabled(false);
  detectedCookies = [];
  $("#empty-state").style.display = "none";

  try {
    const tab = await getCurrentHttpTab();
    currentTabUrl = tab.url;
    $("#site-url").textContent = currentTabUrl;
    $("#site-url").classList.remove("muted");

    detectedCookies = await chrome.cookies.getAll({ url: currentTabUrl });
    detectedCookies.sort((a, b) => a.name.localeCompare(b.name));
    renderTable(detectedCookies);

    if (detectedCookies.length) {
      setStatus("ok", `${detectedCookies.length} cookie(s) found — ready to copy`);
      setCopyEnabled(true);
    } else {
      setStatus("idle", "No cookies found on this site");
    }
  } catch (err) {
    renderTable([]);
    setStatus("err", `Error: ${err.message}`);
  }
}

async function copyText(text, successText) {
  try {
    await navigator.clipboard.writeText(text);
    setStatus("ok", successText);
  } catch (err) {
    setStatus("err", `Copy failed: ${err.message}`);
  }
}

$("#btn-detect").addEventListener("click", detectCookies);

$("#btn-copy-string").addEventListener("click", () => {
  if (!detectedCookies.length) return;
  copyText(toCookieHeader(detectedCookies), "Cookie header copied to clipboard");
});

$("#btn-copy-json").addEventListener("click", () => {
  if (!detectedCookies.length) return;
  copyText(toCookieJson(detectedCookies), "JSON copied to clipboard");
});
