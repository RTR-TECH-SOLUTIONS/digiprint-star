(() => {
  // Meniul de pe telefon
  const buton = document.querySelector('.burger');
  const panou = document.querySelector('#meniu-mobil');
  if (buton && panou) {
    const seteaza = (deschis) => {
      buton.setAttribute('aria-expanded', String(deschis));
      buton.setAttribute('aria-label', deschis ? 'Închide meniul' : 'Deschide meniul');
      panou.hidden = !deschis;
    };
    buton.addEventListener('click', () => seteaza(buton.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !panou.hidden) {
        seteaza(false);
        buton.focus();
      }
    });
    matchMedia('(min-width: 1100px)').addEventListener('change', (e) => e.matches && seteaza(false));
  }

  // Butonul WhatsApp apare pe prima pagină după hero
  const whatsapp = document.querySelector('.whatsapp');
  const hero = document.querySelector('.hero');
  if (whatsapp && hero) {
    const actualizeaza = () => whatsapp.classList.toggle('ascuns', scrollY < hero.offsetTop + hero.offsetHeight);
    actualizeaza();
    addEventListener('scroll', actualizeaza, { passive: true });
    addEventListener('resize', actualizeaza);
  }

  // Galeria: filtre și mărire
  document.querySelectorAll('[data-galerie]').forEach((g) => {
    const elemente = [...g.querySelectorAll('li[data-serviciu]')];
    const butoaneFiltru = [...g.querySelectorAll('[data-filtru]')];
    const aplica = (cheie) => {
      butoaneFiltru.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filtru === cheie)));
      elemente.forEach((li) => {
        li.hidden = cheie !== 'toate' && !li.dataset.serviciu.split(' ').includes(cheie);
      });
    };
    butoaneFiltru.forEach((b) => b.addEventListener('click', () => aplica(b.dataset.filtru)));
    const dinLink = new URLSearchParams(location.search).get('serviciu');
    if (dinLink && butoaneFiltru.some((b) => b.dataset.filtru === dinLink)) aplica(dinLink);

    const dialog = g.querySelector('dialog');
    const img = dialog.querySelector('img');
    const legenda = dialog.querySelector('figcaption');
    let curent = 0;
    const vizibile = () => elemente.filter((li) => !li.hidden).map((li) => li.querySelector('button'));
    const arata = (i) => {
      const lista = vizibile();
      curent = (i + lista.length) % lista.length;
      const b = lista[curent];
      img.src = b.dataset.mare;
      img.alt = b.dataset.titlu;
      legenda.textContent = b.dataset.titlu;
    };
    elemente.forEach((li) =>
      li.querySelector('button').addEventListener('click', (e) => {
        arata(vizibile().indexOf(e.currentTarget));
        dialog.showModal();
      }),
    );
    dialog.querySelector('.inchide').addEventListener('click', () => dialog.close());
    dialog.querySelector('.st').addEventListener('click', () => arata(curent - 1));
    dialog.querySelector('.dr').addEventListener('click', () => arata(curent + 1));
    dialog.addEventListener('click', (e) => e.target === dialog && dialog.close());
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') arata(curent - 1);
      if (e.key === 'ArrowRight') arata(curent + 1);
    });
  });

  // Harta pornește după încărcarea paginii
  const porneste = () =>
    document.querySelectorAll('iframe[data-harta-src]').forEach((f) => {
      f.addEventListener('load', () => f.classList.add('incarcata'), { once: true });
      f.src = f.dataset.hartaSrc;
      f.removeAttribute('data-harta-src');
    });
  const candLiber = () => ('requestIdleCallback' in window ? requestIdleCallback(porneste, { timeout: 1500 }) : setTimeout(porneste, 200));
  if (document.readyState === 'complete') candLiber();
  else addEventListener('load', candLiber, { once: true });

  // Formularul de ofertă deschide WhatsApp cu mesajul completat
  const form = document.querySelector('#oferta');
  if (form) {
    const camp = (id) => form.querySelector(`#${id}`);
    const nume = camp('nume');
    const telefon = camp('telefon');
    const serviciu = camp('serviciu');
    const cantitate = camp('cantitate');
    const detalii = camp('detalii');
    const eroare = form.querySelector('.eroare');

    const parametri = new URLSearchParams(location.search);
    const dinLink = parametri.get('serviciu');
    if (dinLink && [...serviciu.options].some((o) => o.value === dinLink)) serviciu.value = dinLink;
    const produs = parametri.get('produs');
    if (produs) detalii.value = `${produs.slice(0, 80)}: `;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const lipsa = [];
      if (nume.value.trim().length < 2) lipsa.push([nume, 'numele']);
      if (telefon.value.replace(/\D/g, '').length < 9) lipsa.push([telefon, 'un telefon valid']);
      if (!serviciu.value) lipsa.push([serviciu, 'serviciul']);
      [nume, telefon, serviciu].forEach((c) => c.removeAttribute('aria-invalid'));
      if (lipsa.length) {
        lipsa.forEach(([c]) => c.setAttribute('aria-invalid', 'true'));
        eroare.textContent = `Completează ${lipsa.map(([, t]) => t).join(', ')}.`;
        eroare.hidden = false;
        lipsa[0][0].focus();
        return;
      }
      eroare.hidden = true;
      const titlu = serviciu.selectedOptions[0]?.dataset.titlu ?? '';
      const linii = [
        'Bună ziua, aș dori o ofertă.',
        `Nume: ${nume.value.trim()}`,
        `Telefon: ${telefon.value.trim()}`,
        `Serviciu: ${titlu}`,
        cantitate.value.trim() && `Cantitate: ${cantitate.value.trim()}`,
        detalii.value.trim() && `Detalii: ${detalii.value.trim()}`,
      ].filter(Boolean);
      window.open(`https://wa.me/${form.dataset.whatsapp}?text=${encodeURIComponent(linii.join('\n'))}`, '_blank', 'noopener');
    });
  }
})();
