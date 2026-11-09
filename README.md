# chartingaheadgames.com

The Charting Ahead Games website: a home page, the legal pages, and AdMob's `app-ads.txt`. Plain HTML and CSS with one small optional script, no build step. Hosted on GitHub Pages. This file is public: GitHub Pages serves it at `/README.md`.

| File | What it's for |
|---|---|
| `index.html` | Home page: the studio poster, a trail with one stop per game, About and Say hello |
| `emberstead/` | Emberstead's own page |
| `leviathan-keeper/` | Leviathan Keeper's own page (in development) |
| `privacy.html` | Privacy policy for the game and this website. Play Console needs this URL: `https://chartingaheadgames.com/privacy.html` |
| `terms.html` | Emberstead terms of service. Play Console asks traders for this URL on each app: `https://chartingaheadgames.com/terms.html` |
| `cookies.html` | Cookie policy: the website uses none. Update it first if that ever changes. |
| `refunds.html` | Refund policy for the Remove Ads purchase |
| `404.html` | The page shown at any address that doesn't exist, with a way home. GitHub Pages shows it at the address that was asked for, so its links and files start from `/`. |
| `robots.txt`, `sitemap.xml` | Tell search engines which pages exist. Every page with its own address is in the sitemap. |
| `favicon.ico`, `apple-touch-icon.png` | The browser-tab icon for browsers that can't show `assets/icon.svg`, and the 180-pixel iPhone home-screen icon |
| `style.css` | The one stylesheet for every page |
| `site.js` | Optional movement on top of the pages: the poster's layers drift as you scroll, the trail draws on, tapped fires throw sparks. Every page works fully without it. It stores nothing and loads nothing from other sites, and it stays still when a visitor asks for reduced motion. |
| `fonts/` | League Gothic and Jost, under the SIL Open Font License; each licence sits beside its font |
| `assets/` | The poster layers, each game's art, textures, the icon and the share picture (`share.jpg`) |
| `app-ads.txt` | Lets AdMob confirm the ads in Emberstead are yours (publisher `pub-7297944809186986`). Must stay at the site root. |
| `CNAME` | Tells GitHub Pages the custom domain |
| `.nojekyll` | Serves the files exactly as they are |

The pages are drawn and built by a script that isn't published here. Change the words in the HTML files directly, or rebuild from that script.

## Hosting setup (one time)
1. **GitHub:** create a public repository (e.g. `chartingaheadgames.com`) and push this folder to its `main` branch.
2. **GitHub Pages:** repository → Settings → Pages → Source: **Deploy from a branch**, branch **main**, folder **/ (root)**, Save. Custom domain should show `chartingaheadgames.com` (from `CNAME`). Once the certificate is ready, tick **Enforce HTTPS**.
3. **Squarespace DNS** (domains.squarespace.com → chartingaheadgames.com → DNS):
   - Leave the **Google Workspace** records (MX and friends) alone. They carry the email.
   - Delete the **Squarespace Defaults** records if they're there (they point the domain at Squarespace).
   - Add custom records:
     - `A` `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (four records)
     - `AAAA` `@` → `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` (optional, for IPv6)
     - `CNAME` `www` → `5k-an00bis.github.io`
4. Wait for DNS (minutes, sometimes a few hours), then check `https://chartingaheadgames.com/privacy.html` and `https://chartingaheadgames.com/app-ads.txt`.
5. Done 2026-11-06: `chartingaheadgames.com` is verified under GitHub → your profile Settings → Pages. Keep the `_github-pages-challenge-5K-AN00BIS` TXT record at Squarespace, because deleting it removes the protection.

## Updating
Edit the files, commit, push to `main`. GitHub Pages republishes in a minute or two. When a legal page changes, update its "Last updated" date.
