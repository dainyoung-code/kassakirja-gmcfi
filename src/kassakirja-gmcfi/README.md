# GMCFI Kassakirja

Grace Montagnard Alliance Church Finland – Kassakirja-sovellus.

## Julkaisu Verceliin (ilmainen)

### Vaihe 1: Luo GitHub-tili ja repositorio

1. Mene osoitteeseen **https://github.com** ja luo tili (jos ei vielä ole)
2. Klikkaa **"New repository"** (vihreä painike)
3. Anna nimi: `kassakirja-gmcfi`
4. Valitse **Private** (yksityinen)
5. Klikkaa **"Create repository"**

### Vaihe 2: Lataa koodi GitHubiin

Pura tämä zip-tiedosto koneellesi ja avaa terminaali/komentokehote kansiossa. Suorita:

```bash
git init
git add .
git commit -m "Kassakirja-sovellus"
git branch -M main
git remote add origin https://github.com/SINUN-KÄYTTÄJÄ/kassakirja-gmcfi.git
git push -u origin main
```

> Korvaa `SINUN-KÄYTTÄJÄ` omalla GitHub-käyttäjänimelläsi.

### Vaihe 3: Julkaise Vercelissä

1. Mene osoitteeseen **https://vercel.com** ja kirjaudu GitHub-tilillä
2. Klikkaa **"Add New..." → "Project"**
3. Valitse listalta `kassakirja-gmcfi`
4. Vercel tunnistaa automaattisesti Vite-projektin
5. Klikkaa **"Deploy"**
6. Odota ~1 minuutti → saat osoitteen kuten `kassakirja-gmcfi.vercel.app`

Valmis! Sovellus on nyt verkossa.

---

## Vaihtoehto: Netlify

1. Asenna ensin riippuvuudet ja buildaa:
   ```bash
   npm install
   npm run build
   ```
2. Mene osoitteeseen **https://app.netlify.com**
3. Raahaa `dist`-kansio sivulle → julkaistu!

---

## Kehitys paikallisesti

```bash
npm install
npm run dev
```

Avaa selaimessa: **http://localhost:5173**

## Tekniikka

- React 18 + Vite
- Tiedot tallentuvat selaimen localStorage-muistiin
- PDF-tulostus selaimen kautta
- Ei vaadi tietokantaa tai palvelinta
