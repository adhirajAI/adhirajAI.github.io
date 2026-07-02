import { useEffect, useRef, useState } from 'react';

const PAPERS = [
  {
    venue: 'ICLR 2023',
    title: 'wav2tok: Deep Sequence Tokenizer for Audio Retrieval',
    overview: 'A neural audio tokenizer that learns discrete token sequences for retrieval by vector-quantizing encoder representations and training paired audio views to predict each other’s token strings with a CTC-style objective.',
    paperUrl: 'https://openreview.net/forum?id=v8Mi8KU6056',
    pdfUrl: 'https://openreview.net/pdf?id=v8Mi8KU6056',
    thumbnailUrl: 'assets/thumbnails/wav2tokPNG.webp',
    codeUrl: 'https://github.com/madhavlab/wav2tok'
  },
  {
    venue: 'INTERSPEECH 2026 / arXiv',
    title: 'wav2tok 2.0: Scalable Audio Tokenization Maintaining Explicit Pairwise Token Alignment for Efficient Audio Retrieval',
    overview: 'Extends wav2tok by making pairwise token alignment more explicit and scalable through cross-view symbolic prediction, CTC-style alignment, and DTW-guided frame-aligned prediction of paired-view token targets.',
    paperUrl: 'https://arxiv.org/abs/2606.26824',
    pdfUrl: 'https://arxiv.org/pdf/2606.26824',
    thumbnailUrl: 'assets/thumbnails/wav2tok2.webp',
    codeUrl: 'https://github.com/adhiraj69/wav2tok2'
  },
  {
    venue: 'INTERSPEECH 2023',
    title: 'Enc-Dec RNN Acoustic Word Embeddings learned via Pairwise Prediction',
    overview: 'Learns compact acoustic word embeddings by conditioning an autoregressive decoder on one view’s fixed-dimensional embedding and predicting the paired view’s symbolic sequence target, injecting sequence-level information into an audio fingerprint.',
    paperUrl: 'https://www.isca-archive.org/interspeech_2023/banerjee23_interspeech.html',
    pdfUrl: 'https://www.isca-archive.org/interspeech_2023/banerjee23_interspeech.pdf',
    thumbnailUrl: 'assets/thumbnails/EncDecAWE.webp',
    codeUrl: 'https://github.com/madhavlab/2023_adhiraj_encdecPairwisePred'
  },
  {
    venue: 'arXiv 2026 / under review at TMLR',
    title: 'PairAlign: A Framework for Sequence Tokenization via Self-Alignment with Applications to Audio Tokenization',
    overview: 'An autoregressive neural tokenizer that treats tokenization as conditional sequence generation and learns token identity, order, length, and termination using alignment-aware and contrastive objectives to preserve discriminative structure.',
    paperUrl: 'https://arxiv.org/abs/2605.06582',
    pdfUrl: 'https://arxiv.org/pdf/2605.06582',
    thumbnailUrl: 'assets/thumbnails/PairAlign.webp'
  },
  {
    venue: 'TMLR 2026',
    title: 'CodecSep: Prompt-Driven Universal Sound Separation on Neural Audio Codec Latents',
    overview: 'Studies whether neural audio codec latents can serve as structured operating spaces for downstream audio intelligence, providing evidence for source-compositional structure and enabling prompt-guided separation through latent masking.',
    paperUrl: 'https://tmlr.infinite-conf.org/paper_pages/r63GX9hKhC.html',
    pdfUrl: 'https://arxiv.org/pdf/2509.11717',
    thumbnailUrl: 'assets/thumbnails/CodecSep.webp',
    codeUrl: 'https://github.com/adhiraj69/CodecSep',
    videoUrl: 'https://youtu.be/LUBtTJN3QaI',
    featured: true
  }
];

const MEDIA_ITEMS = [
  { type: 'youtube', title: 'CodecSep video presentation', description: 'TMLR-accepted paper video presentation.', url: 'https://youtu.be/LUBtTJN3QaI' },
  { type: 'external', title: 'CodecSep TMLR Infinite Conference page', description: 'Conference page with paper, video, and code artifacts.', url: 'https://tmlr.infinite-conf.org/paper_pages/r63GX9hKhC.html' },
  { type: 'external', title: 'wav2tok ICLR 2023 poster and video', description: 'SlidesLive poster and video presentation for wav2tok.', url: 'https://slideslive.com/38999789' },
  { type: 'youtube', title: 'WISSAP talk: Audio retrieval and representation learning I', description: 'WISSAP lecture video, playable directly on the website.', url: 'https://youtu.be/YWNrfOl2QMI?si=48_RJAsazNZ0VUPD' },
  { type: 'youtube', title: 'WISSAP talk: Audio retrieval and representation learning II', description: 'WISSAP lecture video, playable directly on the website.', url: 'https://youtu.be/GRBThza-ecU?si=7VXXJH7NMTYQHnL3' },
  { type: 'youtube', title: 'WISSAP talk: Audio retrieval and representation learning III', description: 'WISSAP lecture video, playable directly on the website.', url: 'https://youtu.be/xYujD_FS8gI?si=L-9zALvLL_BUtGss' },
  { type: 'youtube', title: 'WISSAP lecture video playlist', description: 'Lecture playlist on audio retrieval and representation learning.', url: 'https://youtube.com/playlist?list=PLbtAaXHMto-vpyPwGJrbpJ9jSb4sEAJo7&si=eOanE1d_qCgtJA-9' }
];

function getYouTubeInfo(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace('www.', '');
    let videoId = null;
    const playlistId = parsed.searchParams.get('list');
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

function PdfThumbnail({ pdfUrl, title, thumbnailUrl }) {
  const ref = useRef(null);
  const [loading, setLoading] = useState(Boolean(pdfUrl && !thumbnailUrl));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (thumbnailUrl || !pdfUrl || !ref.current) return;
    let cancelled = false;

    async function render() {
      try {
        const pdfjsLib = await import(/* @vite-ignore */ 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs');
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';
        const pdf = await pdfjsLib.getDocument({ url: pdfUrl, withCredentials: false }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.6 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        if (!cancelled && ref.current) {
          ref.current.innerHTML = '';
          ref.current.appendChild(canvas);
        }
      } catch (error) {
        console.warn('PDF thumbnail could not be rendered:', pdfUrl, error);
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    render();
    return () => { cancelled = true; };
  }, [pdfUrl, thumbnailUrl]);

  return (
    <a className={`paper-thumb${loading ? ' thumb-loading' : ''}`} href={pdfUrl} target="_blank" rel="noreferrer" aria-label={`Open ${title} PDF preview`} ref={ref}>
      {thumbnailUrl ? (
        <img src={thumbnailUrl} alt={`First page thumbnail for ${title}`} loading="lazy" decoding="async" />
      ) : (
        <div className="thumb-fallback"><div><span>{failed ? 'PDF Link' : 'PDF Preview'}</span>{title}</div></div>
      )}
    </a>
  );
}

function PaperCard({ paper }) {
  return (
    <article className={`paper${paper.featured ? ' featured' : ''}`}>
      <div className="paper-left">
        <div className="paper-meta"><span className="paper-venue">{paper.venue}</span></div>
        <div className="paper-links">
          <a href={paper.paperUrl} target="_blank" rel="noreferrer">Paper</a>
          {paper.pdfUrl && <a href={paper.pdfUrl} target="_blank" rel="noreferrer">PDF</a>}
          {paper.codeUrl && <a href={paper.codeUrl} target="_blank" rel="noreferrer">Code</a>}
          {paper.videoUrl && <a href={paper.videoUrl} target="_blank" rel="noreferrer">Video</a>}
        </div>
      </div>
      <div className="paper-main">
        <PdfThumbnail pdfUrl={paper.pdfUrl} title={paper.title} thumbnailUrl={paper.thumbnailUrl} />
        <div className="paper-copy">
          <h3>{paper.title}</h3>
          <p>{paper.overview}</p>
        </div>
      </div>
    </article>
  );
}

function MediaCard({ item }) {
  const [playing, setPlaying] = useState(false);
  const { videoId, playlistId } = getYouTubeInfo(item.url);
  const thumbUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
  const label = playlistId && !videoId ? 'YouTube playlist' : item.type === 'external' ? 'Presentation page' : 'Video';

  return (
    <article className="media-card">
      {videoId ? (
        <button className="media-preview" type="button" onClick={() => setPlaying(true)} aria-label={`Play ${item.title}`}>
          {playing ? (
            <iframe src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`} title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
          ) : (
            <>
              <img src={thumbUrl} alt={`${item.title} thumbnail`} loading="lazy" decoding="async" />
              <span className="play-badge">▶</span>
            </>
          )}
        </button>
      ) : (
        <a className="media-preview external" href={item.url} target="_blank" rel="noreferrer"><div><strong>{label}</strong><br /><span>{item.title}</span></div></a>
      )}
      <div className="media-body">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <div className="media-actions"><a href={item.url} target="_blank" rel="noreferrer">Open original</a>{videoId && <><span aria-hidden="true">·</span><span>Click thumbnail to play inline</span></>}</div>
      </div>
    </article>
  );
}

export default function App() {
  const [navOpen, setNavOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('adhiraj-theme-mode') || 'auto');
  const year = new Date().getFullYear();

  useEffect(() => {
    const resolveTheme = () => {
      const hour = new Date().getHours();
      return themeMode === 'auto' ? ((hour >= 18 || hour < 6) ? 'dark' : 'light') : themeMode;
    };
    document.documentElement.dataset.themeMode = themeMode;
    document.documentElement.dataset.theme = resolveTheme();
    localStorage.setItem('adhiraj-theme-mode', themeMode);
    const timer = window.setInterval(() => {
      if (themeMode === 'auto') document.documentElement.dataset.theme = resolveTheme();
    }, 60 * 1000);
    return () => window.clearInterval(timer);
  }, [themeMode]);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header" id="top">
        <nav className="nav container" aria-label="Primary navigation">
          <button className="brand avatar-button" type="button" aria-label="View Adhiraj Banerjee profile picture" onClick={() => setAvatarOpen(true)}><img className="brand-avatar" src="https://github.com/adhirajAI.png?size=88" alt="Adhiraj Banerjee GitHub profile picture" /></button>
          <button className="nav-toggle" type="button" aria-expanded={navOpen} aria-controls="nav-links" onClick={() => setNavOpen(!navOpen)}>Menu</button>
          <div className={`nav-links${navOpen ? ' open' : ''}`} id="nav-links" onClick={() => setNavOpen(false)}>
            <a href="#research">Research</a><a href="#papers">Papers</a><a href="#code">Code</a><a href="#talks">Talks</a><a href="#experience">Experience</a><a href="#contact">Contact</a><div className="theme-selector" role="group" aria-label="Theme selector">{['light', 'dark', 'auto'].map((mode) => <button key={mode} className={`theme-option${themeMode === mode ? ' active' : ''}`} type="button" aria-pressed={themeMode === mode} onClick={(event) => { event.stopPropagation(); setThemeMode(mode); }}>{mode[0].toUpperCase() + mode.slice(1)}</button>)}</div>
          </div>
        </nav>
      </header>
      {avatarOpen && <div className="avatar-modal" id="avatar-modal" onClick={() => setAvatarOpen(false)}><div className="avatar-modal-frame" role="dialog" aria-modal="true" aria-label="Adhiraj Banerjee profile picture"><img src="https://github.com/adhirajAI.png?size=640" alt="Adhiraj Banerjee GitHub profile picture" /></div></div>}
      <main id="main">
        <section className="hero section"><div className="container hero-grid"><div className="hero-copy"><p className="eyebrow">Research Portfolio</p><h1>Adhiraj Banerjee</h1><p className="subtitle">Ph.D. Candidate, Electrical Engineering, IIT Kanpur</p><p className="hero-text">I work on self-supervised learning, neural tokenization, autoregressive sequence compression, audio retrieval, and codec-native audio intelligence. My research develops compact symbolic and latent interfaces for efficient multimodal foundation models.</p><div className="hero-actions"><a className="button primary" href="mailto:adhirajbanerjee35@gmail.com">Email</a><a className="button" href="https://github.com/adhirajAI" target="_blank" rel="noreferrer">GitHub</a><a className="button" href="https://www.linkedin.com/in/adhiraj-banerjee-0051b01/" target="_blank" rel="noreferrer">LinkedIn</a><a className="button" href="#papers">Publications</a></div></div><aside className="hero-card"><h2>Focus Areas</h2><ul><li>Neural tokenizers for audio and multimodal signals</li><li>Autoregressive sequence compression</li><li>Predictive symbolic representation learning</li><li>Codec-native audio processing and latent masking</li><li>Efficient interfaces for foundation models</li></ul></aside></div></section>
        <section className="section" id="research"><div className="container"><div className="section-heading"><p className="eyebrow">Research Positioning</p><h2>Compact token interfaces for multimodal foundation models</h2></div><div className="positioning-grid"><article className="card"><h3>Neural tokenization and sequence compression</h3><p>My work develops neural tokenizers and autoregressive sequence compressors that transform continuous sensory signals or long foundation-model token streams into compact symbolic representations for prediction, generation, reasoning, adaptation, retrieval, and efficient downstream modeling.</p></article><article className="card"><h3>PairAlign-inspired autoregressive tokenization</h3><p>PairAlign formulates tokenization as conditional sequence generation: an encoder conditions an autoregressive decoder to emit ultra-low-bit-rate token streams while preserving information needed for retrieval, prediction, and downstream modeling.</p></article><article className="card"><h3>Codec-native audio intelligence</h3><p>CodecSep studies neural audio codec latents as computational operating spaces and shows that source-compositional structure can be extracted through latent masking, motivating efficient codes-in / latent-processing / codes-out systems.</p></article><article className="card"><h3>End-to-end research execution</h3><p>I independently formulate problems, design objectives, implement training systems, run experiments, analyze failures, write papers, respond to reviews, and maintain open-source releases.</p></article></div></div></section>
        <section className="section alt" id="papers"><div className="container"><div className="section-heading"><p className="eyebrow">Selected Publications</p><h2>Papers on tokenization, retrieval, compression, and codec-space processing</h2><p className="section-copy">Each paper card renders a first-page PDF thumbnail. For PDFs that block browser rendering, the site uses local first-page thumbnail assets while keeping venue and links on the left and the title/overview stacked on the right.</p></div><div className="paper-list">{PAPERS.map((paper) => <PaperCard key={paper.title} paper={paper} />)}</div></div></section>
        <section className="section" id="code"><div className="container"><div className="section-heading"><p className="eyebrow">Open Source</p><h2>Code repositories</h2></div><div className="repo-grid"><a className="repo-card" href="https://github.com/adhiraj69/CodecSep" target="_blank" rel="noreferrer"><span>CodecSep</span><p>Prompt-guided universal source separation on neural audio codec latents.</p></a><a className="repo-card" href="https://github.com/adhiraj69/wav2tok2" target="_blank" rel="noreferrer"><span>wav2tok 2.0</span><p>Scalable neural audio tokenizer with explicit pairwise token alignment.</p></a><a className="repo-card" href="https://github.com/madhavlab/wav2tok" target="_blank" rel="noreferrer"><span>wav2tok</span><p>ICLR 2023 deep sequence tokenizer for audio retrieval.</p></a><a className="repo-card" href="https://github.com/madhavlab/2023_adhiraj_encdecPairwisePred" target="_blank" rel="noreferrer"><span>Enc-Dec Pairwise Prediction AWE</span><p>INTERSPEECH 2023 encoder-decoder acoustic word embedding implementation.</p></a></div></div></section>
        <section className="section alt" id="talks"><div className="container"><div className="section-heading"><p className="eyebrow">Talks and Presentations</p><h2>Videos, posters, and research artifacts</h2><p className="section-copy">YouTube videos are converted into thumbnail cards automatically. Direct YouTube videos can be played inline; playlists and external presentation pages open in a new tab.</p></div><div className="media-grid">{MEDIA_ITEMS.map((item) => <MediaCard key={item.title} item={item} />)}</div></div></section>
        <section className="section" id="experience"><div className="container"><div className="section-heading"><p className="eyebrow">Industry Research Experience</p><h2>Applied research and engineering</h2></div><div className="timeline"><article className="timeline-item"><h3><a href="https://research.samsung.com/sri-b" target="_blank" rel="noreferrer">Samsung Research Institute Bangalore</a></h3><p className="role">Generative Speech AI Research Intern</p><p>Contributed to speech and generative audio research focused on source separation, speech enhancement, and audio generation. Implemented and evaluated deep learning audio models using GPU-cluster workflows, led quantization and deployment of a speech enhancement model, and delivered technical lectures on SSL, source separation, and generative audio modeling.</p></article><article className="timeline-item"><h3><a href="https://chariot.in" target="_blank" rel="noreferrer">Chariot AI</a></h3><p className="role">Research Consultant / Short-Term Work-for-Hire Research Engineer</p><p>Contributed to early-stage research and engineering on neural tokenizers, autoregressive sequence compression, self-supervised learning, and source separation. Helped convert under-specified internal problem statements into modeling directions and modular training/evaluation pipelines using DDP/FSDP workflows and H200 GPU clusters.</p></article></div></div></section>
        <section className="section contact" id="contact"><div className="container contact-card"><p className="eyebrow">Contact</p><h2>Interested in neural tokenization, sequence compression, or codec-native audio intelligence?</h2><p>I am open to research collaborations, postdoctoral opportunities, and industry research roles focused on self-supervised learning, multimodal foundation models, audio intelligence, and efficient token interfaces.</p><div className="hero-actions"><a className="button primary" href="mailto:adhirajbanerjee35@gmail.com">adhirajbanerjee35@gmail.com</a><a className="button" href="https://github.com/adhirajAI" target="_blank" rel="noreferrer">GitHub</a><a className="button" href="https://www.linkedin.com/in/adhiraj-banerjee-0051b01/" target="_blank" rel="noreferrer">LinkedIn</a></div></div></section>
      </main>
      <footer className="footer"><div className="container footer-inner"><p>© <span>{year}</span> Adhiraj Banerjee. Built for GitHub Pages.</p><a href="#top">Back to top</a></div></footer>
    </>
  );
}
