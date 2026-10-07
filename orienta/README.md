# Orienta

Web app in italiano, mobile-first e installabile come PWA, che aiuta a capire i propri sintomi e a trovare il professionista giusto.
**Orienta, non diagnostica**: ogni risultato è una possibilità e porta sempre verso un medico o un farmacista.

Piano, struttura delle cartelle e design system: [docs/PIANO.md](docs/PIANO.md).
Il README completo (variabili d'ambiente, import AIFA, come aggiungere una condizione, nota sul Regolamento MDR) arriva nella fase 6.

## Avvio rapido

```bash
cd orienta
npm install
cp .env.example .env.local   # facoltativo: senza chiavi l'app usa i ripieghi
npm run dev                  # http://localhost:3000
```

| Comando | Cosa fa |
| --- | --- |
| `npm run dev` | Server di sviluppo |
| `npm run build && npm start` | Build di produzione (il service worker si attiva solo qui) |
| `npm run lint` / `npm run typecheck` | Controlli statici |
| `npm test` | Test unitari (Vitest) |
| `npm run test:e2e` | Test end-to-end (Playwright) su una build di produzione. Se il browser di Playwright non è installato, indica un Chromium con `CHROMIUM_PATH=/percorso/chromium` |
| `npm run check:sources` | Verifica che i link delle fonti delle schede esistano; con `-- --write` aggiorna `data/conditions/sources-report.json` |
| `npm run icons` | Rigenera le icone PWA da `scripts/icon-source.svg` |

## Base di conoscenza e vetrino

- Le schede delle condizioni sono file TypeScript tipizzati in `data/conditions/`, validati con Zod all'avvio e nei test. Ogni scheda resta «da revisionare» finché un medico non la controlla, e l'app lo segnala.
- Le animazioni del vetrino sono scene SVG originali in `src/components/slide/scenes/`, descritte in `src/lib/slides/catalog.ts`. La pagina `/vetrino` (non indicizzata) mostra tutte le scene passo per passo, utile per la revisione.
