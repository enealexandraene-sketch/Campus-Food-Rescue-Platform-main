/**
 * FRONTEND PREVIEW SERVER ONLY.
 * Renders EJS files and serves static assets. NO authentication, database,
 * persistence or business rules on the server. Browser-side demo data is
 * stored in localStorage. Do not deploy as a production backend.
 */
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/assets', express.static(path.join(__dirname, 'public')));
const pages = new Set(['welcome','signup','browse','listing','reservations','profile','provider-dashboard','provider-listings','provider-editor','provider-settings','provider-pickups','admin','report']);
app.get('/', (req, res) => res.redirect('/welcome'));
app.get('/:page', (req, res) => {
  const page = req.params.page;
  if (!pages.has(page)) return res.status(404).render('index', {page:'not-found'});
  res.render('index', {page});
});
const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`Frontend preview: http://localhost:${port}`));
