# Restaurant Competitor Intel — Deployment Guide (No coding needed!)

Follow these steps exactly and your app will be live in about 10 minutes.

---

## Step 1 — Get a free GitHub account
1. Go to https://github.com and click **Sign up**
2. Create a free account

---

## Step 2 — Upload these files to GitHub
1. Once logged in, click the **+** button (top right) → **New repository**
2. Name it: `restaurant-competitor-intel`
3. Make sure it's set to **Public**
4. Click **Create repository**
5. On the next page, click **uploading an existing file**
6. Upload ALL the files from this folder (keeping the folder structure)
7. Click **Commit changes**

---

## Step 3 — Get your Anthropic API Key
1. Go to https://console.anthropic.com
2. Sign up or log in
3. Click **API Keys** in the left menu
4. Click **Create Key** → copy it and save it somewhere safe

---

## Step 4 — Deploy on Vercel (free)
1. Go to https://vercel.com and sign up with your GitHub account
2. Click **Add New Project**
3. Find your `restaurant-competitor-intel` repository and click **Import**
4. Before clicking Deploy, click **Environment Variables**
5. Add this variable:
   - Name: `ANTHROPIC_API_KEY`
   - Value: (paste your API key from Step 3)
6. Click **Deploy**
7. Wait ~2 minutes — Vercel gives you a live URL like `restaurant-competitor-intel.vercel.app`

---

## Step 5 — Add it to your website
Paste this code wherever you want the app to appear on your site:

```html
<iframe
  src="https://YOUR-APP-NAME.vercel.app"
  width="100%"
  height="800px"
  style="border: none; border-radius: 12px;"
></iframe>
```

Replace `YOUR-APP-NAME` with your actual Vercel URL.

---

## That's it! 🎉
Your app is now live and secure. Your API key is hidden on the server — no one can steal it.

---

## Cost estimates
- GitHub: Free
- Vercel hosting: Free (up to 100GB bandwidth/month)
- Anthropic API: ~$0.003 per analysis (very cheap)
