# Focusline — landing page

Static site for [Focusline](https://apps.apple.com/app/id6784978549). No build step — plain HTML/CSS/JS.

```
index.html        Landing page + live interactive reader demo
privacy.html      Privacy Policy
assets/styles.css Styles
assets/demo.js    The live demo (recreates the app's real bar/tint behaviour)
```

## Preview locally

```
cd website
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy to GitHub Pages (repo: 29satnam/focusline)

These files are the **site root**. Push the *contents* of `website/` to the
`focusline` repo, then enable Pages.

```
cd website
git init
git add .
git commit -m "Focusline landing page"
git branch -M main
git remote add origin https://github.com/29satnam/focusline.git
git push -u origin main
```

Then on GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → `main` / `/ (root)`**. Site goes live at `https://29satnam.github.io/focusline/`.

> If you point a custom domain (e.g. `focusline.app`) at Pages, add a `CNAME`
> file here containing the domain.
