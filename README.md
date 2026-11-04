# chartingaheadgames.com

The Charting Ahead Games website: a home page, the Emberstead privacy policy, and AdMob's `app-ads.txt`. Plain HTML and CSS, no build step. Hosted on GitHub Pages.

| File | What it's for |
|---|---|
| `index.html` | Home page |
| `privacy.html` | Emberstead privacy policy. Play Console needs this URL: `https://chartingaheadgames.com/privacy.html` |
| `terms.html` | Emberstead terms of service. Play Console asks traders for this URL on each app: `https://chartingaheadgames.com/terms.html` |
| `app-ads.txt` | Lets AdMob confirm the ads in Emberstead are yours (publisher `pub-7297944809186986`). Must stay at the site root. |
| `CNAME` | Tells GitHub Pages the custom domain |
| `.nojekyll` | Serves the files exactly as they are |
| `assets/` | Header image and icon (sources live in the game's repo, `Emberhold` (its codename), under `native-android/store/brand/`) |

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
5. Optional but recommended: GitHub → your profile Settings → Pages → **Add a domain** to verify `chartingaheadgames.com` (a TXT record at Squarespace). It stops anyone else from claiming the domain on GitHub Pages.

## Updating
Edit the files, commit, push to `main`. GitHub Pages republishes in a minute or two. When the privacy policy changes, update its "Last updated" date.
