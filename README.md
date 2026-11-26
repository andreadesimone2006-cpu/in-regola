# ViaLibera: riepilogo del progetto d'esame

Aggiornato al 26 novembre 2026. Raccoglie tutto il lavoro fatto in chat con Claude Code.

## In breve

- **Cos'è:** il redesign del Portale dell'Automobilista per l'esame di UX/UI (ITS Machina Lonati, MARTECH 2° anno, 24-26 novembre 2026). È un sito navigabile, organizzato per compiti, mobile first e ottimizzato anche per desktop.
- **Sito online:** https://andreadesimone2006-cpu.github.io/vialibera/ (dal 26/11; il vecchio link con `in-regola` non funziona più)
- **Codice:** https://github.com/andreadesimone2006-cpu/vialibera
- **Cartella sul computer:** `C:\Users\andre\Documents\Progetti\in-regola` (il nome della cartella è rimasto quello vecchio)
- **Nome di lavoro:** ViaLibera (all'inizio era "In regola").
- **Persona:** Giuseppe, 62 anni, di Brescia. I suoi due compiti, controllare i punti della patente e la revisione dell'auto, funzionano dall'inizio alla fine.

## Cosa chiedeva il brief

- Sei pagine:
  - Home pubblica: azioni frequenti, accesso con SPID o CIE, ingressi per operatori, imprese ed enti.
  - Accesso con SPID o CIE: un percorso chiaro che spiega prima cosa serve e gestisce gli errori.
  - Cruscotto personale: punti, scadenze e veicoli, con avvisi.
  - Saldo punti: punti attuali, storico, come recuperarli.
  - Scheda veicolo: dati principali, scadenza della revisione, classe ambientale.
  - Privacy e cookie: informativa e banner con una scelta vera.
- Italiano semplice, accessibilità WCAG AA, elementi di fiducia: conferma dopo ogni azione, ricevute scaricabili, errori accanto al campo.
- Vincoli rispettati:
  - Si condivide solo con il link di consegna e non si presenta come sito ufficiale. C'è una fascia in alto: "Progetto d'esame UX/UI: non è un sito ufficiale. I dati sono di esempio."
  - Niente simboli istituzionali: niente logo del Ministero, emblema della Repubblica o marchio del portale. Nome e logo sono nostri.
  - Solo dati finti: targhe, nomi e numeri sono inventati.
  - Niente segnali da AI: niente sfumature viola o blu a caso, niente emoji come icone, niente card tutte uguali.
  - Gli altri tre profili (operatori, imprese, enti) compaiono solo nel menu, con un accesso dedicato.

## Scelte fatte

- **Stile:** Designers Italia, con il font Titillium Web e il blu istituzionale scuro (`#0b2f57` per testata e piede, `#0059b3` per azioni e link).
- **Pubblicazione:** GitHub Pages.
- **"Dashboard totale all'inizio"**, la richiesta del prof: l'abbiamo interpretata come una home che mostra la panoramica di tutti i servizi (sezione "Tutti i servizi"). Il cruscotto dopo l'accesso resta com'era.
- **Nome:** "In regola" è diventato "ViaLibera", scritto attaccato. Le parole "In regola" restano solo come stato di una scadenza in ordine (per esempio la revisione), dove sono italiano semplice e non il nome del sito.
- **Logo:** il simbolo "VL" è tracciato come un'unica strada con la mezzeria tratteggiata. L'ho generato con Higgsfield in SVG, nei due colori del sito. La scritta "ViaLibera" è testo vero, in Titillium Web grassetto.

## Le pagine e come funzionano

| Pagina | File | Cosa contiene |
|---|---|---|
| Home | `index.html` | "Cosa vuoi controllare oggi?": 4 azioni frequenti, riquadro SPID/CIE, Tutti i servizi, controllo della revisione con la targa, avviso sugli SMS falsi |
| Accesso | `accesso.html` | Cosa serve per SPID e per CIE, scelta del metodo, gestore SPID (Aurora ID, Chiave Nord, Identità Facile, Sigillo Digitale, tutti inventati), conferma o annulla con messaggio d'errore |
| Riepilogo | `cruscotto.html` | Saluto, "Da fare presto" con gli avvisi, punti 19 su 30, scadenze, veicoli |
| Punti | `punti.html` | "Hai 19 punti sulla patente", barra da 0 a 30, storico, come recuperarli, attestato in PDF |
| Veicolo | `veicolo.html` | Scelta del veicolo, revisione, dati, classe Euro, ricevuta in PDF |
| Privacy | `privacy.html` | Informativa, tabella dei cookie, scelta dei cookie, note legali, dichiarazione di accessibilità |

- Testata, menu, piede, barra in basso e banner dei cookie sono uguali su tutte le pagine e li crea `assets/app.js`. Lo stile è tutto in `assets/style.css`.
- L'accesso è simulato e salvato in `sessionStorage` con la chiave `vl-accesso`. Le pagine private rimandano all'accesso e poi tornano dove volevi andare.
- La scelta sui cookie è salvata in `localStorage` con la chiave `vl-cookie` e viene richiesta di nuovo dopo 6 mesi. "Accetta tutti" e "Rifiuta i facoltativi" hanno lo stesso aspetto, la X vale come rifiuto e "Scegli tu" dà le opzioni una per una.
- Le ricevute PDF (attestato dei punti e ricevuta della revisione) si scaricano davvero e vengono create nel browser con jsPDF, salvato nel sito.
- I font sono salvati nel sito: nessun dato parte verso altre aziende.
- Le icone sono disegnate in SVG, mai emoji.
- Gli stati usano sempre icona e parole: verde se mancano più di 60 giorni, giallo se ne mancano 60 o meno, rosso se è scaduto.
- Tutte le pagine hanno `noindex, nofollow`, così non finiscono su Google.

### Dati di esempio

- Giuseppe Bonetti, patente B valida fino al 18 giugno 2029, 19 punti.
- Storico dei punti:
  - 20 novembre 2026: −3 per eccesso di velocità.
  - 12 giugno 2025: +2.
  - 12 giugno 2023: +2.
  - 4 giugno 2021: −2.
- Fiat Panda, targa XA 482 KT: revisione entro il 31 dicembre 2026, ultima il 12 dicembre 2024, 48.210 km, Euro 6.
- Piaggio Liberty 125, targa XB 10734: revisione entro il 30 settembre 2027, Euro 4.

## Cronologia delle modifiche

| Commit | Ora | Cosa |
|---|---|---|
| 1b95017 | 26/11 | Correzioni dall'analisi UX/UI (dettagli in "Correzioni dall'analisi", qui sotto). Versione `?v=16`. Online, verificata con gli stessi 43 controlli sul sito pubblicato |
| 210b309 | 26/11 | Finestra di uscita: angoli in alto dritti sotto la barra blu. Versione `?v=15` |
| f4e4d57 | 09:35 | Prima versione: le 6 pagine, mobile first |
| a6eb5fd | 10:37 | Home: sezione "Tutti i servizi" (11 link: 3 + 4 + 1 + 3). I servizi che il prototipo non copre sono visibili ma non cliccabili, così non ci sono link rotti |
| 24d9374 | 11:10 | Accesso: freccia del menu a tendina del gestore SPID staccata dal bordo |
| 69a5e2f | 11:17 | Menu: aggiunta la voce Home |
| c13df69 | 11:20 | Numero di versione su CSS e JS (`?v=`), così il browser carica subito le modifiche |
| bbcea44 | 11:32 | Primo nuovo logo: monogramma "ir" (poi sostituito) |
| f8a8904 | 11:50 | Nuovo nome ViaLibera e simbolo VL; nome cambiato ovunque e cookie rinominati con `vl-` |
| 46ded31 | 11:58 | Ottimizzazione per telefono (dettagli qui sotto) |
| 647df5e | 26/11 10:54 | Conferma prima di uscire dall'account (dettagli qui sotto). Versione `?v=14` |
| ae62c59 | 26/11 10:18 | Illustrazioni libere nella pagina, senza riquadro blu, come sul sito di IO. Versione `?v=13` |
| cf04370 | 26/11 10:08 | Accesso: illustrazione più piccola sul telefono (al massimo 17rem, circa 200 px di altezza). Versione `?v=12` |
| b18a383 | 26/11 10:06 | Illustrazioni anche sul telefono. Versione `?v=11` |
| 5afc5f4 | 26/11 09:55 | Illustrazioni nello stile del sito di IO (dettagli qui sotto). Versione `?v=10` |
| 8163998 | 26/11 08:57 | Punti: la scritta "20: punteggio di partenza" sta a sinistra della tacca e va a capo, così non esce più dal riquadro col testo ingrandito. Versione `?v=9`. Repository rinominato da `in-regola` a `vialibera` |

## Correzioni dall'analisi (26/11)

Fonte: l'analisi UX/UI pubblicata come artifact (https://claude.ai/artifact/LP2Tbp3L5dNJQBvBSvQYku), con i codici M1-M9, D1-D3, T1 e T2.

| Codice | Cosa è cambiato |
|---|---|
| M1 | Home: il controllo con la targa sta subito dopo le azioni e il riquadro "Entra". Sul telefono il suo disegno non c'è e l'illustrazione della Home scende sotto il modulo. Il titolo della sezione è passato da 4,1 a 1,4 schermate, la Home da 5,7 a 3,9 |
| M2, D2 | Accesso: il modulo viene subito dopo il titolo. "Prima di cominciare, tieni a portata di mano" sta dentro il modulo e mostra solo il metodo scelto, o tutti e due se non è scelto. Sul telefono non c'è illustrazione. Il modulo parte a 350 px invece di 1.232 |
| M3 | Illustrazioni senza dati né pulsanti: icone, righe grigie e una barra al posto di "19 su 30", Fiat Panda, Liberty 125 "In regola" e del finto pulsante "Entra" |
| M4 | Dopo una targa valida, sul telefono la tastiera si chiude e il risultato va in cima allo schermo. Sul computer la pagina scorre solo se serve |
| M5 | "Tutti i servizi": gruppi richiudibili, chiusi sul telefono e aperti da 768 px, con il numero di servizi nel titolo. I servizi non attivi stanno in una riga sola in fondo al gruppo |
| M6 | Banner dei cookie: testo breve, "Accetta" e "Rifiuta" affiancati e uguali, "Scegli tu" e "Leggi i dettagli" come link. Occupa il 29% dello schermo invece del 50% (43% invece del 70% a 320 px) |
| M7 | Fascia in alto su una riga sul telefono: "Progetto d'esame, non ufficiale. Dati di esempio." Da 768 px resta la frase completa |
| M8 | Riepilogo: lo stato di ogni scadenza sta sempre sotto il testo, sotto i 640 px |
| M9 | "Cosa serve per entrare" è un pulsante secondario. "Annulla" nell'accesso dà un avviso blu, non rosso. Dopo il PDF: "Se non si è aperto da solo, lo trovi tra i download del browser" |
| D1 | "Riepilogo" è il nome unico: da utente entrato c'è la voce "Riepilogo" nel menu ed è quella segnata. "Le mie scadenze" porta all'ancora. Il pulsante col nome in testata si legge "Riepilogo di Giuseppe" |
| D3 | Più spazio tra la fascia e "Accesso dedicato", testo della Home centrato accanto all'illustrazione, avviso dei punti largo come il testo. Spazio tra le voci del menu ridotto a 1,5rem, così a 1024 px il menu da utente sta su una riga |
| T1 | `<noscript>` in tutte le pagine: fascia con l'avviso "non è un sito ufficiale" e i link a Home e Privacy |
| T2 | Precaricato anche `titillium-web-700.woff2` |

- **Verifica:** 43 controlli automatici con Chrome e WebKit, tutti passati. Telefono a 390 e 320 px, computer a 1024 e 1440 px, da ospite e da utente, anche senza JavaScript. Nessuno scorrimento laterale e nessun errore in console.
- **Non provato:** la tastiera e il PDF su un iPhone vero, un lettore di schermo.

## Come è nato il logo

1. Ho preparato 4 proposte a mano: strada, cruscotto, freccia, targa.
2. Hai chiesto di usare anche Higgsfield: 6 simboli generati. Hai scelto il monogramma "ir", che è andato online.
3. Per la scritta ho fatto due giri di proposte (font da segnaletica e lettere disegnate da Higgsfield). Lì hai deciso di cambiare nome.
4. Tra le proposte di nome (Guida chiara, Via libera, Al volante, Semaforo verde) hai scelto Via libera, scritto "ViaLibera".
5. 4 simboli "vl" generati con Higgsfield: hai scelto "VL linea continua".

- **Crediti Higgsfield usati:** 13 generazioni, 9,75 crediti in tutto.
- **File di lavoro:** nella cartella temporanea di Claude, che può essere cancellata. Il logo definitivo è in `favicon.svg` e nella costante `LOGO` di `assets/app.js`.

## Conferma prima di uscire (26/11)

- **Cosa succede:** premendo "Esci" in testata si apre una finestra "Vuoi davvero uscire?", con "Sì, esci" e "No, resta qui".
- **Focus:** parte su "No, resta qui", così un Invio per sbaglio non fa uscire.
- **Per restare:** Esc o un tocco sul fondo scuro chiudono la finestra e lasciano dentro.
- **Dopo "Sì, esci":** si torna alla Home con l'avviso "Sei uscito dalla tua area personale".
- **Come è fatta:** con l'elemento `<dialog>` del browser (su iPhone da iOS 15.4), che tiene il focus dentro la finestra. Sui browser che non lo conoscono si usa la conferma standard del browser.
- **Codice:** funzioni `chiediUscita()` ed `esci()` in `assets/app.js`, stile `.dialogo` in `assets/style.css`.

## Illustrazioni (26/11)

Prese a modello dal sito di IO (ioapp.it), senza copiarne immagini né loghi. Dal 26/11 alle 10:18 sono "libere" nella pagina, senza riquadro né fondo blu, come sul sito di IO:

- mani disegnate a linea, in blu (`#0059b3`) perché stanno sul fondo chiaro;
- un telefono intero, azzurro chiaro;
- schede bianche con un'ombra leggera; nella Home la moto esce dal telefono come una notifica;
- piccole scintille blu.

Dove si trovano:

| Dove | Cosa mostra |
|---|---|
| Home, in alto a destra | Un telefono con i punti (19 su 30), la Fiat Panda (revisione entro il 31/12/2026) e la Liberty 125 "In regola". Una mano lo regge e una tocca lo schermo |
| Home, accanto a "Controlla la revisione con la targa" | La targa XA 482 KT e "Entro il 31 dicembre 2026". Una mano indica la data |
| Accesso, accanto al titolo | Una carta d'identità generica e un telefono con il lucchetto e il pulsante "Entra" |

Come sono fatte:

- **Mani:** generate con Higgsfield (GPT Image 2.6) in SVG. Sei proposte, ne ho usate tre: 6 crediti. Le ho colorate di blu e con lo stesso spessore di linea. Hanno anche loro il numero di versione `?v=`. File: `assets/illustrazioni/mano-sorregge.svg`, `mano-tocca.svg`, `mano-indica.svg`.
- **Schede, targa e stato "In regola":** sono HTML con i componenti veri del sito (font, icone, targa, stato). Così testi e dati sono esatti e coerenti col resto del sito. Le date sono fisse, così non diventano sbagliate col passare dei giorni.
- **Decorative:** sono nascoste ai lettori di schermo (`aria-hidden`), e le informazioni vere sono nel testo accanto.
- **Sul telefono:** l'illustrazione della Home scende sotto le azioni e il riquadro "Entra", così le azioni restano in cima allo schermo. Quella della targa sta tra il testo e il modulo. Quella dell'accesso sta sotto il titolo, larga al massimo 17rem, così "Prima di cominciare" resta sul primo schermo. Da 768 px in su stanno tutte a destra del testo.

## Ottimizzazione per telefono

Prima di modificare ho misurato le 6 pagine con un telefono simulato (360 e 390 px, orizzontale, 320 px, testo ingrandito al 130%). Poi ho corretto:

- **Aree di tocco di almeno 44 px:** logo, indice della privacy, link dentro gli avvisi e le scadenze ("Vedi come prenotarla").
- **Tabella dei cookie:** sul telefono diventa una scheda per ogni cookie, senza scorrimento laterale. Su computer resta una tabella.
- **Spazi tra le sezioni** più stretti sugli schermi piccoli: nella scheda veicolo la data della revisione si vede subito, sopra la barra in basso.
- **Effetti al passaggio del mouse** solo dove c'è il mouse. Su touch righe e pulsanti si illuminano mentre li tocchi.
- **Testo ingrandito al 130%:** i pulsanti della testata vanno a capo sotto il logo invece di uscire dallo schermo. Anche lo storico dei punti regge.
- **Piccoli ritocchi:**
  - Targa nel selettore dei veicoli a 16 px.
  - Tasto "Vai" sulla tastiera per il campo della targa.
  - Nomi dei cookie su una riga.

## Test fatti

- I due compiti di Giuseppe funzionano dall'inizio alla fine, sia in locale sia online.
- Le ricevute PDF si scaricano dal sito online e riportano "ViaLibera".
- Accesso simulato, scelta dei cookie e controllo della targa:
  - targhe auto e moto valide;
  - errori accanto al campo.
- Nessuno scorrimento orizzontale e nessun errore nella console:
  - computer a 1024 e 1440 px;
  - telefono a 320, 360 e 390 px e in orizzontale;
  - testo ingrandito al 130%.
- **26/11, prova con WebKit, il motore di Safari:** iPhone 15 simulato (393 px), iPhone SE (375 px), iPhone 15 in orizzontale (852 px), testo al 150% e zoom pagina di Safari al 150% (262 px). Su tutte e 6 le pagine:
  - nessuno scorrimento laterale e nessun errore in console;
  - nessun campo di testo sotto i 16 px, quindi Safari non fa zoom quando lo tocchi.
- **26/11, barra dei punti:** la scritta resta nel riquadro, la tacca cade sul 20 e attraversa la barra. Provato a 320, 360, 393 e 1024 px, col testo al 100, 130, 150 e 200%.

## Cose aperte e da sapere

- **Logo e mani generati con l'AI:** il brief chiede "un logo vostro" e niente segnali AI. Logo e mani delle illustrazioni non usano simboli istituzionali, ma sono generati da Higgsfield: conviene dirlo tu nella presentazione.
- **Safari su iPhone (26/11):** hai detto che la pagina non si apre, ma la causa non è stata verificata. L'ipotesi più probabile è che Safari riapra dalla cronologia il vecchio link `in-regola`, che ora non esiste più. Il link giusto è https://andreadesimone2006-cpu.github.io/vialibera/.
- **Non provato:**
  - Su un iPhone vero: solo WebKit con iPhone simulato. Restano da provare sul telefono le cose che il simulatore non riproduce: download dei PDF, barra in basso sopra la barra di Safari, tastiera sul campo della targa.
  - Con un lettore di schermo: "ViaLibera" potrebbe essere letto come una parola sola, ma in italiano suona quasi uguale.
- **Da fare tu:** l'analisi euristica e il test con un compagno di corso.
- **Il tuo nome** non compare nel sito. Si può aggiungere nel piede se il professore lo chiede.
- **Se vedi una versione vecchia:** premi Ctrl+F5 o apri il sito in una finestra in incognito.

## Come si lavora sul progetto (per Claude)

- **Prova in locale:** `python -m http.server 8123 --bind 127.0.0.1 --directory "C:/Users/andre/Documents/Progetti/in-regola"`, poi apri http://127.0.0.1:8123/. Con `file://` Playwright non funziona.
- **Pubblicazione:**
  1. Alza il numero di versione (ora `?v=16`) su CSS, JS, favicon e mani delle illustrazioni in tutte le 6 pagine HTML.
  2. Fai `git add`, `git commit` e `git push`.
  3. Aspetta circa un minuto: GitHub Pages tiene i file in cache per 10 minuti.
- **Questo riepilogo:** è `README.md` nel repository. Aggiornalo e mandalo su GitHub insieme alle modifiche.
- **Identità git:** quella "noreply" di GitHub, impostata solo dentro il repository, così l'email personale resta privata.
- **`.impeccable/config.json`:** non è salvato nel repository e contiene solo un'eccezione del controllo design per `index.html`.
