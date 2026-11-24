/* In regola: parti comuni (testata, menu, piede, cookie, accesso simulato) e logica di ogni pagina.
   Va caricato subito dopo <div id="testata">: disegna la testata prima del resto della pagina. */
(function () {
  'use strict';

  const corpo = document.body;
  const pagina = corpo.dataset.pagina;
  const privata = corpo.dataset.area === 'privata';
  const params = new URLSearchParams(location.search);

  /* ---------- Memoria del browser: può essere bloccata, quindi ogni accesso è protetto ---------- */
  function leggi(tipo, chiave) { try { return JSON.parse(window[tipo].getItem(chiave)); } catch (e) { return null; } }
  function scrivi(tipo, chiave, valore) { try { window[tipo].setItem(chiave, JSON.stringify(valore)); } catch (e) { /* memoria non disponibile */ } }
  function togli(tipo, chiave) { try { window[tipo].removeItem(chiave); } catch (e) { /* niente da togliere */ } }

  const sessione = leggi('sessionStorage', 'ir-accesso');

  // Area personale senza accesso: si passa dalla pagina di accesso e poi si torna qui
  if (privata && !sessione) {
    const qui = (location.pathname.split('/').pop() || 'cruscotto.html') + location.search + location.hash;
    location.replace('accesso.html?vai=' + encodeURIComponent(qui));
    return;
  }

  /* ---------- Dati di esempio (tutti inventati) ---------- */
  const DATI = {
    nome: 'Giuseppe', cognome: 'Bonetti',
    patente: { categoria: 'B', scadenza: '2029-06-18' },
    punti: {
      saldo: 19, massimo: 30, partenza: 20,
      storico: [
        { data: '2026-11-20', variazione: -3, saldo: 19, motivo: 'Eccesso di velocità, fino a 40 km/h oltre il limite', dettaglio: 'Multa del 17 novembre 2026, Polizia locale di Brescia' },
        { data: '2025-06-12', variazione: 2, saldo: 22, motivo: 'Bonus per due anni senza perdere punti', dettaglio: 'Assegnato in automatico' },
        { data: '2023-06-12', variazione: 2, saldo: 20, motivo: 'Punteggio riportato a 20 dopo due anni senza perdere punti', dettaglio: 'Assegnato in automatico' },
        { data: '2021-06-04', variazione: -2, saldo: 18, motivo: 'Svolta senza mettere la freccia', dettaglio: 'Multa del 28 maggio 2021, Polizia locale di Brescia' }
      ]
    },
    veicoli: [
      { targa: 'XA482KT', nome: 'Fiat Panda', tipo: 'Autovettura', immatricolazione: 'Dicembre 2018', alimentazione: 'Benzina', potenza: '51 kW (69 CV)', cilindrata: '1.242 cm³', euro: 6,
        revisione: { scadenza: '2026-12-31', ultima: '2024-12-12', esito: 'Regolare', km: '48.210 km', centro: 'Centro revisioni di esempio, Brescia' } },
      { targa: 'XB10734', nome: 'Piaggio Liberty 125', tipo: 'Motociclo', immatricolazione: 'Settembre 2019', alimentazione: 'Benzina', potenza: '7,6 kW (10,3 CV)', cilindrata: '124 cm³', euro: 4,
        revisione: { scadenza: '2027-09-30', ultima: '2025-09-15', esito: 'Regolare', km: '9.870 km', centro: 'Centro revisioni di esempio, Brescia' } }
    ]
  };

  /* ---------- Date e stati ---------- */
  const OGGI = new Date(); OGGI.setHours(0, 0, 0, 0);
  const fmt = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
  function data(iso) { const p = iso.split('-'); return new Date(+p[0], p[1] - 1, +p[2]); }
  function lunga(d) { return fmt.format(typeof d === 'string' ? data(d) : d); }
  function giorni(iso) { return Math.round((data(iso) - OGGI) / 864e5); }
  function ora() { return new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }); }
  // Sotto i 60 giorni la scadenza diventa un avviso
  function stato(iso) {
    const g = giorni(iso);
    if (g < 0) return { tipo: 'errore', icona: 'errore', testo: 'Scaduta da ' + (-g) + (g === -1 ? ' giorno' : ' giorni') };
    if (g <= 60) return { tipo: 'attenzione', icona: 'attenzione', testo: g === 0 ? 'Scade oggi' : 'Scade tra ' + g + (g === 1 ? ' giorno' : ' giorni') };
    return { tipo: 'ok', icona: 'spunta', testo: 'In regola' };
  }

  /* ---------- Pezzi di HTML ---------- */
  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function ico(n) { return `<svg class="icona" aria-hidden="true" focusable="false"><use href="#i-${n}"></use></svg>`; }
  function chip(s) { return `<span class="stato stato-${s.tipo}">${ico(s.icona)}${s.testo}</span>`; }
  function targaTesto(t) { return /^[A-Z]{2}\d{3}[A-Z]{2}$/.test(t) ? `${t.slice(0, 2)} ${t.slice(2, 5)} ${t.slice(5)}` : `${t.slice(0, 2)} ${t.slice(2)}`; }
  function targa(t, grande) { return `<span class="targa${grande ? ' targa-grande' : ''}"><span class="targa-i" aria-hidden="true">I</span><span class="targa-testo"><span class="vh">Targa </span>${targaTesto(t)}</span></span>`; }
  const ICONE_AVVISO = { ok: 'spunta', attenzione: 'attenzione', errore: 'errore', info: 'info' };
  function avvisoHtml(tipo, titolo, testo, chiudibile) {
    return `<div class="avviso avviso-${tipo}" role="${tipo === 'errore' ? 'alert' : 'status'}" tabindex="-1">${ico(ICONE_AVVISO[tipo])}` +
      `<div class="avviso-corpo"><p><strong>${titolo}</strong></p>${testo ? `<p>${testo}</p>` : ''}</div>` +
      (chiudibile ? `<button type="button" class="avviso-chiudi" aria-label="Chiudi il messaggio">${ico('chiudi')}</button>` : '') + '</div>';
  }
  function avviso(tipo, titolo, testo, chiudibile) {
    const t = document.createElement('template');
    t.innerHTML = avvisoHtml(tipo, titolo, testo, chiudibile);
    return t.content.firstChild;
  }

  /* ---------- Icone (disegnate a mano, tratto 2px su griglia 24) ---------- */
  const ICONE = {
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    chiudi: '<path d="M6 6l12 12M18 6 6 18"/>',
    avanti: '<path d="m9 6 6 6-6 6"/>',
    spunta: '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.7 2.7 5.5-5.7"/>',
    attenzione: '<path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4.5M12 17.3v.2"/>',
    errore: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.6v.2"/>',
    patente: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10.5" r="2"/><path d="M5.5 15.5c.6-1.3 1.7-2 3-2s2.4.7 3 2M14 10h4M14 14h4"/>',
    calendario: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    auto: '<path d="M4.5 17H3v-4l2.2-5A2 2 0 0 1 7 6.8h10a2 2 0 0 1 1.8 1.2L21 13v4h-1.5M8.5 17h7M3 13h18"/><circle cx="6.5" cy="17" r="2"/><circle cx="17.5" cy="17" r="2"/>',
    scarica: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    lucchetto: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    esci: '<path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M16 16l4-4-4-4M20 12H10"/>',
    cruscotto: '<path d="M4 17a8 8 0 1 1 16 0M12 17l3.5-5M3 17h18"/>',
    utente: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/>',
    agenzia: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M3 13h18"/>',
    camion: '<path d="M3 6h11v11H3zM14 10h4l3 3v4h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
    ente: '<path d="M4 21V9l8-5 8 5v12M3 21h18M9 21v-6h6v6"/>',
    scudo: '<path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/>',
    cerca: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.4-4.4"/>',
    meno: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
    piu: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8M12 8v8"/>'
  };
  corpo.insertAdjacentHTML('afterbegin', '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">' +
    Object.keys(ICONE).map(k => `<symbol id="i-${k}" viewBox="0 0 24 24">${ICONE[k]}</symbol>`).join('') + '</svg>');

  // Logo: cartello quadrato blu con bordo bianco, come i cartelli di indicazione, e una spunta
  const LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><rect width="32" height="32" rx="6" fill="#0059b3"/><rect x="2.5" y="2.5" width="27" height="27" rx="4" fill="none" stroke="#fff" stroke-width="1.6"/><path d="m9.5 16.5 4.3 4.3 8.7-9.6" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ---------- Testata, menu e barra in basso ---------- */
  const MENU = [
    ['punti.html', 'patente', 'Quanti punti ho', 'punti'],
    ['cruscotto.html#scadenze', 'calendario', 'Le mie scadenze', 'cruscotto'],
    ['veicolo.html', 'auto', 'I miei veicoli', 'veicolo'],
    ['index.html#revisione', 'cerca', 'Controlla una revisione con la targa', '']
  ];
  const PRO = [
    ['accesso.html?profilo=operatori', 'agenzia', 'Agenzie di pratiche auto e autoscuole', 'Agenzie e autoscuole'],
    ['accesso.html?profilo=imprese', 'camion', 'Imprese di autotrasporto', 'Imprese di autotrasporto'],
    ['accesso.html?profilo=enti', 'ente', 'Enti pubblici', 'Enti pubblici']
  ];
  const BARRA = [
    ['cruscotto.html', 'cruscotto', 'Riepilogo', 'cruscotto'],
    ['punti.html', 'patente', 'Punti', 'punti'],
    ['veicolo.html', 'auto', 'Veicoli', 'veicolo']
  ];
  const attuale = key => key && key === pagina ? ' aria-current="page"' : '';

  const testata =
    '<a class="salta" href="#contenuto">Vai al contenuto</a>' +
    '<div class="fascia"><div class="contenitore"><p>Progetto d\'esame UX/UI: non è un sito ufficiale. I dati sono di esempio.</p>' +
      '<nav class="fascia-pro" aria-label="Accesso per i professionisti"><span>Accesso dedicato:</span>' +
      PRO.map(p => `<a href="${p[0]}">${p[3]}</a>`).join('') + '</nav></div></div>' +
    '<header class="testata"><div class="contenitore testata-riga">' +
      `<a class="logo" href="index.html">${LOGO}<span>In regola</span></a>` +
      '<div class="testata-azioni">' +
        (sessione
          ? `<a class="btn-testata solo-largo" href="cruscotto.html">${ico('utente')}${DATI.nome}</a><button class="btn-testata" type="button" data-esci>${ico('esci')}Esci</button>`
          : `<a class="btn-testata" href="accesso.html">${ico('lucchetto')}Entra</a>`) +
        `<button class="btn-testata btn-menu" type="button" aria-expanded="false" aria-controls="menu">${ico('menu')}<span>Menu</span></button>` +
      '</div></div>' +
      '<nav class="menu" id="menu" aria-label="Menu principale"><div class="contenitore">' +
        '<ul class="menu-cittadino">' + MENU.map(m => `<li><a href="${m[0]}"${attuale(m[3])}>${ico(m[1])}${m[2]}</a></li>`).join('') + '</ul>' +
        '<div class="menu-pro"><p class="menu-gruppo" id="menu-pro-t">Accesso dedicato per</p><ul aria-labelledby="menu-pro-t">' +
        PRO.map(p => `<li><a href="${p[0]}">${ico(p[1])}${p[2]}</a></li>`).join('') + '</ul></div>' +
      '</div></nav>' +
    '</header>' +
    (privata ? '<nav class="barra" aria-label="La tua area">' + BARRA.map(b => `<a href="${b[0]}"${attuale(b[3])}>${ico(b[1])}${b[2]}</a>`).join('') + '</nav>' : '');

  document.getElementById('testata').outerHTML = testata;
  if (privata) corpo.classList.add('con-barra');

  const btnMenu = document.querySelector('.btn-menu');
  const menu = document.getElementById('menu');
  function apriMenu(aperto) {
    menu.classList.toggle('aperto', aperto);
    btnMenu.setAttribute('aria-expanded', aperto);
    btnMenu.querySelector('span').textContent = aperto ? 'Chiudi' : 'Menu';
    btnMenu.querySelector('use').setAttribute('href', aperto ? '#i-chiudi' : '#i-menu');
  }
  btnMenu.addEventListener('click', () => apriMenu(!menu.classList.contains('aperto')));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('aperto')) { apriMenu(false); btnMenu.focus(); }
  });

  /* ---------- Cookie: la scelta vale 6 mesi, poi si richiede ---------- */
  const COOKIE = 'ir-cookie';
  const SEI_MESI = 182 * 864e5;
  function sceltaCookie() { const c = leggi('localStorage', COOKIE); return c && Date.now() - c.quando < SEI_MESI ? c : null; }
  function salvaCookie(statistiche) {
    const c = { statistiche: !!statistiche, quando: Date.now() };
    scrivi('localStorage', COOKIE, c);
    document.dispatchEvent(new CustomEvent('ir-cookie'));
    return c;
  }
  function descriviScelta(c) { return c.statistiche ? 'cookie tecnici e di statistica' : 'solo cookie tecnici'; }

  function apriBanner(dettagli) {
    const vecchio = document.querySelector('.cookie');
    if (vecchio) vecchio.remove();
    const c = sceltaCookie();
    const b = document.createElement('section');
    b.className = 'cookie';
    b.setAttribute('aria-labelledby', 'cookie-t');
    b.innerHTML = '<div class="contenitore">' +
      '<h2 id="cookie-t" tabindex="-1">Scegli quali cookie usare</h2>' +
      '<p>Usiamo cookie tecnici, necessari per farti entrare e ricordare le tue scelte. Se sei d\'accordo, useremo anche cookie di statistica anonimi, per capire quali pagine sono difficili da usare. Niente pubblicità. <a href="privacy.html#cookie">Leggi i dettagli</a></p>' +
      `<div class="cookie-scelte"${dettagli ? '' : ' hidden'}>` +
        '<label class="spunta"><input type="checkbox" checked disabled><span><strong>Tecnici</strong><br><span class="aiuto">Sempre attivi: senza questi il sito non funziona.</span></span></label>' +
        `<label class="spunta"><input type="checkbox" id="ck-stat"${c && c.statistiche ? ' checked' : ''}><span><strong>Statistiche</strong><br><span class="aiuto">Facoltativi: contano le visite in forma anonima.</span></span></label>` +
      '</div>' +
      '<div class="bottoni">' +
        '<button type="button" class="btn btn-primario" data-c="tutti">Accetta tutti</button>' +
        '<button type="button" class="btn btn-primario" data-c="necessari">Rifiuta i facoltativi</button>' +
        `<button type="button" class="btn btn-secondario" data-c="${dettagli ? 'salva' : 'scegli'}">${dettagli ? 'Salva le mie scelte' : 'Scegli tu'}</button>` +
      '</div>' +
      `<button type="button" class="cookie-chiudi" data-c="necessari" aria-label="Chiudi e usa solo i cookie tecnici">${ico('chiudi')}</button>` +
    '</div>';
    document.querySelector('.salta').after(b);
    b.addEventListener('click', e => {
      const t = e.target.closest('[data-c]');
      if (!t) return;
      const azione = t.dataset.c;
      if (azione === 'ok') { b.remove(); return; }
      if (azione === 'scegli') {
        b.querySelector('.cookie-scelte').hidden = false;
        t.dataset.c = 'salva';
        t.textContent = 'Salva le mie scelte';
        b.querySelector('#ck-stat').focus();
        return;
      }
      const scelta = salvaCookie(azione === 'tutti' || (azione === 'salva' && b.querySelector('#ck-stat').checked));
      b.querySelector('.contenitore').innerHTML =
        avvisoHtml('ok', `Scelta salvata: ${descriviScelta(scelta)}.`, 'Puoi cambiarla quando vuoi da “Preferenze cookie”, in fondo a ogni pagina.') +
        '<div class="bottoni"><button type="button" class="btn btn-secondario" data-c="ok">Ho capito, chiudi</button></div>';
      b.querySelector('[data-c="ok"]').focus();
    });
    return b;
  }

  /* ---------- PDF (ricevute e attestati): la libreria si carica solo quando serve ---------- */
  function conPdf(fai, siSbaglia) {
    if (window.jspdf) { fai(); return; }
    const s = document.createElement('script');
    s.src = 'assets/vendor/jspdf.umd.min.js';
    s.onload = fai;
    s.onerror = siSbaglia;
    document.head.appendChild(s);
  }
  function creaPdf(nomeFile, titolo, righe) {
    const doc = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4' });
    doc.setFillColor(11, 47, 87); doc.rect(0, 0, 210, 24, 'F');
    doc.setTextColor(255); doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.text('In regola', 20, 15);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    doc.text('Progetto didattico d\'esame: documento di esempio, senza valore legale', 190, 15, { align: 'right' });
    doc.setTextColor(23, 33, 46); doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.text(titolo, 20, 42);
    let y = 56;
    doc.setFontSize(11);
    righe.forEach(r => {
      const testo = doc.splitTextToSize(String(r[1]), 115);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(74, 86, 102); doc.text(r[0], 20, y);
      doc.setFont('helvetica', 'bold'); doc.setTextColor(23, 33, 46); doc.text(testo, 75, y);
      y += 6 * testo.length + 4;
    });
    doc.setDrawColor(211, 218, 227); doc.line(20, y, 190, y);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(74, 86, 102);
    doc.text(`Creato il ${lunga(new Date())} alle ${ora()}. Codice documento: IR-${Date.now().toString(36).toUpperCase()}`, 20, y + 8);
    doc.save(nomeFile);
  }
  function bottoneRicevuta(btn, esito, nomeFile, titolo, righe) {
    btn.addEventListener('click', () => {
      btn.disabled = true;
      const errore = () => {
        esito.replaceChildren(avviso('errore', 'Non siamo riusciti a creare il file.', 'Controlla la connessione a internet e premi di nuovo il pulsante.'));
        btn.disabled = false;
      };
      conPdf(() => {
        try {
          creaPdf(nomeFile, titolo, righe);
          esito.replaceChildren(avviso('ok', `File scaricato: ${nomeFile}`, 'Lo trovi nella cartella Download del telefono o del computer.'));
        } catch (e) { errore(); return; }
        btn.disabled = false;
      }, errore);
    });
  }
  const oggiFile = `${OGGI.getFullYear()}-${String(OGGI.getMonth() + 1).padStart(2, '0')}-${String(OGGI.getDate()).padStart(2, '0')}`;

  /* ---------- Pagine ---------- */
  const trova = t => DATI.veicoli.find(v => v.targa === t);

  function initHome() {
    const form = document.getElementById('form-targa');
    const input = document.getElementById('targa');
    const errore = document.getElementById('targa-errore');
    const campo = input.closest('.campo');
    const esito = document.getElementById('esito-targa');
    // Le targhe italiane non usano I, O, Q, U
    const AUTO = /^[A-HJ-NPR-TV-Z]{2}\d{3}[A-HJ-NPR-TV-Z]{2}$/;
    const MOTO = /^[A-HJ-NPR-TV-Z]{2}\d{5}$/;
    function sbaglia(msg) {
      errore.innerHTML = ico('errore') + '<span>' + msg + '</span>';
      errore.hidden = false;
      input.setAttribute('aria-invalid', 'true');
      campo.classList.add('campo-errore');
      esito.replaceChildren();
      input.focus();
    }
    form.addEventListener('submit', e => {
      e.preventDefault();
      const v = input.value.toUpperCase().replace(/[\s.\-]/g, '');
      if (!v) return sbaglia('Scrivi la targa del veicolo, ad esempio XA 482 KT.');
      if (!/^[A-Z0-9]+$/.test(v)) return sbaglia('La targa contiene solo lettere e numeri. Togli gli altri simboli.');
      if (!AUTO.test(v) && !MOTO.test(v)) {
        return sbaglia(/[IOQU]/.test(v)
          ? 'Le targhe non usano le lettere I, O, Q e U. Forse hai scritto la lettera O al posto dello zero, o la I al posto dell\'uno?'
          : 'Controlla la targa: le auto hanno 2 lettere, 3 numeri e 2 lettere (come XA 482 KT), le moto 2 lettere e 5 numeri.');
      }
      const veicolo = trova(v);
      if (!veicolo) return sbaglia(`Non troviamo un veicolo con targa ${esc(targaTesto(v))}. Controlla di averla scritta giusta. In questo prototipo funzionano le targhe di esempio XA 482 KT e XB 10734.`);
      errore.hidden = true;
      input.removeAttribute('aria-invalid');
      campo.classList.remove('campo-errore');
      const r = veicolo.revisione;
      esito.innerHTML = '<div class="pannello pila-s">' +
        `<div class="riga-titolo"><h3>${veicolo.nome}</h3>${targa(veicolo.targa)}</div>` +
        `<p class="scadenza-grande">Revisione da fare entro il <strong>${lunga(r.scadenza)}</strong></p>` +
        `<p>${chip(stato(r.scadenza))}</p>` +
        `<p>Ultima revisione: ${lunga(r.ultima)}, esito ${r.esito.toLowerCase()}, ${r.km}.</p>` +
        `<p>Per vedere tutti i dati del veicolo e scaricare la ricevuta, <a href="veicolo.html?targa=${veicolo.targa}">entra nella tua area</a>.</p>` +
      '</div>';
    });
  }

  function initAccesso() {
    // Solo pagine interne: evita che il parametro porti su altri siti
    const VAI_OK = /^(cruscotto|punti|veicolo)\.html(\?[\w=&%-]*)?(#[\w-]*)?$/;
    let vai = params.get('vai') || 'cruscotto.html';
    if (!VAI_OK.test(vai)) vai = 'cruscotto.html';
    if (sessione) { location.replace(vai); return; }

    const DEST = {
      punti: 'Dopo l\'accesso ti mostriamo subito i tuoi punti patente.',
      veicolo: 'Dopo l\'accesso ti mostriamo i dati e la revisione dei tuoi veicoli.',
      cruscotto: 'Dopo l\'accesso vedi in una sola pagina punti, scadenze e veicoli.'
    };
    document.getElementById('destinazione').textContent = DEST[vai.split('.')[0]];

    const PROFILI = { operatori: 'agenzie di pratiche auto e autoscuole', imprese: 'imprese di autotrasporto', enti: 'enti pubblici' };
    const profilo = PROFILI[params.get('profilo')];
    if (profilo) {
      const titolo = 'Accesso per ' + profilo;
      document.getElementById('titolo-accesso').textContent = titolo;
      document.getElementById('briciola-accesso').textContent = titolo;
      document.title = titolo.charAt(0).toUpperCase() + titolo.slice(1) + ' | In regola';
      document.getElementById('destinazione').textContent = 'Un ingresso separato per chi usa il portale per lavoro.';
      document.getElementById('area-profilo').hidden = false;
      document.getElementById('percorso').hidden = true;
      return;
    }

    const form = document.getElementById('form-accesso');
    const cosaServe = document.getElementById('cosa-serve');
    const passo2 = document.getElementById('passo-2');
    const boxGestore = document.getElementById('campo-gestore');
    const gestore = document.getElementById('gestore');
    const erroreAccesso = document.getElementById('errore-accesso');
    const radio = form.querySelectorAll('input[name="metodo"]');
    const metodo = () => { const r = form.querySelector('input[name="metodo"]:checked'); return r ? r.value : ''; };

    function mostraErrore(id, msg) {
      const p = document.getElementById(id + '-errore');
      p.innerHTML = ico('errore') + '<span>' + msg + '</span>';
      p.hidden = false;
      p.closest('.campo').classList.add('campo-errore');
      if (id === 'gestore') gestore.setAttribute('aria-invalid', 'true');
    }
    function pulisciErrore(id) {
      const p = document.getElementById(id + '-errore');
      p.hidden = true;
      p.closest('.campo').classList.remove('campo-errore');
      if (id === 'gestore') gestore.removeAttribute('aria-invalid');
    }

    const pre = params.get('metodo');
    if (pre === 'spid' || pre === 'cie') form.querySelector(`input[value="${pre}"]`).checked = true;
    const aggiorna = () => { boxGestore.hidden = metodo() !== 'spid'; };
    aggiorna();
    radio.forEach(r => r.addEventListener('change', () => { aggiorna(); pulisciErrore('metodo'); }));
    gestore.addEventListener('change', () => pulisciErrore('gestore'));

    form.addEventListener('submit', e => {
      e.preventDefault();
      erroreAccesso.replaceChildren();
      const m = metodo();
      if (!m) { mostraErrore('metodo', 'Scegli come vuoi entrare: con SPID o con la CIE.'); radio[0].focus(); return; }
      if (m === 'spid' && !gestore.value) {
        mostraErrore('gestore', 'Scegli dall\'elenco il gestore che ti ha dato SPID. Se non lo ricordi, apri “Non ricordo il gestore” qui sotto.');
        gestore.focus();
        return;
      }
      const titolo = document.getElementById('titolo-passo-2');
      if (m === 'spid') {
        titolo.textContent = 'Conferma su ' + gestore.value;
        document.getElementById('testo-passo-2').textContent = `In un servizio vero qui si apre la pagina di ${gestore.value}: scrivi nome utente e password di SPID, poi confermi con l'app o con il codice che ricevi via SMS.`;
      } else {
        titolo.textContent = 'Appoggia la carta al telefono';
        document.getElementById('testo-passo-2').textContent = 'In un servizio vero qui apri l\'app CieID, appoggi la carta sul retro del telefono e scrivi il PIN di 8 cifre.';
      }
      form.hidden = true;
      cosaServe.hidden = true;
      passo2.hidden = false;
      titolo.focus();
    });

    document.getElementById('annulla').addEventListener('click', () => {
      passo2.hidden = true;
      form.hidden = false;
      cosaServe.hidden = false;
      const a = avviso('errore', 'Accesso non completato.', 'Hai annullato sul sito del gestore, quindi non sei entrato. Non è cambiato nulla e non hai pagato niente. Per riprovare premi “Continua”.');
      erroreAccesso.replaceChildren(a);
      a.focus();
    });

    document.getElementById('conferma').addEventListener('click', e => {
      const btn = e.currentTarget;
      const m = metodo();
      btn.disabled = true;
      btn.textContent = 'Accesso in corso…';
      setTimeout(() => {
        scrivi('sessionStorage', 'ir-accesso', { metodo: m, quando: Date.now() });
        const [base, hash] = vai.split('#');
        location.href = base + (base.includes('?') ? '&' : '?') + 'benvenuto=' + m + (hash ? '#' + hash : '');
      }, 700);
    });
  }

  function initCruscotto() {
    const h = new Date().getHours();
    document.getElementById('saluto').textContent = `${h < 13 ? 'Buongiorno' : h < 18 ? 'Buon pomeriggio' : 'Buonasera'}, ${DATI.nome}`;

    const voci = [
      { cosa: 'Rinnovo della patente ' + DATI.patente.categoria, soggetto: 'La patente', azione: 'Va rinnovata', data: DATI.patente.scadenza }
    ].concat(DATI.veicoli.map(v => ({
      cosa: 'Revisione ' + v.nome, soggetto: 'La revisione della ' + v.nome, azione: 'Va fatta', data: v.revisione.scadenza,
      targa: v.targa, link: `veicolo.html?targa=${v.targa}#revisione`
    }))).sort((a, b) => a.data.localeCompare(b.data));

    document.getElementById('lista-scadenze').innerHTML = voci.map(x =>
      '<li><div class="pila-xs">' +
        `<p class="cosa">${x.link ? `<a href="${x.link}">${x.cosa}</a>` : x.cosa}</p>` +
        `<p class="aiuto">Entro il ${lunga(x.data)}${x.targa ? ', targa ' + targaTesto(x.targa) : ''}</p>` +
      `</div>${chip(stato(x.data))}</li>`).join('');

    const urgenti = voci.filter(x => stato(x.data).tipo !== 'ok');
    document.getElementById('da-fare').innerHTML = urgenti.length
      ? urgenti.map(x => {
          const g = giorni(x.data);
          const quando = g < 0 ? `è scaduta da ${-g} giorni` : g === 0 ? 'scade oggi' : `scade tra ${g} ${g === 1 ? 'giorno' : 'giorni'}`;
          const link = x.link ? ` <a href="${x.link}">Vedi come prenotarla</a>` : '';
          return avvisoHtml(g < 0 ? 'errore' : 'attenzione', `${x.soggetto} ${quando}.`, `${x.azione} entro il ${lunga(x.data)}.${link}`);
        }).join('')
      : avvisoHtml('ok', 'Nessuna scadenza nei prossimi 60 giorni.', 'Ti avvisiamo qui quando qualcosa sta per scadere.');

    document.getElementById('lista-veicoli').innerHTML = DATI.veicoli.map(v =>
      `<li><a href="veicolo.html?targa=${v.targa}">${ico('auto')}` +
      `<span class="pila-xs"><span class="nome">${v.nome}</span><span class="aiuto">${v.tipo}, ${v.alimentazione.toLowerCase()}, Euro ${v.euro}</span></span>` +
      `${targa(v.targa)}${ico('avanti')}</a></li>`).join('');
  }

  function initPunti() {
    const P = DATI.punti;
    const pieno = document.querySelector('.scala-pieno');
    pieno.style.width = (P.saldo / P.massimo * 100) + '%';
    document.querySelector('.scala-tacca').style.left = (P.partenza / P.massimo * 100) + '%';
    document.querySelector('.scala').setAttribute('aria-label', `${P.saldo} punti su un massimo di ${P.massimo}. Si parte da ${P.partenza}.`);

    document.getElementById('lista-storico').innerHTML = P.storico.map(x => {
      const meno = x.variazione < 0;
      const n = Math.abs(x.variazione);
      return `<li><time datetime="${x.data}">${lunga(x.data)}</time>` +
        `<span class="variazione variazione-${meno ? 'meno' : 'piu'}">${ico(meno ? 'meno' : 'piu')}${n} punti ${meno ? 'tolti' : 'aggiunti'}</span>` +
        `<p class="motivo">${x.motivo}</p><p class="dettaglio">${x.dettaglio}</p>` +
        `<span class="saldo-dopo">Saldo: ${x.saldo}</span></li>`;
    }).join('');

    const ultima = P.storico[0];
    bottoneRicevuta(document.getElementById('scarica-punti'), document.getElementById('esito-punti'),
      `attestato-punti-${oggiFile}.pdf`, 'Attestato del saldo punti patente', [
        ['Intestatario', `${DATI.nome} ${DATI.cognome} (dati di esempio)`],
        ['Patente', `Categoria ${DATI.patente.categoria}, valida fino al ${lunga(DATI.patente.scadenza)}`],
        ['Saldo punti', `${P.saldo} punti (massimo ${P.massimo})`],
        ['Aggiornato al', lunga(OGGI)],
        ['Ultima variazione', `${ultima.variazione} punti il ${lunga(ultima.data)}: ${ultima.motivo.toLowerCase()}`]
      ]);
  }

  function initVeicolo() {
    const t = (params.get('targa') || '').toUpperCase();
    const v = t ? trova(t) : DATI.veicoli[0];
    document.getElementById('scelta-veicolo').innerHTML = DATI.veicoli.map(x =>
      `<li><a href="veicolo.html?targa=${x.targa}"${v && x.targa === v.targa ? ' aria-current="page"' : ''}>${x.nome}${targa(x.targa)}</a></li>`).join('');
    const scheda = document.getElementById('scheda');
    if (!v) {
      scheda.innerHTML = '<h1 class="vh">Veicolo non trovato</h1>' + avvisoHtml('errore', 'Non troviamo questo veicolo tra quelli intestati a te.', 'Scegli uno dei tuoi veicoli qui sopra. Se un veicolo manca, controlla che il passaggio di proprietà sia stato registrato.');
      return;
    }
    document.title = `${v.nome}: revisione e dati | In regola`;
    document.getElementById('briciola-veicolo').textContent = v.nome;
    const r = v.revisione;
    const s = stato(r.scadenza);
    const nota = s.tipo === 'ok' ? '' : avvisoHtml(s.tipo,
      s.tipo === 'errore' ? 'La revisione è scaduta.' : 'Prenota la revisione per tempo.',
      s.tipo === 'errore' ? 'Finché non la fai non puoi circolare con questo veicolo: rischi una multa.' : `Dopo il ${lunga(r.scadenza)} non potrai circolare con questo veicolo finché non la fai.`);
    const riga = (dt, dd) => `<div><dt>${dt}</dt><dd>${dd}</dd></div>`;

    scheda.innerHTML =
      '<div class="pila">' +
        '<div class="pila-s">' +
          `<h1>${v.nome}</h1>` +
          `<div class="riga-titolo">${targa(v.targa, true)}<span class="aiuto">${v.tipo}, ${v.alimentazione.toLowerCase()}</span></div>` +
        '</div>' +
        '<div class="veicolo-griglia">' +
          '<section id="revisione" class="pannello pila-s" aria-labelledby="t-rev">' +
            '<h2 id="t-rev">Revisione</h2>' +
            `<p class="scadenza-grande">Da fare entro il <strong>${lunga(r.scadenza)}</strong></p>` +
            `<p>${chip(s)}</p>` + nota +
            '<dl class="dati">' +
              riga('Ultima revisione', lunga(r.ultima)) + riga('Esito', r.esito) +
              riga('Chilometri rilevati', r.km) + riga('Dove', r.centro) +
            '</dl>' +
            '<h3>Come fare la revisione</h3>' +
            '<ul class="puntato">' +
              '<li>Prenota in un centro di revisione autorizzato o alla Motorizzazione.</li>' +
              '<li>Porta il libretto del veicolo (la carta di circolazione).</li>' +
              '<li>Paghi direttamente al centro. Su questo sito non si paga nulla.</li>' +
              '<li>Dopo la revisione, la nuova scadenza compare qui entro qualche giorno.</li>' +
            '</ul>' +
            `<div class="bottoni"><button class="btn btn-secondario" type="button" id="scarica-revisione">${ico('scarica')}Scarica la ricevuta dell'ultima revisione</button></div>` +
            '<div id="esito-revisione"></div>' +
          '</section>' +
          '<div class="pila">' +
            '<section class="pila-s" aria-labelledby="t-dati">' +
              '<h2 id="t-dati">Dati principali</h2>' +
              '<dl class="dati">' +
                riga('Targa', targaTesto(v.targa)) + riga('Tipo', v.tipo) + riga('Marca e modello', v.nome) +
                riga('Prima immatricolazione', v.immatricolazione) + riga('Alimentazione', v.alimentazione) +
                riga('Potenza', v.potenza) + riga('Cilindrata', v.cilindrata) +
                riga('Intestato a', `${DATI.nome} ${DATI.cognome}`) +
              '</dl>' +
            '</section>' +
            '<section id="classe" class="pila-s" aria-labelledby="t-classe">' +
              `<h2 id="t-classe">Classe ambientale: Euro ${v.euro}</h2>` +
              '<p>Dice quanto inquina il veicolo. Va da Euro 0, i veicoli più vecchi, a Euro 6, i più recenti.</p>' +
              '<div><ol class="euro" aria-label="Classi ambientali da Euro 0 a Euro 6">' +
                [0, 1, 2, 3, 4, 5, 6].map(n => n === v.euro
                  ? `<li class="attuale" aria-current="true"><span class="vh">Euro </span>${n}<span class="vh">: il tuo veicolo</span></li>`
                  : `<li><span class="vh">Euro </span>${n}</li>`).join('') +
              '</ol><div class="euro-estremi" aria-hidden="true"><span>Più vecchi</span><span>Più recenti</span></div></div>' +
              `<p>Il tuo veicolo è <strong>Euro ${v.euro}</strong>. Ti serve per sapere se puoi entrare nelle zone a traffico limitato o circolare nei giorni di blocco del traffico: le regole le decidono il tuo Comune e la tua Regione.</p>` +
            '</section>' +
          '</div>' +
        '</div>' +
      '</div>';

    bottoneRicevuta(document.getElementById('scarica-revisione'), document.getElementById('esito-revisione'),
      `ricevuta-revisione-${v.targa}.pdf`, 'Ricevuta dell\'ultima revisione', [
        ['Veicolo', `${v.nome}, targa ${targaTesto(v.targa)}`],
        ['Intestatario', `${DATI.nome} ${DATI.cognome} (dati di esempio)`],
        ['Data revisione', lunga(r.ultima)],
        ['Esito', r.esito],
        ['Chilometri rilevati', r.km],
        ['Centro di revisione', r.centro],
        ['Prossima scadenza', 'Entro il ' + lunga(r.scadenza)]
      ]);
  }

  function initPrivacy() {
    const form = document.getElementById('form-cookie');
    const ck = document.getElementById('pref-stat');
    const statoTesto = document.getElementById('stato-cookie');
    const esito = document.getElementById('esito-cookie');
    function mostra() {
      const c = sceltaCookie();
      ck.checked = !!(c && c.statistiche);
      statoTesto.textContent = c
        ? `Scelta attuale, salvata il ${lunga(new Date(c.quando))}: ${descriviScelta(c)}.`
        : 'Non hai ancora fatto una scelta: per ora usiamo solo i cookie tecnici.';
    }
    mostra();
    document.addEventListener('ir-cookie', mostra);
    form.addEventListener('submit', e => {
      e.preventDefault();
      const c = salvaCookie(ck.checked);
      const banner = document.querySelector('.cookie');
      if (banner) banner.remove();
      esito.replaceChildren(avviso('ok', `Scelte salvate: ${descriviScelta(c)}.`, 'Valgono per 6 mesi, poi te lo chiediamo di nuovo.'));
    });
  }

  /* ---------- Quando la pagina è pronta ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('piede').outerHTML =
      '<footer class="piede"><div class="contenitore"><div class="piede-griglia">' +
        `<div><a class="logo" href="index.html">${LOGO}<span>In regola</span></a>` +
        '<p>Progetto didattico d\'esame UX/UI, ITS Machina Lonati, MARTECH 2° anno. Non è il sito del Ministero e non è collegato a servizi ufficiali. Nomi, targhe e numeri sono di fantasia.</p></div>' +
        '<div><h2>Assistenza</h2><p>Numero verde 800 000 000 (esempio)<br>dal lunedì al venerdì, dalle 8 alle 18</p><p>Email: assistenza@example.org</p></div>' +
        '<div><h2>Informazioni legali</h2><ul>' +
          '<li><a href="privacy.html">Privacy e cookie</a></li>' +
          '<li><button type="button" class="btn-testo" data-apri-cookie>Preferenze cookie</button></li>' +
          '<li><a href="privacy.html#note-legali">Note legali</a></li>' +
          '<li><a href="privacy.html#accessibilita">Dichiarazione di accessibilità</a></li>' +
        '</ul></div>' +
      '</div><div class="piede-fondo">' +
        '<p>Ente gestore (esempio): Via dell\'Esempio 1, 00100 Roma</p>' +
        '<p>Codice fiscale 00000000000. PEC: ente@pec.example.org</p>' +
      '</div></div></footer>';

    document.querySelectorAll('[data-oggi]').forEach(el => { el.textContent = lunga(OGGI); });
    document.querySelectorAll('[data-saldo]').forEach(el => { el.textContent = DATI.punti.saldo; });
    document.querySelectorAll('[data-se]').forEach(el => { el.hidden = (el.dataset.se === 'utente') !== !!sessione; });

    document.addEventListener('click', e => {
      if (e.target.closest('[data-esci]')) {
        togli('sessionStorage', 'ir-accesso');
        location.href = 'index.html?uscito=1';
      } else if (e.target.closest('[data-apri-cookie]')) {
        apriBanner(true).querySelector('h2').focus();
      } else if (e.target.closest('.avviso-chiudi')) {
        e.target.closest('.avviso').remove();
      }
    });

    // Conferme dopo accesso e uscita
    const primo = document.querySelector('main .contenitore');
    let pulisci = false;
    if (params.get('benvenuto')) {
      primo.prepend(avviso('ok', `Accesso eseguito con ${params.get('benvenuto') === 'cie' ? 'la CIE' : 'SPID'}.`, 'Quando hai finito, premi “Esci” in alto.', true));
      params.delete('benvenuto'); pulisci = true;
    }
    if (params.get('uscito')) {
      primo.prepend(avviso('ok', 'Sei uscito dalla tua area personale.', 'Se il telefono o il computer non è tuo, chiudi anche il browser.', true));
      params.delete('uscito'); pulisci = true;
    }
    if (pulisci) {
      const q = params.toString();
      history.replaceState(null, '', location.pathname + (q ? '?' + q : '') + location.hash);
    }

    ({ home: initHome, accesso: initAccesso, cruscotto: initCruscotto, punti: initPunti, veicolo: initVeicolo, privacy: initPrivacy }[pagina] || (() => {}))();

    if (location.hash) { const el = document.getElementById(location.hash.slice(1)); if (el) el.scrollIntoView(); }
    if (!sceltaCookie()) apriBanner(false);
  });
})();
