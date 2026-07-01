const THEME_STORAGE_KEY = 'adhiraj-theme-mode';

function getAutoTheme() {
  const hour = new Date().getHours();
  return (hour >= 18 || hour < 6) ? 'dark' : 'light';
}

function applyTheme(mode) {
  const selected = ['light', 'dark', 'auto'].includes(mode) ? mode : 'auto';
  const resolved = selected === 'auto' ? getAutoTheme() : selected;
  document.documentElement.dataset.themeMode = selected;
  document.documentElement.dataset.theme = resolved;
  document.querySelectorAll('[data-theme-option]').forEach((button) => {
    const active = button.dataset.themeOption === selected;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function initThemeSelector() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY) || 'auto';
  applyTheme(saved);
  document.querySelectorAll('[data-theme-option]').forEach((button) => {
    button.addEventListener('click', () => {
      const mode = button.dataset.themeOption || 'auto';
      localStorage.setItem(THEME_STORAGE_KEY, mode);
      applyTheme(mode);
    });
  });
  window.setInterval(() => {
    if ((localStorage.getItem(THEME_STORAGE_KEY) || 'auto') === 'auto') applyTheme('auto');
  }, 60 * 1000);
}


const AVATAR_PRELOAD_SOURCES = [
  'https://github.com/adhirajAI.png?size=88',
  'https://github.com/adhirajAI.png?size=640'
];

function preloadAvatarImages() {
  AVATAR_PRELOAD_SOURCES.forEach((src) => {
    const image = new Image();
    image.decoding = 'async';
    image.src = src;
  });
}

function initAvatarViewer() {
  const button = document.querySelector('.avatar-button');
  const modal = document.querySelector('#avatar-modal');
  if (!button || !modal) return;
  function openAvatar() {
    const modalImage = modal.querySelector('img[data-src]');
    if (modalImage && !modalImage.getAttribute('src')) {
      modalImage.setAttribute('src', modalImage.dataset.src);
    }
    modal.hidden = false;
    document.body.classList.add('avatar-expanded');
  }
  function closeAvatar() {
    modal.hidden = true;
    document.body.classList.remove('avatar-expanded');
  }
  button.addEventListener('click', openAvatar);
  modal.addEventListener('click', closeAvatar);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) closeAvatar();
  });
}

const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const year = document.querySelector('#year');

if (year) year.textContent = new Date().getFullYear();

if (navToggle && navLinks) {
  const closeMenu = () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  };

  navToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (event) => {
    if (!navLinks.classList.contains('open')) return;
    if (event.target.closest('.nav')) return;
    closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
}


function getAnchorScrollOffset(target) {
  const margin = window.getComputedStyle(target).scrollMarginTop;
  const parsed = Number.parseFloat(margin);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  const header = document.querySelector('.site-header, header');
  return header ? header.getBoundingClientRect().height + 24 : 96;
}

function linearScrollProgress(t) {
  return t;
}

function smoothScrollToTarget(target) {
  if (!target) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const startY = window.pageYOffset;
  const offset = getAnchorScrollOffset(target);
  const targetY = Math.max(0, target.getBoundingClientRect().top + startY - offset);

  if (reduceMotion) {
    window.scrollTo(0, targetY);
    return;
  }

  const distance = targetY - startY;
  const duration = Math.min(420, Math.max(180, Math.abs(distance) * 0.18));
  let startTime = null;

  function step(timestamp) {
    if (startTime === null) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    window.scrollTo(0, startY + distance * linearScrollProgress(progress));
    if (progress < 1) window.requestAnimationFrame(step);
  }

  window.requestAnimationFrame(step);
}

function initSmoothSectionScroll() {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href === '#') return;

    let target;
    try {
      target = document.querySelector(decodeURIComponent(href));
    } catch (error) {
      target = null;
    }
    if (!target) return;

    event.preventDefault();

    if (navLinks && navToggle) {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }

    smoothScrollToTarget(target);
    if (history.pushState) history.pushState(null, '', href);
  });
}

const PAPERS = [
  {
    id: 'wav2tok-paper',
    venue: 'ICLR 2023 Poster',
    title: 'wav2tok: Deep Sequence Tokenizer for Audio Retrieval',
    overview: 'wav2tok is a neural audio tokenizer that learns discrete token sequences for retrieval by vector-quantizing encoder representations and training paired audio views to predict each other’s token strings with a CTC-style objective. It can be interpreted as an early sequence-target analogue of predictive representation learning: rather than reconstructing waveforms, the model learns symbolic audio representations by predicting content-preserving token sequences across acoustically varied views.',
    paperUrl: 'https://openreview.net/forum?id=v8Mi8KU6056',
    pdfUrl: 'https://openreview.net/pdf?id=v8Mi8KU6056',
    thumbnailUrl: 'assets/thumbnails/wav2tokPNG.webp',
    codeUrl: 'https://github.com/madhavlab/wav2tok',
    featured: false
  },
  {
    id: 'wav2tok2-paper',
    venue: 'INTERSPEECH 2026 / arXiv',
    title: 'wav2tok 2.0: Scalable Audio Tokenization Maintaining Explicit Pairwise Token Alignment for Efficient Audio Retrieval',
    overview: 'wav2tok 2.0 is a neural audio tokenizer for efficient retrieval. It extends the original wav2tok line by making pairwise token alignment more explicit and scalable. It learns discrete audio token sequences through cross-view symbolic prediction, retaining a CTC-style alignment objective while adding DTW-guided frame-aligned prediction of paired-view token targets. This strengthens the sequence-target predictive learning view: paired views of the same content are trained to predict each other’s token strings, making the learned tokenizer more retrieval-oriented and alignment-aware.',
    paperUrl: 'https://arxiv.org/abs/2606.26824',
    pdfUrl: 'https://arxiv.org/pdf/2606.26824',
    codeUrl: 'https://github.com/adhiraj69/wav2tok2',
    featured: false
  },
  {
    id: 'enc-dec-awe-paper',
    venue: 'INTERSPEECH 2023 Poster',
    title: 'Enc-Dec RNN Acoustic Word Embeddings learned via Pairwise Prediction',
    overview: ' This work studies the fixed-vector analogue of the same predictive sequence-target idea. Instead of representing audio as a token string, it learns compact acoustic word embeddings by conditioning an autoregressive decoder on one view’s fixed-dimensional embedding and predicting the paired view’s symbolic sequence target. The objective injects temporal and sequence-level information into a compact acoustic fingerprint, making it more useful for retrieval and comparison.',
    paperUrl: 'https://www.isca-archive.org/interspeech_2023/banerjee23_interspeech.html',
    pdfUrl: 'https://www.isca-archive.org/interspeech_2023/banerjee23_interspeech.pdf',
    thumbnailUrl: 'assets/thumbnails/EncDecAWE.webp',
    codeUrl: 'https://github.com/madhavlab/2023_adhiraj_encdecPairwisePred',
    featured: false
  },
  {
    id: 'pairalign-paper',
    venue: 'arXiv 2026 / under review at TMLR',
    title: 'PairAlign: A Framework for Sequence Tokenization via Self-Alignment with Applications to Audio Tokenization',
    overview: ' PairAlign is an autoregressive neural tokenizer for audio. It formulates tokenization as conditional sequence generation: an encoder maps audio to a continuous condition, and an autoregressive decoder emits a compact symbolic sequence from BOS to EOS, learning token identity, order, length, and termination. PairAlign may be viewd as a symbolic sequence analogue of JEPA-style predictive learning: instead of predicting only continuous latent targets across views, it predicts compact symbolic sequence targets across content-preserving views, using alignment-aware and contrastive objectives to reduce collapse and preserve discriminative structure.',
    paperUrl: 'https://arxiv.org/abs/2605.06582',
    pdfUrl: 'https://arxiv.org/pdf/2605.06582',
    featured: false
  },
  {
    id: 'codecsep-paper',
    venue: 'TMLR 2026',
    title: 'CodecSep: Prompt-Driven Universal Sound Separation on Neural Audio Codec Latents',
    overview: 'CodecSep studies whether neural audio codec latents can serve as structured operating spaces for downstream audio intelligence. It provides evidence that DAC/NAC latents preserve source-compositional structure and shows that prompt-guided source separation can be performed directly through latent masking. This motivates a codes-in / latent-processing / codes-out pathway, where compressed codec codes are dequantized to latents, processed directly, and requantized to output codes for efficient codec-native audio processing.',
    paperUrl: 'https://tmlr.infinite-conf.org/paper_pages/r63GX9hKhC.html',
    pdfUrl: 'https://arxiv.org/pdf/2509.11717',
    thumbnailUrl: 'assets/thumbnails/CodecSep.webp',
    codeUrl: 'https://github.com/adhiraj69/CodecSep',
    videoUrl: 'https://youtu.be/LUBtTJN3QaI',
    featured: true
  }
];

const MEDIA_ITEMS = [
  {
    type: 'youtube',
    title: 'CodecSep video presentation',
    description: 'TMLR-accepted paper video presentation.',
    url: 'https://youtu.be/LUBtTJN3QaI'
  },
  {
    type: 'external',
    title: 'CodecSep TMLR Infinite Conference page',
    description: 'Conference page with paper, video, and code artifacts.',
    url: 'https://tmlr.infinite-conf.org/paper_pages/r63GX9hKhC.html'
  },
  {
    type: 'external',
    title: 'wav2tok ICLR 2023 poster and video',
    description: 'SlidesLive poster and video presentation for wav2tok.',
    url: 'https://slideslive.com/38999789'
  },
  {
    type: 'youtube',
    title: 'WISSAP talk: Audio retrieval and representation learning I',
    description: 'WISSAP lecture video, playable directly on the website.',
    url: 'https://youtu.be/YWNrfOl2QMI?si=48_RJAsazNZ0VUPD'
  },
  {
    type: 'youtube',
    title: 'WISSAP talk: Audio retrieval and representation learning II',
    description: 'WISSAP lecture video, playable directly on the website.',
    url: 'https://youtu.be/GRBThza-ecU?si=7VXXJH7NMTYQHnL3'
  },
  {
    type: 'youtube',
    title: 'WISSAP talk: Audio retrieval and representation learning III',
    description: 'WISSAP lecture video, playable directly on the website.',
    url: 'https://youtu.be/xYujD_FS8gI?si=L-9zALvLL_BUtGss'
  },
  {
    type: 'youtube',
    title: 'WISSAP lecture video playlist',
    description: 'Lecture playlist on audio retrieval and representation learning.',
    url: 'https://youtube.com/playlist?list=PLbtAaXHMto-vpyPwGJrbpJ9jSb4sEAJo7&si=eOanE1d_qCgtJA-9'
  }
];

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);
}

const PAPER_JUMP_TERMS = [
  { pattern: 'PairAlign', target: 'pairalign-paper', label: 'PairAlign paper' },
  { pattern: 'CodecSep', target: 'codecsep-paper', label: 'CodecSep paper' },
  { pattern: 'wav2tok 2.0', target: 'wav2tok2-paper', label: 'wav2tok 2.0 paper' },
  { pattern: 'Enc-Dec AWE', target: 'enc-dec-awe-paper', label: 'Enc-Dec AWE paper' },
  { pattern: 'Enc-Dec RNN Acoustic Word Embeddings', target: 'enc-dec-awe-paper', label: 'Enc-Dec AWE paper' },
  { pattern: 'wav2tok', target: 'wav2tok-paper', label: 'wav2tok paper' }
];

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function linkPaperMentions(root = document.body) {
  if (!root) return;

  const availableTerms = PAPER_JUMP_TERMS.filter((term) => document.querySelector(`#${term.target}`));
  if (!availableTerms.length) return;

  const mentionRegex = new RegExp(`(${availableTerms.map((term) => escapeRegExp(term.pattern)).join('|')})`, 'gi');
  const skipTags = new Set(['A', 'SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT']);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (skipTags.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (parent.closest('a, .paper-jump, .pairalign-jump')) return NodeFilter.FILTER_REJECT;
      mentionRegex.lastIndex = 0;
      return mentionRegex.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach((node) => {
    const fragment = document.createDocumentFragment();
    mentionRegex.lastIndex = 0;
    const parts = node.nodeValue.split(mentionRegex);
    parts.forEach((part) => {
      if (!part) return;
      const match = availableTerms.find((term) => term.pattern.toLowerCase() === part.toLowerCase());
      if (match) {
        const link = document.createElement('a');
        link.href = `#${match.target}`;
        link.className = match.target === 'pairalign-paper' ? 'paper-jump pairalign-jump' : 'paper-jump';
        link.textContent = part;
        link.setAttribute('aria-label', `Jump to the ${match.label}`);
        fragment.appendChild(link);
      } else {
        fragment.appendChild(document.createTextNode(part));
      }
    });
    node.replaceWith(fragment);
  });
}

function linkPairAlignMentions(root = document.body) {
  linkPaperMentions(root);
}

function createPaperCard(paper, index) {
  const card = document.createElement('article');
  card.className = `paper${paper.featured ? ' featured' : ''}`;
  card.innerHTML = `
    <div class="paper-left">
      <div class="paper-meta"><span class="paper-venue">${escapeHtml(paper.venue)}</span></div>
      <div class="paper-links">
        <a href="${paper.paperUrl}" target="_blank" rel="noreferrer">Paper</a>
        ${paper.pdfUrl ? `<a href="${paper.pdfUrl}" target="_blank" rel="noreferrer">PDF</a>` : ''}
        ${paper.codeUrl ? `<a href="${paper.codeUrl}" target="_blank" rel="noreferrer">Code</a>` : ''}
        ${paper.videoUrl ? `<a href="${paper.videoUrl}" target="_blank" rel="noreferrer">Video</a>` : ''}
      </div>
    </div>
    <div class="paper-main">
      <a class="paper-thumb ${paper.thumbnailUrl ? '' : 'thumb-loading'}" href="${paper.pdfUrl || paper.paperUrl}" target="_blank" rel="noreferrer" aria-label="Open ${escapeHtml(paper.title)} PDF preview">
        ${paper.thumbnailUrl ? `<img src="${paper.thumbnailUrl}" alt="First page thumbnail for ${escapeHtml(paper.title)}" loading="lazy" decoding="async" />` : `<div class="thumb-fallback"><div><span>PDF Preview</span>${escapeHtml(paper.title)}</div></div>`}
      </a>
      <div class="paper-copy">
        <h3${paper.id ? ` id="${escapeHtml(paper.id)}"` : ''}>${escapeHtml(paper.title)}</h3>
        <p>${escapeHtml(paper.overview)}</p>
      </div>
    </div>
  `;
  const thumb = card.querySelector('.paper-thumb');
  thumb.dataset.pdfUrl = paper.pdfUrl || '';
  thumb.dataset.thumbnailUrl = paper.thumbnailUrl || '';
  thumb.dataset.index = String(index);
  return card;
}

function renderPaperCards() {
  const list = document.querySelector('#paper-list');
  if (!list) return;
  list.innerHTML = '';
  PAPERS.forEach((paper, index) => list.appendChild(createPaperCard(paper, index)));
}

async function renderPdfThumbnail(thumb) {
  const pdfUrl = thumb.dataset.pdfUrl;
  if (thumb.dataset.thumbnailUrl) {
    thumb.classList.remove('thumb-loading');
    return;
  }
  if (!pdfUrl) {
    thumb.classList.remove('thumb-loading');
    return;
  }

  try {
    const pdfjsLib = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';
    const loadingTask = pdfjsLib.getDocument({ url: pdfUrl, withCredentials: false });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1.6 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: context, viewport }).promise;
    thumb.innerHTML = '';
    thumb.appendChild(canvas);
  } catch (error) {
    console.warn('PDF thumbnail could not be rendered:', pdfUrl, error);
  } finally {
    thumb.classList.remove('thumb-loading');
  }
}

function hydratePdfThumbnails() {
  const thumbs = document.querySelectorAll('.paper-thumb');
  if (!thumbs.length) return;

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            renderPdfThumbnail(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, { rootMargin: '250px 0px' })
    : null;

  thumbs.forEach((thumb) => {
    if (observer) observer.observe(thumb);
    else renderPdfThumbnail(thumb);
  });
}

function getYouTubeInfo(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace('www.', '');
    let videoId = null;
    let playlistId = parsed.searchParams.get('list');

    if (host === 'youtu.be') videoId = parsed.pathname.split('/').filter(Boolean)[0];
    if (host.includes('youtube.com')) {
      videoId = parsed.searchParams.get('v');
      if (parsed.pathname.startsWith('/embed/')) videoId = parsed.pathname.split('/').filter(Boolean)[1];
      if (parsed.pathname.startsWith('/shorts/')) videoId = parsed.pathname.split('/').filter(Boolean)[1];
    }

    return { videoId, playlistId };
  } catch {
    return { videoId: null, playlistId: null };
  }
}

function createMediaCard(item) {
  const card = document.createElement('article');
  card.className = 'media-card';
  const { videoId, playlistId } = getYouTubeInfo(item.url);
  const canInlinePlay = Boolean(videoId);
  const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
  const label = playlistId && !videoId ? 'YouTube playlist' : item.type === 'external' ? 'Presentation page' : 'Video';

  card.innerHTML = `
    ${videoId ? `
      <button class="media-preview" type="button" data-video-id="${videoId}" aria-label="Play ${escapeHtml(item.title)}">
        <img src="${thumbUrl}" alt="${escapeHtml(item.title)} thumbnail" loading="lazy" decoding="async" />
        <span class="play-badge">▶</span>
      </button>` : `
      <a class="media-preview external" href="${item.url}" target="_blank" rel="noreferrer">
        <div><strong>${escapeHtml(label)}</strong><br><span>${escapeHtml(item.title)}</span></div>
      </a>`}
    <div class="media-body">
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.description)}</p>
      <div class="media-actions">
        <a href="${item.url}" target="_blank" rel="noreferrer">Open original</a>
        ${canInlinePlay ? '<span aria-hidden="true">·</span><span>Click thumbnail to play inline</span>' : ''}
      </div>
    </div>
  `;
  return card;
}

function renderMediaCards() {
  const grid = document.querySelector('#media-grid');
  if (!grid) return;
  grid.innerHTML = '';
  MEDIA_ITEMS.forEach((item) => grid.appendChild(createMediaCard(item)));

  grid.querySelectorAll('.media-preview[data-video-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const videoId = button.dataset.videoId;
      button.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
    });
  });
}


const RESEARCH_DIRECTIONS = [
  {
    number: 1,
    title: 'Paired-view predictive learning for audio tokenization, downstream discrimination, and sequence modeling',
    image: 'assets/research-directions/research-direction-1.webp',
    alt: 'Diagram of paired-view predictive learning for audio tokenization, downstream discrimination, and sequence modeling.',
    summary: 'A unifying view of my audio tokenization work: paired or augmented audio views are mapped into abstract symbolic token-sequence targets, allowing the same predictive formulation to support tokenization, downstream discrimination, and autoregressive sequence modeling without requiring strict frame-level alignment.'
  },
  {
    number: 2,
    title: 'PairAlign-style autoregressive neural tokenizers',
    image: 'assets/research-directions/research-direction-2.webp',
    alt: 'Diagram of a PairAlign-style autoregressive neural tokenizer for multimodal foundation models.',
    summary: 'This direction is currently based on my PairAlign paper. PairAlign treats tokenization as conditional sequence generation: an encoder produces a conditioning representation, and an autoregressive decoder emits compact token streams. The goal is to learn information-preserving symbolic interfaces for efficient reasoning, generation, and adaptation in multimodal foundation models.'
  },
  {
    number: 3,
    title: 'Sequence compression',
    image: 'assets/research-directions/research-direction-3.webp',
    alt: 'Diagram of sequence compression for long foundation-model token streams.',
    summary: 'This direction studies learned compressors that condition on long token streams and generate shorter token sequences. The central question is how to preserve information needed for prediction and reasoning while reducing context length, computation, and memory pressure for long-context foundation models.'
  },
  {
    number: 4,
    title: 'Multimodal foundation models: reasoning, generation, and inference',
    image: 'assets/research-directions/research-direction-4.webp',
    alt: 'Diagram of multimodal foundation models for reasoning, generation, and inference.',
    summary: 'This direction focuses on multimodal foundation models that integrate audio, image/video, text, and sensor streams. I am interested in token and latent interfaces that improve cross-modal reasoning, controllable generation, efficient inference, and decision-making across heterogeneous real-world inputs.'
  },
  {
    number: 5,
    title: 'Codec-native audio intelligence',
    image: 'assets/research-directions/research-direction-5.webp',
    alt: 'Diagram comparing traditional audio processing with codec-native audio processing across edge, network, and server stages.',
    summary: 'This direction is currently grounded in my CodecSep paper. CodecSep studies neural audio codec representations as computational operating spaces. Instead of repeatedly decoding to waveform space, codec-native systems can operate directly over codes or latents, enabling lower-bandwidth, lower-latency, codes-in / codes-out audio intelligence for edge-server deployment.'
  },
  {
    number: 6,
    title: 'Universal source separation and enhancement',
    image: 'assets/research-directions/research-direction-6.webp',
    alt: 'Diagram of prompt-guided universal sound separation and enhancement from mixture audio.',
    summary: 'This direction is currently grounded in my CodecSep paper. CodecSep studies prompt-guided systems that isolate or enhance requested sounds from complex mixtures. The emphasis is on open-set source queries, generalization to unseen sound classes, and controllable audio processing driven by natural-language or hybrid prompts.'
  },
  {
    number: 7,
    title: 'Audio retrieval and audio fingerprinting with tokens and embeddings',
    image: 'assets/research-directions/research-direction-7.webp',
    alt: 'Diagram of audio retrieval and fingerprinting using token-sequence and embedding-based representations.',
    summary: 'This direction is grounded in my wav2tok 2.0 and Enc-Dec AWE papers. It combines symbolic token-sequence fingerprints with fixed-dimensional embeddings for robust audio retrieval. It covers query-by-example search, semantic retrieval, inverted or n-gram token indexing, and vector search over compact acoustic representations.'
  }
];

function initResearchDirectionCarousel() {
  const carousel = document.querySelector('.direction-carousel');
  const kicker = document.querySelector('#direction-kicker');
  const title = document.querySelector('#direction-title');
  const summary = document.querySelector('#direction-summary');
  const stage = document.querySelector('#direction-stage');
  const track = document.querySelector('#direction-track');
  const dots = document.querySelector('#direction-dots');
  const prev = document.querySelector('#direction-prev');
  const next = document.querySelector('#direction-next');
  const lightbox = document.querySelector('#direction-lightbox');
  const lightboxImage = document.querySelector('#direction-lightbox-image');
  const lightboxClose = document.querySelector('.direction-lightbox-close');
  if (!carousel || !kicker || !title || !summary || !stage || !track || !dots || !prev || !next || !lightbox || !lightboxImage || !lightboxClose) return;

  let active = 0;
  let timer = null;
  let resumeTimer = null;
  let isHoverPaused = false;
  let touchStartX = 0;
  let touchStartY = 0;
  const delay = 6500;
  const manualPauseMs = 5 * 60 * 1000;

  dots.innerHTML = RESEARCH_DIRECTIONS.map((direction, index) => (
    `<button class="direction-dot" type="button" aria-label="Show research direction ${direction.number}" data-index="${index}"></button>`
  )).join('');

  const dotButtons = Array.from(dots.querySelectorAll('.direction-dot'));

  function stopAuto() {
    if (timer) window.clearInterval(timer);
    timer = null;
  }

  function clearResume() {
    if (resumeTimer) window.clearTimeout(resumeTimer);
    resumeTimer = null;
  }

  function startAuto() {
    if (isHoverPaused) return;
    stopAuto();
    timer = window.setInterval(() => render(active + 1), delay);
  }

  function pauseAfterInteraction() {
    stopAuto();
    clearResume();
    resumeTimer = window.setTimeout(() => {
      resumeTimer = null;
      startAuto();
    }, manualPauseMs);
  }

  function getIndex(index) {
    return (index + RESEARCH_DIRECTIONS.length) % RESEARCH_DIRECTIONS.length;
  }

  function makeCard(index, role) {
    const direction = RESEARCH_DIRECTIONS[getIndex(index)];
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `direction-card is-${role}`;
    card.setAttribute('aria-label', role === 'active' ? `Expand ${direction.title}` : direction.title);
    card.innerHTML = `<img src="${direction.image}" alt="${direction.alt}" loading="${role === 'active' ? 'eager' : 'lazy'}" decoding="async" fetchpriority="${role === 'active' ? 'high' : 'low'}" width="1400" height="789">`;
    if (role === 'active') {
      card.addEventListener('click', () => {
        openLightbox(direction);
        pauseAfterInteraction();
      });
    }
    return card;
  }

  function render(index) {
    active = getIndex(index);
    const direction = RESEARCH_DIRECTIONS[active];
    kicker.textContent = `Direction ${direction.number} of ${RESEARCH_DIRECTIONS.length}`;
    title.textContent = direction.title;
    summary.textContent = direction.summary;
    linkPaperMentions(title);
    linkPaperMentions(summary);
    track.replaceChildren(
      makeCard(active - 1, 'prev'),
      makeCard(active, 'active'),
      makeCard(active + 1, 'next')
    );
    dotButtons.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === active);
      dot.setAttribute('aria-current', dotIndex === active ? 'true' : 'false');
    });
  }

  function move(delta, userInitiated = true) {
    render(active + delta);
    if (userInitiated) pauseAfterInteraction();
  }

  function openLightbox(direction) {
    lightboxImage.src = direction.image;
    lightboxImage.alt = direction.alt;
    lightbox.hidden = false;
    document.body.classList.add('direction-expanded');
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImage.src = '';
    document.body.classList.remove('direction-expanded');
  }

  prev.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));

  dotButtons.forEach((dot) => {
    dot.addEventListener('click', () => {
      render(Number(dot.dataset.index));
      pauseAfterInteraction();
    });
  });

  stage.addEventListener('touchstart', (event) => {
    if (!event.changedTouches.length) return;
    touchStartX = event.changedTouches[0].clientX;
    touchStartY = event.changedTouches[0].clientY;
  }, { passive: true });

  stage.addEventListener('touchend', (event) => {
    if (!event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchStartX;
    const dy = event.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      move(dx < 0 ? 1 : -1);
    }
  }, { passive: true });

  carousel.addEventListener('mouseenter', () => {
    isHoverPaused = true;
    stopAuto();
  });
  carousel.addEventListener('mouseleave', () => {
    isHoverPaused = false;
    if (!resumeTimer) startAuto();
  });
  carousel.addEventListener('focusin', () => {
    isHoverPaused = true;
    stopAuto();
  });
  carousel.addEventListener('focusout', () => {
    isHoverPaused = false;
    if (!resumeTimer) startAuto();
  });

  lightbox.addEventListener('click', closeLightbox);
  lightboxImage.addEventListener('click', closeLightbox);
  lightboxClose.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !lightbox.hidden) closeLightbox();
    if (event.key === 'ArrowLeft' && document.activeElement && carousel.contains(document.activeElement)) move(-1);
    if (event.key === 'ArrowRight' && document.activeElement && carousel.contains(document.activeElement)) move(1);
  });

  render(0);
  startAuto();
}

initSmoothSectionScroll();
initThemeSelector();
preloadAvatarImages();
initAvatarViewer();
renderPaperCards();
hydratePdfThumbnails();
renderMediaCards();
initResearchDirectionCarousel();
linkPaperMentions(document.body);
