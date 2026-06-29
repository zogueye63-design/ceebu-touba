/* CEEBU TOUBA — script.js */

/* Curseur */
const cur = document.createElement('div');
cur.className = 'cursor';
document.body.appendChild(cur);
document.addEventListener('mousemove', e => {
  cur.style.transform = `translate(${e.clientX-6}px,${e.clientY-6}px)`;
}, {passive:true});
document.querySelectorAll('a,button,.plat-card,.atout-card,.gal-item').forEach(el => {
  el.addEventListener('mouseenter', () => cur.classList.add('hover'), {passive:true});
  el.addEventListener('mouseleave', () => cur.classList.remove('hover'), {passive:true});
});

/* Header scroll */
window.addEventListener('scroll', () => {
  document.getElementById('header').classList.toggle('scrolled', scrollY > 10);
}, {passive:true});

/* Menu mobile */
const navM = document.getElementById('navMobile');
function toggleMenu() { navM.classList.toggle('open'); }
function closeMenu()  { navM.classList.remove('open'); }

/* Slider */
(function(){
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.getElementById('sliderDots');
  if (!slides.length) return;
  let cur = 0;
  slides.forEach((_,i) => {
    const d = document.createElement('button');
    d.className = 'slider-dot' + (i===0?' active':'');
    d.onclick = () => go(i);
    dots.appendChild(d);
  });
  function go(i) {
    slides[cur].classList.remove('active');
    dots.children[cur].classList.remove('active');
    cur = i;
    slides[cur].classList.add('active');
    dots.children[cur].classList.add('active');
  }
  setInterval(() => go((cur+1) % slides.length), 5000);
})();

/* Produits */
function switchProduct(btn, name) {
  document.querySelectorAll('.product-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.product-layout').forEach(p => p.style.display='none');
  btn.classList.add('active');
  document.getElementById('product-'+name).style.display='grid';
  document.getElementById('produits').style.background =
    name==='walo' ? 'linear-gradient(135deg,#2d6b20,#e8f0dc)' : 'linear-gradient(135deg,#1a5c2e,#2d8a47)';
}
function selectThumb(el,idx,p) {
  const w = document.getElementById('product-'+p);
  w.querySelectorAll('.thumb').forEach(t=>t.classList.remove('active'));
  w.querySelectorAll('.slide').forEach(s=>s.classList.remove('active'));
  el.classList.add('active');
  document.getElementById(p+'-slide-'+idx).classList.add('active');
}
const qtys = {touba:1, walo:1};
function changeQty(d,p) {
  qtys[p] = Math.max(1, qtys[p]+d);
  document.getElementById('qty-'+p).textContent = qtys[p];
}
function selectWeightTouba(btn) {
  btn.closest('.weights-row').querySelectorAll('.weight-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const p = {'5 kg':'3 500','10 kg':'7 000','25 kg':'9 500','50 kg':'19 000'};
  document.getElementById('prix-touba').innerHTML = p[btn.textContent.trim()]+' <span>FCFA</span>';
}
function selectWeightWalo(btn) {
  btn.closest('.weights-row').querySelectorAll('.weight-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const p = {'5 kg':'3 200','10 kg':'6 500','25 kg':'9 000','50 kg':'18 000'};
  document.getElementById('prix-walo').innerHTML = p[btn.textContent.trim()]+' <span>FCFA</span>';
}

/* Reveal */
const ro = new IntersectionObserver(e => {
  e.forEach(x => { if(x.isIntersecting){x.target.classList.add('visible');ro.unobserve(x.target);} });
}, {threshold:0.1, rootMargin:'0px 0px -30px 0px'});
document.querySelectorAll('.reveal').forEach(el => ro.observe(el));

/* Compteurs */
const co = new IntersectionObserver(e => {
  e.forEach(x => {
    if(x.isIntersecting){
      const t = +x.target.dataset.target, s = Math.ceil(t/50);
      let c=0; const tm = setInterval(()=>{
        c = Math.min(c+s,t);
        x.target.textContent = c.toLocaleString('fr');
        if(c>=t) clearInterval(tm);
      },30);
      co.unobserve(x.target);
    }
  });
}, {threshold:0.5});
document.querySelectorAll('.counter').forEach(el => co.observe(el));

/* Tilt 3D */
document.querySelectorAll('.atout-card,.plat-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r=card.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
    card.style.transform=`perspective(600px) rotateY(${x*10}deg) rotateX(${-y*10}deg) translateY(-6px)`;
  },{passive:true});
  card.addEventListener('mouseleave',()=>card.style.transform='');
});

/* Plats modal */
const plats=[
  {img:'images/thieboudienne.png',icon:'🐟',title:'Thiéboudienne',desc:'Le plat national. Riz en sauce tomate, poisson grillé et légumes.',steps:['Faire revenir le poisson assaisonné','Pré-cuire le riz','Ajouter sauce tomate et épices','Cuire 25 minutes à couvert','Servir chaud avec les légumes']},
  {img:'images/yassa.png',icon:'🍋',title:'Riz au Yassa',desc:'Poulet mariné au citron et oignons sur riz parfumé.',steps:['Mariner poulet au citron une nuit','Griller jusqu\'à dorure','Caraméliser les oignons','Mijoter dans la sauce','Servir sur riz moelleux']},
  {img:'images/thiebouguinar.png',icon:'🍗',title:'Thiébou Guinar',desc:'Riz au poulet parfumé aux épices sénégalaises.',steps:['Farcir poulet aux épices locales','Dorer dans l\'huile','Préparer le riz','Mijoter 45 minutes','Présenter farci sur le riz']}
];
function openPlat(i){
  const p=plats[i];
  document.getElementById('modalImg').src=p.img;
  document.getElementById('modalIcon').textContent=p.icon;
  document.getElementById('modalTitle').textContent=p.title;
  document.getElementById('modalDesc').textContent=p.desc;
  document.getElementById('modalSteps').innerHTML=p.steps.map((s,j)=>`<div class="modal-step"><div class="step-num">${j+1}</div><span>${s}</span></div>`).join('');
  document.getElementById('platModal').classList.add('open');
  document.body.style.overflow='hidden';
}
function closePlat(){
  document.getElementById('platModal').classList.remove('open');
  document.body.style.overflow='';
}

/* Galerie */
const gd=[
  {img:'images/g-semence.png',step:'Étape 1',title:'🌱 Culture & Semence',desc:'Cultivé dans les terres fertiles de Touba.'},
  {img:'images/g-recolte.png',step:'Étape 2',title:'🚜 Récolte',desc:'Moissonné mécaniquement à maturité optimale.'},
  {img:'images/g-usine.png',step:'Étape 3',title:'🏭 Notre Usine',desc:'Équipements industriels de dernière génération.'},
  {img:'images/g-tri-machine.png',step:'Étape 4',title:'⚙️ Tri Optique',desc:'Chaque grain analysé à haute précision.'},
  {img:'images/g-trieuse.png',step:'Étape 5',title:'🔧 Équipement',desc:'Machines de calibrage des grains.'},
  {img:'images/g-qualite.png',step:'Étape 6',title:'👐 Contrôle Qualité',desc:'Inspection manuelle avant conditionnement.'},
  {img:'images/g-stock-brut.png',step:'Étape 7',title:'🏪 Stockage',desc:'Entrepôt pour conserver la fraîcheur.'},
  {img:'images/g-stock-fini.png',step:'Étape 8',title:'📦 Conditionnement',desc:'Sacs prêts pour la livraison.'},
  {img:'images/g-equipe.png',step:'Notre Force',title:'👥 Notre Équipe',desc:'Équipe passionnée en uniforme Ceebu Touba.'}
];
let cg=0;
function openGalerie(i){cg=i;showG();document.getElementById('galerieLightbox').classList.add('open');document.body.style.overflow='hidden';}
function showG(){const d=gd[cg];document.getElementById('lbImg').src=d.img;document.getElementById('lbStep').textContent=d.step;document.getElementById('lbTitle').textContent=d.title;document.getElementById('lbDesc').textContent=d.desc;}
function navGalerie(d){cg=(cg+d+gd.length)%gd.length;showG();}
function closeGalerie(){document.getElementById('galerieLightbox').classList.remove('open');document.body.style.overflow='';}
function filtreGalerie(btn,cat){
  document.querySelectorAll('.galerie-filtre').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.gal-item').forEach(el=>{
    const show=cat==='all'||el.classList.contains(cat);
    el.style.opacity=show?'1':'.15';
    el.style.pointerEvents=show?'':'none';
  });
}

/* Dark mode */
function toggleTheme(){
  document.documentElement.classList.toggle('dark');
}

/* Keyboard */
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closePlat();closeGalerie();}
  const lb=document.getElementById('galerieLightbox');
  if(lb.classList.contains('open')){
    if(e.key==='ArrowRight') navGalerie(1);
    if(e.key==='ArrowLeft')  navGalerie(-1);
  }
});

/* ── PARTNER SLIDER ── */
function scrollPartner(dir) {
  const s = document.getElementById('partnerSlider');
  if (s) s.scrollBy({left: dir * 160, behavior: 'smooth'});
}
function showPartner(card) {
  const name = card.querySelector('.partner-name').textContent;
  const num  = card.querySelector('.partner-num').textContent;
  const tag  = card.querySelector('.partner-tag').textContent;
  const p = document.getElementById('partnerPopup');
  document.getElementById('popTag').textContent  = tag;
  document.getElementById('popName').textContent = name;
  document.getElementById('popNum').textContent  = num;
  p.style.display = 'block';
}

/* ── SLIDE TOGGLE ── */
function selectSlide(btn, idx, produit) {
  const wrap = document.getElementById('product-' + produit);
  wrap.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
  wrap.querySelectorAll('.stbtn').forEach(b => b.classList.remove('active'));
  document.getElementById(produit + '-slide-' + idx).classList.add('active');
  btn.classList.add('active');
}

/* ── CARACTÉRISTIQUES RIZ LONG ── */
const caracteristiques_touba = {
  img: 'images/result.png',
  title: 'Riz Long Premium',
  items: [
    {emoji: '🌾', label: 'Grain Long', desc: '8-9mm - Cuisson homogène et grains séparés'},
    {emoji: '🌿', label: '100% Naturel', desc: 'Sans pesticides, sans OGM, sans colorants'},
    {emoji: '🏭', label: 'Trié Optiquement', desc: 'Zéro grain cassé - Qualité garantie'},
    {emoji: '⏱️', label: 'Cuisson Rapide', desc: '18-20 minutes pour un riz moelleux'},
    {emoji: '👨‍🍳', label: 'Plats Recommandés', desc: 'Thiéboudienne, Yassa, Thiébou Guinar'},
    {emoji: '💪', label: 'Riche en Fibres', desc: 'Apporte énergie et bien-être à votre famille'},
    {emoji: '🥄', label: 'Texture Parfaite', desc: 'Moelleux, non collant, saveur authentique'},
    {emoji: '🌍', label: 'Origine Touba', desc: 'Vallée du Fleuve Sénégal - Terroir fertile'}
  ]
};

/* ── CARACTÉRISTIQUES RIZ BRISÉ ── */
const caracteristiques_walo = {
  img: 'images/result (1).png',
  title: 'Riz Brisé Premium',
  items: [
    {emoji: '🍚', label: 'Riz Brisé', desc: 'Grains courts - Texture fondante et croustillante'},
    {emoji: '💧', label: 'Absorbe bien', desc: 'Idéal pour les sauces riches et mijoté'},
    {emoji: '🌊', label: 'Vallée du Fleuve', desc: 'Cultivé au Walo - Terroir privilégié'},
    {emoji: '⚡', label: 'Cuisson Rapide', desc: '15-17 minutes - Plus rapide que le riz long'},
    {emoji: '👨‍🍳', label: 'Plats Recommandés', desc: 'Ceebu Jen, Maffé, Bissap au riz brisé'},
    {emoji: '💰', label: 'Rapport Qualité', desc: 'Meilleur prix pour maximum de saveur'},
    {emoji: '🎯', label: 'Polyvalent', desc: 'Parfait pour tous types de plats sénégalais'},
    {emoji: '✨', label: '100% Sénégalais', desc: 'Fierté locale - Qualité contrôlée certifiée'}
  ]
};

/* ── FONCTION AFFICHAGE CARACTÉRISTIQUES ── */
function afficherCaracteristiques(produit) {
  const data = produit === 'touba' ? caracteristiques_touba : caracteristiques_walo;
  const wrap = document.getElementById('product-' + produit);
  const slideDiv = document.getElementById(produit + '-slide-1').querySelector('.slide-visual');
  
  if (!slideDiv) return;
  
  let html = `<div style="font-family:'Playfair Display',serif;font-size:1.4rem;font-weight:700;color:white;margin-bottom:20px">${data.title}</div>`;
  html += `<div style="display:flex;flex-direction:column;gap:12px;width:100%">`;
  
  data.items.forEach(item => {
    html += `<div style="display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.07);border-radius:10px;padding:12px 14px">
      <span style="font-size:20px">${item.emoji}</span>
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--gold)">${item.label}</div>
        <div style="font-size:11px;color:rgba(255,255,255,.6)">${item.desc}</div>
      </div>
    </div>`;
  });
  
  html += `</div>`;
  slideDiv.innerHTML = html;
}

/* ── INITIALISER LES CARACTÉRISTIQUES AU CHARGEMENT ── */
document.addEventListener('DOMContentLoaded', () => {
  afficherCaracteristiques('touba');
  afficherCaracteristiques('walo');
});
