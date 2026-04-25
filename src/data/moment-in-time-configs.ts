/**
 * "Moment in Time" companion data for lifecycle example slides.
 * Each config shows the current landscape of a domain, positioning
 * competing/related technologies across lifecycle stages as of 2025.
 *
 * Used by slides 30-32 (companions to slides 27-29) and slide 34 (companion to slide 33).
 */

export interface MomentTechnology {
  /** Technology name */
  name: string
  /** Brief description or context */
  detail: string
}

export interface MomentInTimeStage {
  /** Lifecycle stage label */
  stage: string
  /** Color matching the lifecycle timeline charts */
  color: string
  /** Optional text color for contrast */
  textColor?: string
  /** Technologies currently in this stage */
  technologies: MomentTechnology[]
}

export interface MomentInTimeConfig {
  /** Slide title */
  title: string
  /** Domain subtitle */
  subtitle: string
  /** The snapshot year */
  asOf: string
  /** Lifecycle stages with positioned technologies */
  stages: MomentInTimeStage[]
  /** Source citations */
  source: string
}

export const MOMENT_IN_TIME_CONFIGS: Record<number, MomentInTimeConfig> = {
  // Slide 30: Companion to Slide 27 (HDDs) - Data Center Storage landscape
  30: {
    title: 'Data Center Storage: A Moment in Time',
    subtitle: 'Where storage technologies sit today across the adoption lifecycle',
    asOf: '2025',
    stages: [
      {
        stage: 'Bleeding Edge',
        color: '#fbbf24',
        technologies: [
          {
            name: 'DNA Data Storage',
            detail: 'Microsoft/Twist Bio - lab-stage, years from production',
          },
          {
            name: 'Glass Storage (Project Silica)',
            detail: 'Microsoft Research - quartz glass, archival prototype',
          },
          {
            name: 'CXL-attached Storage',
            detail: 'CXL 3.0 memory pooling - early silicon, no ecosystem yet',
          },
        ],
      },
      {
        stage: 'Leading Edge',
        color: '#22d3ee',
        technologies: [
          {
            name: 'QLC NVMe SSDs (60+ TB)',
            detail: 'Solidigm D5-P5336 61TB - shipping, early enterprise adoption',
          },
          {
            name: 'Computational Storage',
            detail: 'Samsung CSD - processing at the drive, niche HPC workloads',
          },
          { name: 'PCIe Gen 5 NVMe', detail: 'Shipping in high-end servers, ecosystem maturing' },
        ],
      },
      {
        stage: 'Mainstream',
        color: '#22c55e',
        technologies: [
          {
            name: 'TLC NVMe SSDs',
            detail: 'Default for primary storage - Samsung, Micron, SK hynix',
          },
          { name: 'SAS/SATA SSDs', detail: 'Workhorse enterprise drives - proven, cost-effective' },
          {
            name: 'All-Flash Arrays (AFA)',
            detail: 'Pure Storage, NetApp AFF, Dell PowerStore - standard tier-1',
          },
          {
            name: 'Object Storage (S3-compatible)',
            detail: 'MinIO, Ceph, cloud-native - dominant for unstructured data',
          },
        ],
      },
      {
        stage: 'Trending Behind',
        color: '#f97316',
        technologies: [
          {
            name: 'High-capacity HDDs (20+ TB)',
            detail: 'Seagate Exos, WD Ultrastar - bulk/cold storage, declining share',
          },
          {
            name: 'Hybrid Flash Arrays',
            detail: 'Mix of SSD + HDD tiers - being replaced by all-flash',
          },
          {
            name: 'SAN (Fibre Channel)',
            detail: 'Still in legacy enterprise - NVMe-oF displacing for new deployments',
          },
        ],
      },
      {
        stage: 'End of Support',
        color: '#ef4444',
        textColor: '#fff',
        technologies: [
          {
            name: 'Consumer HDDs (< 4 TB)',
            detail: 'Production winding down - no new consumer models',
          },
          {
            name: 'SAS 12 Gbps HDDs',
            detail: 'Legacy enterprise - vendors shifting to SSD-only portfolios',
          },
        ],
      },
      {
        stage: 'End of Life',
        color: '#991b1b',
        textColor: '#fff',
        technologies: [
          {
            name: 'Tape Libraries (LTO-5 and earlier)',
            detail: 'No parts, no media - fully obsolete',
          },
          {
            name: '10K/15K RPM HDDs',
            detail: 'Performance HDDs killed by SSDs - no longer manufactured',
          },
        ],
      },
    ],
    source:
      'Sources: IDC Worldwide SSD/HDD Forecast (2024); Gartner Storage MQ (2024); StorageNewsletter.com (2025)',
  },

  // Slide 31: Companion to Slide 28 (Flash) - Rich Web Experiences landscape
  31: {
    title: 'Rich Web Experiences: A Moment in Time',
    subtitle: 'Where web interaction technologies sit today across the adoption lifecycle',
    asOf: '2025',
    stages: [
      {
        stage: 'Bleeding Edge',
        color: '#fbbf24',
        technologies: [
          {
            name: 'WebGPU',
            detail: 'GPU compute in browser - Chrome shipped, Safari/Firefox partial',
          },
          {
            name: 'WebTransport',
            detail: 'HTTP/3-based bidirectional - replacing WebSocket for real-time',
          },
          {
            name: 'View Transitions API',
            detail: 'SPA/MPA page transitions - Chrome only, spec evolving',
          },
        ],
      },
      {
        stage: 'Leading Edge',
        color: '#22d3ee',
        technologies: [
          {
            name: 'WebAssembly (Wasm)',
            detail: 'Near-native performance - Figma, Photoshop, game engines',
          },
          {
            name: 'Web Components (Lit, Stencil)',
            detail: 'Framework-agnostic - growing in design systems',
          },
          {
            name: 'WebXR / Immersive Web',
            detail: 'VR/AR in browser - Meta Quest, Apple Vision Pro support',
          },
        ],
      },
      {
        stage: 'Mainstream',
        color: '#22c55e',
        technologies: [
          { name: 'HTML5 Canvas / SVG', detail: 'Universal - charts, games, interactive graphics' },
          {
            name: 'CSS Animations / Transitions',
            detail: 'Hardware-accelerated - replaced Flash for most motion',
          },
          {
            name: 'JavaScript SPA Frameworks',
            detail: 'React, Vue, Angular - dominant interactive web platform',
          },
          { name: 'WebSocket', detail: 'Real-time communication - chat, live data, collaboration' },
        ],
      },
      {
        stage: 'Trending Behind',
        color: '#f97316',
        technologies: [
          { name: 'jQuery', detail: 'Still on 77% of websites - declining in new projects' },
          {
            name: 'Server-rendered MPA (traditional)',
            detail: 'Rails, PHP templates - moving to hybrid (HTMX, Turbo)',
          },
          {
            name: 'Java Applets (legacy enterprise)',
            detail: 'Internal tools only - no browser support since 2020',
          },
        ],
      },
      {
        stage: 'End of Support',
        color: '#ef4444',
        textColor: '#fff',
        technologies: [
          { name: 'Adobe Flash', detail: 'Kill switch activated Jan 2021 - zero browser support' },
          { name: 'Microsoft Silverlight', detail: 'EOL Oct 2021 - removed from all browsers' },
        ],
      },
      {
        stage: 'End of Life',
        color: '#991b1b',
        textColor: '#fff',
        technologies: [
          { name: 'ActiveX Controls', detail: 'IE-only - IE itself EOL June 2022' },
          { name: 'Java Web Start / JNLP', detail: 'Removed from JDK 11+ - no runtime available' },
        ],
      },
    ],
    source:
      'Sources: W3Techs Usage Statistics (2025); Can I Use browser compat (2025); HTTP Archive Web Almanac (2024)',
  },

  // Slide 32: Companion to Slide 29 (Barcodes) - Supply Chain Identification landscape
  32: {
    title: 'Supply Chain Identification: A Moment in Time',
    subtitle:
      'Where identification and tracking technologies sit today across the adoption lifecycle',
    asOf: '2025',
    stages: [
      {
        stage: 'Bleeding Edge',
        color: '#fbbf24',
        technologies: [
          {
            name: 'Blockchain Track-and-Trace',
            detail: 'IBM Food Trust, TradeLens (shut down) - hype cooling',
          },
          {
            name: 'Computer Vision Checkout',
            detail: 'Amazon Just Walk Out - scaling back, accuracy issues',
          },
          {
            name: 'Digital Twins for Supply Chain',
            detail: 'Real-time simulation - pilot stage, high complexity',
          },
        ],
      },
      {
        stage: 'Leading Edge',
        color: '#22d3ee',
        technologies: [
          {
            name: 'GS1 Digital Link QR Codes',
            detail: 'Sunrise 2027 initiative - major CPGs adopting, retailers lagging',
          },
          {
            name: 'UHF RFID (item-level retail)',
            detail: 'Zara, Nike, Walmart - 30B+ tags/year, but not universal',
          },
          {
            name: 'IoT Sensors (cold chain)',
            detail: 'Temperature/location tracking - pharma and food adoption growing',
          },
        ],
      },
      {
        stage: 'Mainstream',
        color: '#22c55e',
        technologies: [
          {
            name: '1D Barcodes (UPC/EAN)',
            detail: '6B+ scans/day - universal retail, still the global standard',
          },
          {
            name: '2D Barcodes (QR/Data Matrix)',
            detail: 'Payments, marketing, pharma serialization - broad adoption',
          },
          {
            name: 'RFID (pallet/case level)',
            detail: 'Walmart mandate since 2003 - standard in logistics/warehouse',
          },
          {
            name: 'EDI (Electronic Data Interchange)',
            detail: 'B2B standard since 1980s - deeply embedded, slow to change',
          },
        ],
      },
      {
        stage: 'Trending Behind',
        color: '#f97316',
        technologies: [
          {
            name: '1D Barcodes (proprietary formats)',
            detail: 'Custom retailer codes - migrating to GS1 standards',
          },
          {
            name: 'Manual Data Entry / Paper-based',
            detail: 'Still used in developing markets - digitization replacing',
          },
          {
            name: 'Older EDI Standards (ANSI X12)',
            detail: 'Being supplemented by API-based B2B integration',
          },
        ],
      },
      {
        stage: 'End of Support',
        color: '#ef4444',
        textColor: '#fff',
        technologies: [
          {
            name: 'Magnetic Stripe Inventory Tags',
            detail: 'Replaced by RFID - no new deployments',
          },
          { name: 'Punch Card Inventory Systems', detail: 'Museum pieces - no vendor support' },
        ],
      },
      {
        stage: 'End of Life',
        color: '#991b1b',
        textColor: '#fff',
        technologies: [
          {
            name: 'Kimball Tags (retail price tickets)',
            detail: 'Perforated paper tags - fully obsolete since 1990s',
          },
          {
            name: 'OCR-A Font Scanning',
            detail: 'Pre-barcode optical reading - no scanners in service',
          },
        ],
      },
    ],
    source:
      'Sources: GS1 Sunrise 2027 (2024); IDTechEx RFID Forecast (2024); McKinsey Supply Chain 4.0 (2024)',
  },

  // Slide 34: Companion to Slide 33 (ML/AI) - AI/ML landscape
  34: {
    title: 'ML/AI: A Moment in Time',
    subtitle: 'Where machine learning and AI technologies sit today across the adoption lifecycle',
    asOf: '2025',
    stages: [
      {
        stage: 'Bleeding Edge',
        color: '#fbbf24',
        technologies: [
          {
            name: 'Artificial General Intelligence (AGI)',
            detail: 'Theoretical - no consensus on timeline or definition',
          },
          {
            name: 'Neuromorphic Computing',
            detail: 'Intel Loihi 2, IBM NorthPole - brain-inspired chips, lab-stage',
          },
          {
            name: 'Quantum Machine Learning',
            detail: 'Hybrid quantum-classical - error rates too high for production',
          },
        ],
      },
      {
        stage: 'Leading Edge',
        color: '#22d3ee',
        technologies: [
          {
            name: 'AI Agents (autonomous)',
            detail: 'Multi-step tool use - Claude, GPT, Gemini agents emerging',
          },
          {
            name: 'Multimodal Foundation Models',
            detail: 'GPT-4o, Gemini, Claude - text+image+audio, rapidly maturing',
          },
          {
            name: 'On-device / Edge LLMs',
            detail: 'Apple Intelligence, Gemini Nano - privacy-first, limited capability',
          },
          {
            name: 'AI Code Generation',
            detail: 'Copilot, Claude Code, Cursor - high adoption among developers, evolving fast',
          },
        ],
      },
      {
        stage: 'Mainstream',
        color: '#22c55e',
        technologies: [
          {
            name: 'Large Language Models (LLMs)',
            detail: 'ChatGPT, Claude, Gemini - 100M+ users, enterprise SaaS standard',
          },
          {
            name: 'Image Generation (Diffusion)',
            detail: 'Midjourney, DALL-E, Stable Diffusion - creative/marketing standard',
          },
          {
            name: 'MLOps Platforms',
            detail: 'MLflow, Weights & Biases, SageMaker - standard ML infrastructure',
          },
          {
            name: 'Recommendation Systems',
            detail: 'Netflix, Spotify, Amazon - embedded in every platform, invisible',
          },
        ],
      },
      {
        stage: 'Trending Behind',
        color: '#f97316',
        technologies: [
          {
            name: 'Traditional ML (sklearn pipelines)',
            detail: 'Random forests, SVMs, XGBoost - still used, losing ground to deep learning',
          },
          {
            name: 'Rule-based Expert Systems',
            detail: 'If-then engines - legacy enterprise, being replaced by ML models',
          },
          {
            name: 'RNNs / LSTMs for NLP',
            detail: 'Sequence models pre-transformer - superseded by attention architectures',
          },
        ],
      },
      {
        stage: 'End of Support',
        color: '#ef4444',
        textColor: '#fff',
        technologies: [
          {
            name: 'First-gen Chatbots (keyword-based)',
            detail: 'Pattern-matching bots - replaced by LLM-powered assistants',
          },
          {
            name: 'TensorFlow 1.x',
            detail: 'Session-based API - deprecated, no security patches after 2023',
          },
        ],
      },
      {
        stage: 'End of Life',
        color: '#991b1b',
        textColor: '#fff',
        technologies: [
          {
            name: 'Expert System Shells (CLIPS, Jess)',
            detail: '1980s/90s AI tooling - no active development or community',
          },
          {
            name: 'Symbolic AI Frameworks (Cyc, Prolog-based)',
            detail: 'Knowledge-base reasoning - academic only, no commercial use',
          },
        ],
      },
    ],
    source:
      'Sources: Stanford HAI AI Index (2024); Gartner AI Hype Cycle (2024); State of AI Report (2024)',
  },

  // Slide 35: LLM-specific moment in time - tighter focus than slide 34
  35: {
    title: 'Large Language Models: A Moment in Time',
    subtitle: 'Where LLM technologies, architectures, and tooling sit today - zoomed in',
    asOf: '2025',
    stages: [
      {
        stage: 'Bleeding Edge',
        color: '#fbbf24',
        technologies: [
          {
            name: 'Persistent Memory LLMs',
            detail: 'Infinite context via memory systems - MemGPT, research-stage',
          },
          {
            name: 'Mixture-of-Agents (MoA)',
            detail: 'Multi-LLM orchestration - Together AI research, no production standard',
          },
          {
            name: 'Self-improving / Self-play',
            detail: 'Models that improve via own output - alignment risks unresolved',
          },
        ],
      },
      {
        stage: 'Leading Edge',
        color: '#22d3ee',
        technologies: [
          {
            name: 'Reasoning Models (o1, Claude)',
            detail: 'Chain-of-thought at inference - OpenAI o1/o3, shipping but evolving fast',
          },
          {
            name: 'Agentic Tool Use',
            detail: 'Claude Code, Devin, Codex - autonomous multi-step coding/research',
          },
          {
            name: 'On-device LLMs (< 7B)',
            detail: 'Gemini Nano, Phi-3, Llama 3 mobile - privacy-first, limited capability',
          },
          {
            name: 'Long-context (1M+ tokens)',
            detail: 'Gemini 1.5 Pro, Claude - shipping but retrieval quality degrades at scale',
          },
        ],
      },
      {
        stage: 'Mainstream',
        color: '#22c55e',
        technologies: [
          {
            name: 'Cloud LLM APIs',
            detail: 'OpenAI, Anthropic, Google - enterprise standard, usage-based pricing',
          },
          {
            name: 'RAG (Retrieval-Augmented Gen)',
            detail: 'Vector DB + LLM - standard enterprise pattern for grounded answers',
          },
          {
            name: 'Instruction-tuned Chat Models',
            detail: 'ChatGPT, Claude, Gemini chat - 100M+ users, default interface',
          },
          {
            name: 'Open-weight Models (7B-70B)',
            detail: 'Llama 3, Mistral, Qwen - self-hosted enterprise, fine-tuning standard',
          },
        ],
      },
      {
        stage: 'Trending Behind',
        color: '#f97316',
        technologies: [
          {
            name: 'GPT-3 / text-davinci',
            detail: 'Original completion API - deprecated by OpenAI, replaced by chat models',
          },
          {
            name: 'BERT / RoBERTa (standalone)',
            detail: 'Encoder-only models - still in legacy pipelines, LLMs handle these tasks now',
          },
          {
            name: 'Basic Prompt Engineering',
            detail: 'Simple few-shot prompts - giving way to structured tool use and agents',
          },
        ],
      },
      {
        stage: 'End of Support',
        color: '#ef4444',
        textColor: '#fff',
        technologies: [
          {
            name: 'GPT-2 (standalone)',
            detail: '2019 model - no API, outperformed by every current model',
          },
          {
            name: 'Early Seq2seq Chatbots',
            detail: 'Pre-transformer NLG - Google Meena, Facebook BlenderBot 1.0',
          },
        ],
      },
      {
        stage: 'End of Life',
        color: '#991b1b',
        textColor: '#fff',
        technologies: [
          {
            name: 'ELIZA / PARRY',
            detail: '1960s pattern-matching - historical curiosity, zero practical use',
          },
          {
            name: 'Markov Chain Text Generation',
            detail: 'Statistical n-gram models - replaced entirely by neural approaches',
          },
        ],
      },
    ],
    source:
      'Sources: OpenAI Model Deprecations (2025); Anthropic Model Cards (2025); Hugging Face Open LLM Leaderboard (2025)',
  },
}
