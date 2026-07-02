# Squalo

Marketplace per trovare ripetizioni vicino a te. Studenti cercano tutor sulla mappa e prenotano gratis; i tutor si registrano e vengono verificati.

## Stack

- Next.js + React + Tailwind CSS
- Supabase (database, autenticazione via email OTP, storage foto)
- API Anthropic per il chatbot della mascotte
- Google Maps Platform (in arrivo)
- Deploy su Vercel

## Sviluppo locale

```bash
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000). Serve un file `.env.local` (vedi `.env.local.example`) con le chiavi di Supabase e Anthropic.
