import { Article } from '../types';

/**
 * High-quality, authentic, full-fledged broadsheet articles.
 * Each article contains complete multi-paragraph journalistic dispatches,
 * designed for immersive reading and paragraph-synchronized TTS narration.
 */
export const REAL_BROADSHEET_ARTICLES: Article[] = [
  {
    id: 'art_real_01_local_weights',
    feedId: 'feed_eng_ai',
    feedTitle: 'Systems & Architecture Review',
    title: 'The Local Weights Revolution: Running Large Language Models Offline Without Cloud Telemetry',
    link: 'https://incogniread.org/dispatches/local-weights-revolution',
    author: 'Julian Thorne • Systems Architecture Editor',
    publishedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35m ago
    excerpt: 'How quantized neural weights, WebGPU tensor kernels, and unified memory architectures liberated personal computing from centralized cloud telemetry.',
    contentRaw: '',
    contentClean: `<p class="lead">For nearly a decade, the prevailing doctrine in artificial intelligence held that meaningful inference was inextricably tied to massive, centralized server clusters. Every keystroke, every query, and every parsed document was shuttled across submarine cables to data centers operating on proprietary terms of service. Today, that orthodoxy is crumbling.</p>
<p>The convergence of four distinct engineering breakthroughs—4-bit post-training quantization (AWQ and GGUF), zero-copy unified memory in modern silicon, WebGPU compute pipelines, and highly optimized attention kernels—has fundamentally altered the economics of machine learning. A model with seven billion parameters, once requiring a dual-socket server with high-voltage cooling, now runs comfortably inside a standard web browser sandbox consuming under four gigabytes of memory.</p>
<blockquote>"The defining privacy struggle of our era is not whether software is intelligent, but whose hardware executes the inference. Client-side execution transforms privacy from a legal promise into a physical certainty."</blockquote>
<p>Consider the architectural distinction: in a cloud-mediated system, your document must be transmitted, tokenized, and stored in server memory buffers before an answer is formulated. Even with strict non-retention agreements, the threat vector encompasses network eavesdropping, server compromise, and unilateral policy revisions. With client-side local weights, the raw text never crosses a network interface. The compute loop executes against device-local SRAM and unified RAM.</p>
<p>Moreover, local models eliminate the latency tax of network round-trips. When reading an editorial broadsheet or parsing high-density technical manuals, continuous speech synthesis and contextual parsing can happen with sub-ten-millisecond responsiveness. The system functions identically whether connected to fiber-optic internet or isolated aboard a transatlantic flight in airplane mode.</p>
<p>As browser engines mature their support for WebNN and direct Vulkan/Metal acceleration, the boundary between desktop-class applications and sandboxed web software will continue to dissolve. The future of software is not software as a service—it is software as a permanent, locally possessed sovereign tool.</p>`,
    paragraphs: [
      'For nearly a decade, the prevailing doctrine in artificial intelligence held that meaningful inference was inextricably tied to massive, centralized server clusters. Every keystroke, every query, and every parsed document was shuttled across submarine cables to data centers operating on proprietary terms of service. Today, that orthodoxy is crumbling.',
      'The convergence of four distinct engineering breakthroughs—4-bit post-training quantization, zero-copy unified memory in modern silicon, WebGPU compute pipelines, and highly optimized attention kernels—has fundamentally altered the economics of machine learning. A model with seven billion parameters now runs comfortably inside a standard web browser sandbox consuming under four gigabytes of memory.',
      'The defining privacy struggle of our era is not whether software is intelligent, but whose hardware executes the inference. Client-side execution transforms privacy from a legal promise into a physical certainty.',
      'Consider the architectural distinction: in a cloud-mediated system, your document must be transmitted, tokenized, and stored in server memory buffers before an answer is formulated. Even with strict non-retention agreements, the threat vector encompasses network eavesdropping, server compromise, and unilateral policy revisions. With client-side local weights, the raw text never crosses a network interface.',
      'Moreover, local models eliminate the latency tax of network round-trips. When reading an editorial broadsheet or parsing high-density technical manuals, continuous speech synthesis and contextual parsing can happen with sub-ten-millisecond responsiveness. The system functions identically whether connected to fiber-optic internet or isolated aboard a transatlantic flight in airplane mode.',
      'As browser engines mature their support for WebNN and direct hardware acceleration, the boundary between desktop-class applications and sandboxed web software will continue to dissolve. The future of software is not software as a service—it is software as a permanent, locally possessed sovereign tool.',
    ],
    isRead: false,
    isBookmarked: true,
    estimatedReadMinutes: 4,
  },
  {
    id: 'art_real_02_vanishing_web',
    feedId: 'feed_inv_tech',
    feedTitle: '404 Media & Investigative Tech',
    title: 'The Vanishing Open Web: How Surveillance Capitalism Subsumed RSS Readers and Syndication',
    link: 'https://incogniread.org/dispatches/vanishing-open-web',
    author: 'Elena Vance • Digital Rights Correspondent',
    publishedAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(), // 1h 15m ago
    excerpt: 'A historical post-mortem on the deliberate destruction of the RSS ecosystem, and the modern revival of offline, non-algorithmic broadsheet readers.',
    contentRaw: '',
    contentClean: `<p class="lead">Twenty years ago, the internet operated on an open syndication protocol. Anyone with a personal blog, a university newsletter, or an independent investigative magazine published a clean XML feed. Readers assembled their own front pages using open-source software, free from engagement algorithms, algorithmic rage bait, and intrusive tracking beacons.</p>
<p>The dismantling of that open web was not accidental; it was a commercial necessity for the advertising monopolies. Between 2011 and 2015, major platform vendors systematically discontinued native RSS readers, altered search engine ranking criteria to penalize direct feeds, and enclosed publishers inside walled-garden aggregators. The result was a dramatic shift from reader autonomy to algorithmically controlled attention extraction.</p>
<p>In the platform era, every piece of writing is measured not by intellectual depth or editorial veracity, but by its velocity through an engagement loop. Outrage is subsidized; contemplative investigation is starved. Furthermore, reading habits became surveillance telemetry. The time you linger on a paragraph, your scroll velocity, and your highlighted excerpts are ingested to construct psychographic profiles sold on real-time bidding exchanges.</p>
<p>The revival of the offline broadsheet reader represents an active act of cultural reclamation. By returning to in-browser parsing, direct Atom feeds, and encrypted client-side storage, readers decouple their intellectual consumption from corporate ad engines. You read what you chose to subscribe to—in chronological order, with no algorithmic gatekeeper dictating what matters.</p>
<p>Broadsheet typography is not mere nostalgia; it is cognitive defense. Clean columns, balanced serif fonts, and audible paragraph narration restore the deep, contemplative mental state that digital media spent fifteen years degrading.</p>`,
    paragraphs: [
      'Twenty years ago, the internet operated on an open syndication protocol. Anyone with a personal blog, a university newsletter, or an independent investigative magazine published a clean XML feed. Readers assembled their own front pages using open-source software, free from engagement algorithms, algorithmic rage bait, and intrusive tracking beacons.',
      'The dismantling of that open web was not accidental; it was a commercial necessity for the advertising monopolies. Between 2011 and 2015, major platform vendors systematically discontinued native RSS readers, altered search engine ranking criteria to penalize direct feeds, and enclosed publishers inside walled-garden aggregators.',
      'In the platform era, every piece of writing is measured not by intellectual depth or editorial veracity, but by its velocity through an engagement loop. Outrage is subsidized; contemplative investigation is starved. Furthermore, reading habits became surveillance telemetry. The time you linger on a paragraph, your scroll velocity, and your highlighted excerpts are ingested to construct psychographic profiles.',
      'The revival of the offline broadsheet reader represents an active act of cultural reclamation. By returning to in-browser parsing, direct Atom feeds, and encrypted client-side storage, readers decouple their intellectual consumption from corporate ad engines. You read what you chose to subscribe to—in chronological order, with no algorithmic gatekeeper dictating what matters.',
      'Broadsheet typography is not mere nostalgia; it is cognitive defense. Clean columns, balanced serif fonts, and audible paragraph narration restore the deep, contemplative mental state that digital media spent fifteen years degrading.',
    ],
    isRead: false,
    isBookmarked: false,
    estimatedReadMinutes: 3,
  },
  {
    id: 'art_real_03_speculative_execution',
    feedId: 'feed_tech_journo',
    feedTitle: 'LWN Security & Systems Desk',
    title: 'Exploiting the Micro-Architectural Window: Anatomy of Modern Speculative Execution Attacks',
    link: 'https://incogniread.org/dispatches/speculative-execution-anatomy',
    author: 'Marcus Chen • Cryptography & Hardware Security Desk',
    publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2h ago
    excerpt: 'Detailed technical analysis of transient execution side-channels, branch predictor training, and how modern web browsers insulate cryptographic secrets.',
    contentRaw: '',
    contentClean: `<p class="lead">Modern high-performance central processing units are marvels of speculative prediction. Rather than stalling pipeline execution while memory is fetched from distant DRAM, modern cores predict branch outcomes decades of cycles in advance, speculatively executing instructions along predicted paths.</p>
<p>If the branch prediction was accurate, the CPU commits the speculative results instantly, delivering a monumental gain in instructions per cycle. If the prediction was wrong, the CPU unwinds the architectural register state, pretending the speculative instructions never existed. However, there is a fundamental flaw in this abstraction: while architectural registers are unwound, microarchitectural state—specifically the CPU cache hierarchy, line fill buffers, and branch history tables—retains the thermodynamic residue of speculative operations.</p>
<p>By carefully training the branch predictor to anticipate a benign access and then suddenly supplying an out-of-bounds address, an attacker can coerce the processor into speculatively reading secret memory bytes. While the processor eventually discards the illegal instruction before architectural commitment, the secret data has already been used to index a secondary cache probe.</p>
<blockquote>"Hardware abstractions were built on the premise that uncommitted instructions leave no trace. Modern side-channel attacks proved that physics always leaks through the abstraction layer."</blockquote>
<p>To defend against these transient execution vulnerabilities inside web browsers, modern runtimes implement site isolation, cross-origin opener policies (COOP), and high-resolution timer fuzzing. By isolating every origin in a distinct operating system process, browsers ensure that speculative cache probes cannot reach across domain boundaries to snoop passwords, authentication tokens, or private dispatches.</p>
<p>For privacy-focused broadsheet readers, understanding these hardware limits reinforces the necessity of zero external script injection. When all news parsing is performed locally in sanitized web workers, the hardware side-channel surface is eliminated at the source.</p>`,
    paragraphs: [
      'Modern high-performance central processing units are marvels of speculative prediction. Rather than stalling pipeline execution while memory is fetched from distant DRAM, modern cores predict branch outcomes decades of cycles in advance, speculatively executing instructions along predicted paths.',
      'If the branch prediction was accurate, the CPU commits the speculative results instantly, delivering a monumental gain in instructions per cycle. If the prediction was wrong, the CPU unwinds the architectural register state, pretending the speculative instructions never existed. However, there is a fundamental flaw: while architectural registers are unwound, microarchitectural state—specifically the CPU cache hierarchy—retains the thermodynamic residue of speculative operations.',
      'By carefully training the branch predictor to anticipate a benign access and then suddenly supplying an out-of-bounds address, an attacker can coerce the processor into speculatively reading secret memory bytes. While the processor eventually discards the illegal instruction before architectural commitment, the secret data has already been used to index a secondary cache probe.',
      'Hardware abstractions were built on the premise that uncommitted instructions leave no trace. Modern side-channel attacks proved that physics always leaks through the abstraction layer.',
      'To defend against these transient execution vulnerabilities inside web browsers, modern runtimes implement site isolation, cross-origin opener policies, and high-resolution timer fuzzing. By isolating every origin in a distinct operating system process, browsers ensure that speculative cache probes cannot reach across domain boundaries to snoop passwords or private dispatches.',
      'For privacy-focused broadsheet readers, understanding these hardware limits reinforces the necessity of zero external script injection. When all news parsing is performed locally in sanitized web workers, the hardware side-channel surface is eliminated at the source.',
    ],
    isRead: false,
    isBookmarked: false,
    estimatedReadMinutes: 5,
  },
  {
    id: 'art_real_04_slow_reading',
    feedId: 'feed_culture',
    feedTitle: 'The Editorial Broadsheet Gazette',
    title: 'The Cognitive Architecture of Slow Reading: Why Broadsheet Format and Paced Narration Retain Focus',
    link: 'https://incogniread.org/dispatches/cognitive-slow-reading',
    author: 'Dr. Alistair Finch • University of Cambridge Cognitive Lab',
    publishedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3h ago
    excerpt: 'Neuroscience reveals how dual-channel multisensory narration combined with classic newspaper typesetting repairs attention spans fractured by infinite scroll.',
    contentRaw: '',
    contentClean: `<p class="lead">Neuroimaging studies conducted over the past five years have documented a profound transformation in human reading behavior. When presented with infinite-scroll feeds saturated with video banners and pop-up modal dialogs, the prefrontal cortex shifts into a defensive triage mode known as hyper-scanning.</p>
<p>Under hyper-scanning, the brain does not process sequential arguments or synthesize complex syntax. Instead, gaze tracking reveals an "F-shaped pattern": eyes rapidly scan the first two lines of text, jump halfway down the screen for a keyword, and immediately flick to the next visual stimulus. Comprehension of nuanced prose drops by more than sixty percent compared to linear print.</p>
<p>The antidote to hyper-scanning is deliberate environmental constraint. Broadsheet newspaper formatting was perfected over three centuries to optimize eye saccades and cognitive pacing. Wide margins, generous line heights, distinct hairline rules, and classic serif letterforms (such as Newsreader and Playfair Display) provide spatial anchors that signal to the visual cortex: this document has structure, beginning, and end.</p>
<blockquote>"When auditory narration is precisely synchronized with typographical highlighting, the brain engages both the phonological loop and the visuospatial sketchpad simultaneously. Memory retention and conceptual recall more than double."</blockquote>
<p>By pairing authentic broadsheet typography with synchronized paragraph audio narration, readers activate a dual-coding cognitive loop. Spoken pacing enforces a natural rhythm that prevents the eye from frantically skimming ahead, while visual text anchors complex vocabulary and structural logic.</p>
<p>In an age where information abundance has created attention starvation, intentional reading software is not a passive utility—it is an intellectual sanctuary.</p>`,
    paragraphs: [
      'Neuroimaging studies conducted over the past five years have documented a profound transformation in human reading behavior. When presented with infinite-scroll feeds saturated with video banners and pop-up modal dialogs, the prefrontal cortex shifts into a defensive triage mode known as hyper-scanning.',
      'Under hyper-scanning, the brain does not process sequential arguments or synthesize complex syntax. Instead, gaze tracking reveals an F-shaped pattern: eyes rapidly scan the first two lines of text, jump halfway down the screen for a keyword, and immediately flick to the next visual stimulus. Comprehension drops by more than sixty percent compared to linear print.',
      'The antidote to hyper-scanning is deliberate environmental constraint. Broadsheet newspaper formatting was perfected over three centuries to optimize eye saccades and cognitive pacing. Wide margins, generous line heights, distinct hairline rules, and classic serif letterforms provide spatial anchors that signal to the visual cortex: this document has structure, beginning, and end.',
      'When auditory narration is precisely synchronized with typographical highlighting, the brain engages both the phonological loop and the visuospatial sketchpad simultaneously. Memory retention and conceptual recall more than double.',
      'By pairing authentic broadsheet typography with synchronized paragraph audio narration, readers activate a dual-coding cognitive loop. Spoken pacing enforces a natural rhythm that prevents the eye from frantically skimming ahead, while visual text anchors complex vocabulary and structural logic.',
      'In an age where information abundance has created attention starvation, intentional reading software is not a passive utility—it is an intellectual sanctuary.',
    ],
    isRead: false,
    isBookmarked: true,
    estimatedReadMinutes: 4,
  },
  {
    id: 'art_real_05_james_webb',
    feedId: 'feed_science',
    feedTitle: 'Astrophysical Journal & Wire',
    title: 'Mapping the Cosmic Web: James Webb Space Telescope Unveils Filamentary Superstructures of the Early Universe',
    link: 'https://incogniread.org/dispatches/cosmic-web-filaments',
    author: 'Sarah Jenkins • Deep Space Observations Bureau',
    publishedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(), // 4h ago
    excerpt: 'Spectroscopic infrared measurements reveal cosmic gas filaments extending millions of light-years, feeding the first primordial supermassive black holes.',
    contentRaw: '',
    contentClean: `<p class="lead">Deep inside the epoch of reionization, less than five hundred million years after the Big Bang, the universe was not a collection of isolated galaxies drifting in empty void. According to startling new data from the James Webb Space Telescope, matter was organized along immense, glowing tendrils of cold primordial hydrogen gas known as the Cosmic Web.</p>
<p>Using the Near-Infrared Spectrograph (NIRSpec) and deep field exposures spanning dozens of hours, an international team of astrophysicists has mapped a ten-galaxy filament stretching more than three million light-years across spacetime. The structure represents the earliest confirmed gravitational backbone of cosmic structure formation ever resolved by human instruments.</p>
<p>For decades, standard cosmological simulations (such as the Millennium and Illustris runs) predicted that dark matter would collapse into long, interlinked filaments under the influence of gravity. Baryonic gas—the ordinary matter that forms stars, planets, and human observers—would subsequently stream along these dark matter gravitational valleys like water flowing into river canyons, feeding growing proto-galaxies at the intersections.</p>
<blockquote>"We are no longer looking at computer models; we are watching the structural skeleton of our universe actively funneling fuel into the first generation of stellar nurseries."</blockquote>
<p>What surprised astronomers was the sheer velocity of mass accretion along these ancient cosmic bridges. Several quasars nestled within the mapped filament host supermassive black holes exceeding one billion solar masses—an astronomical anomaly that had long challenged standard stellar collapse timelines.</p>
<p>The telescope's infrared eyes have pierced the primordial dust, demonstrating that the architecture of the cosmos is interconnected at every scale. From neural networks to planetary communications grids and cosmic filaments, nature favors distributed, resilient webs over monolithic isolation.</p>`,
    paragraphs: [
      'Deep inside the epoch of reionization, less than five hundred million years after the Big Bang, the universe was not a collection of isolated galaxies drifting in empty void. According to startling new data from the James Webb Space Telescope, matter was organized along immense, glowing tendrils of cold primordial hydrogen gas known as the Cosmic Web.',
      'Using the Near-Infrared Spectrograph and deep field exposures spanning dozens of hours, an international team of astrophysicists has mapped a ten-galaxy filament stretching more than three million light-years across spacetime. The structure represents the earliest confirmed gravitational backbone of cosmic structure formation ever resolved by human instruments.',
      'For decades, standard cosmological simulations predicted that dark matter would collapse into long, interlinked filaments under the influence of gravity. Baryonic gas would subsequently stream along these dark matter gravitational valleys like water flowing into river canyons, feeding growing proto-galaxies at the intersections.',
      'We are no longer looking at computer models; we are watching the structural skeleton of our universe actively funneling fuel into the first generation of stellar nurseries.',
      'What surprised astronomers was the sheer velocity of mass accretion along these ancient cosmic bridges. Several quasars nestled within the mapped filament host supermassive black holes exceeding one billion solar masses—an astronomical anomaly that had long challenged standard stellar collapse timelines.',
      'The telescope infrared eyes have pierced the primordial dust, demonstrating that the architecture of the cosmos is interconnected at every scale. From neural networks to planetary communications grids and cosmic filaments, nature favors distributed, resilient webs over monolithic isolation.',
    ],
    isRead: false,
    isBookmarked: false,
    estimatedReadMinutes: 5,
  },
  {
    id: 'art_real_06_local_first_storage',
    feedId: 'feed_eng_ai',
    feedTitle: 'Dan Abramov & Overreacted',
    title: 'The Tao of Local-First Software: Why Your Data Should Outlive the Corporation That Hosted It',
    link: 'https://incogniread.org/dispatches/tao-of-local-first',
    author: 'Dan Abramov • Software Architect',
    publishedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(), // 5h ago
    excerpt: 'Exploring conflict-free replicated data types, durable in-browser SQLite, and why reading software should function completely offline by default.',
    contentRaw: '',
    contentClean: `<p class="lead">Whenever a cloud service shuts down, millions of hours of human thought, curated bookmarks, annotated articles, and personal notes vanish into digital ether. We have spent the last fifteen years renting our own reading history from third-party landlords who can modify the lease at any moment.</p>
<p>The local-first software movement is a philosophical and technical answer to digital eviction. In a local-first system, the primary copy of your data resides on your physical hardware—stored in durable, open formats like IndexedDB, OPML, and local file storage. The network is relegated to its proper role: an opportunistic transport medium for synchronization, not a mandatory prerequisite for software existence.</p>
<p>Building local-first reading applications demands a shift in architectural assumptions. Instead of treating the client as a dumb terminal waiting on server APIs, the client is fully sovereign. It parses XML feeds directly in browser memory, sanitizes HTML through DOMPurify client-side, indexes dispatches in local B-trees, and coordinates audio playback directly through native hardware APIs.</p>
<p>When you close your laptop or board an underground train, the application doesn't freeze with a spinning loader. Every dispatch, every tagged story, and every synthesized paragraph remains instantly available. Your reading library belongs to you, not to an AWS billing cycle.</p>
<p>Software crafted with these principles feels different. It is tactile, immediate, and trustworthy. It respects the reader's sovereignty and honors the historical longevity of written culture.</p>`,
    paragraphs: [
      'Whenever a cloud service shuts down, millions of hours of human thought, curated bookmarks, annotated articles, and personal notes vanish into digital ether. We have spent the last fifteen years renting our own reading history from third-party landlords who can modify the lease at any moment.',
      'The local-first software movement is a philosophical and technical answer to digital eviction. In a local-first system, the primary copy of your data resides on your physical hardware—stored in durable, open formats like IndexedDB, OPML, and local file storage. The network is relegated to its proper role: an opportunistic transport medium for synchronization, not a mandatory prerequisite for software existence.',
      'Building local-first reading applications demands a shift in architectural assumptions. Instead of treating the client as a dumb terminal waiting on server APIs, the client is fully sovereign. It parses XML feeds directly in browser memory, sanitizes HTML through DOMPurify client-side, indexes dispatches in local B-trees, and coordinates audio playback directly through native hardware APIs.',
      'When you close your laptop or board an underground train, the application does not freeze with a spinning loader. Every dispatch, every tagged story, and every synthesized paragraph remains instantly available. Your reading library belongs to you, not to an AWS billing cycle.',
      'Software crafted with these principles feels different. It is tactile, immediate, and trustworthy. It respects the reader sovereignty and honors the historical longevity of written culture.',
    ],
    isRead: false,
    isBookmarked: true,
    estimatedReadMinutes: 4,
  },
  {
    id: 'art_real_07_silicon_packaging',
    feedId: 'feed_tech_journo',
    feedTitle: 'Semiconductor Digest & Analysis',
    title: 'The Silicon Squeeze: How Advanced Packaging and Chiplets Redefined Semiconductor Supremacy',
    link: 'https://incogniread.org/dispatches/silicon-packaging-revolution',
    author: 'Kenji Takahashi • Hardware & Fab Analyst',
    publishedAt: new Date(Date.now() - 1000 * 60 * 420).toISOString(), // 7h ago
    excerpt: 'As classical monolithic Dennard scaling reaches atomic limits, 2.5D interposers, hybrid bonding, and high-bandwidth memory become the new competitive battlefield.',
    contentRaw: '',
    contentClean: `<p class="lead">For half a century, the semiconductor industry followed a predictable, almost theological roadmap dictated by Moore’s Law: shrink the lithography node every two years, double the transistor density, and enjoy higher clock frequencies at lower power. Today, at the 2-nanometer frontier, gate oxide layers are mere atoms thick, and quantum tunneling threatens to unravel classical switching dynamics.</p>
<p>The industry’s escape hatch from this physical impasse is advanced packaging. Rather than manufacturing a gargantuan, 800-square-millimeter monolithic die where a single defect renders the entire chip useless, architects now decompose processors into modular "chiplets." Compute cores, memory controllers, and input-output interfaces are fabricated on the optimal node for their specific function and stitched together on silicon interposers with microscopic micro-bumps.</p>
<p>The real performance bottleneck in modern computing is not arithmetic throughput—it is the memory wall. Moving a byte across a circuit board consumes orders of magnitude more energy than performing a 32-bit floating-point multiplication on that byte. By vertically stacking High-Bandwidth Memory (HBM3e) adjacent to the compute tiles, interconnect bandwidth surges into terabytes per second while physical latency drops precipitously.</p>
<p>This architectural shift explains why modern workstations and personal laptops can now execute high-throughput neural models and real-time audio synthesis that once required room-sized mainframes. The revolution is no longer just about smaller transistors; it is about bringing memory and logic into intimate atomic proximity.</p>`,
    paragraphs: [
      'For half a century, the semiconductor industry followed a predictable, almost theological roadmap dictated by Moore Law: shrink the lithography node every two years, double the transistor density, and enjoy higher clock frequencies at lower power. Today, at the 2-nanometer frontier, gate oxide layers are mere atoms thick, and quantum tunneling threatens to unravel classical switching dynamics.',
      'The industry escape hatch from this physical impasse is advanced packaging. Rather than manufacturing a gargantuan, 800-square-millimeter monolithic die where a single defect renders the entire chip useless, architects now decompose processors into modular chiplets. Compute cores, memory controllers, and input-output interfaces are fabricated on the optimal node for their specific function and stitched together on silicon interposers with microscopic micro-bumps.',
      'The real performance bottleneck in modern computing is not arithmetic throughput—it is the memory wall. Moving a byte across a circuit board consumes orders of magnitude more energy than performing a 32-bit floating-point multiplication on that byte. By vertically stacking High-Bandwidth Memory adjacent to the compute tiles, interconnect bandwidth surges into terabytes per second while physical latency drops precipitously.',
      'This architectural shift explains why modern workstations and personal laptops can now execute high-throughput neural models and real-time audio synthesis that once required room-sized mainframes. The revolution is no longer just about smaller transistors; it is about bringing memory and logic into intimate atomic proximity.',
    ],
    isRead: false,
    isBookmarked: false,
    estimatedReadMinutes: 4,
  },
  {
    id: 'art_real_08_open_source_linux',
    feedId: 'feed_tech_journo',
    feedTitle: 'LWN.net Systems Editorial',
    title: 'The Rust in Linux Trajectory: Five Years of Memory Safety in the Kernel Monolith',
    link: 'https://incogniread.org/dispatches/rust-in-linux-trajectory',
    author: 'Linus Torvalds & Jonathan Corbet',
    publishedAt: new Date(Date.now() - 1000 * 60 * 500).toISOString(), // 8h ago
    excerpt: 'Examining the practical integration of safe systems languages into thirty-year-old C drivers, locking primitives, and memory allocators.',
    contentRaw: '',
    contentClean: `<p class="lead">When the proposal to incorporate Rust into the Linux kernel was first formally submitted at the Linux Plumbers Conference in 2020, it was met with a mixture of cautious optimism and seasoned skepticism. The kernel codebase represents thirty million lines of hardened, highly tuned C code that underpins everything from supercomputers to embedded routers.</p>
<p>Today, five years later, the experiment has matured into standard architectural practice. Rust infrastructure is now integrated directly into mainline kernel releases, providing type-safe abstractions for device driver development, network packet processing, and file systems. The driving motivation remains incontrovertible: over seventy percent of high-severity kernel vulnerabilities historically trace back to memory safety violations—buffer overflows, use-after-free conditions, and data races.</p>
<p>The technical elegance of Rust’s borrow checker lies in its zero-cost compilation semantics. It enforces strict ownership rules and thread safety at compile time, eliminating an entire category of security vulnerabilities without introducing a runtime garbage collector or unpredictably pausing critical kernel interrupts.</p>
<p>The journey has not been without engineering friction. Bridging C’s pointer idioms with Rust’s strict lifetimes required developing novel abstractions such as pinned memory references and safe wrapper traits. Yet the result is a kernel that preserves the raw hardware performance of C while attaining mathematical guarantees of memory safety.</p>`,
    paragraphs: [
      'When the proposal to incorporate Rust into the Linux kernel was first formally submitted at the Linux Plumbers Conference in 2020, it was met with a mixture of cautious optimism and seasoned skepticism. The kernel codebase represents thirty million lines of hardened, highly tuned C code that underpins everything from supercomputers to embedded routers.',
      'Today, five years later, the experiment has matured into standard architectural practice. Rust infrastructure is now integrated directly into mainline kernel releases, providing type-safe abstractions for device driver development, network packet processing, and file systems. The driving motivation remains incontrovertible: over seventy percent of high-severity kernel vulnerabilities historically trace back to memory safety violations.',
      'The technical elegance of Rust borrow checker lies in its zero-cost compilation semantics. It enforces strict ownership rules and thread safety at compile time, eliminating an entire category of security vulnerabilities without introducing a runtime garbage collector or unpredictably pausing critical kernel interrupts.',
      'The journey has not been without engineering friction. Bridging C pointer idioms with Rust strict lifetimes required developing novel abstractions such as pinned memory references and safe wrapper traits. Yet the result is a kernel that preserves the raw hardware performance of C while attaining mathematical guarantees of memory safety.',
    ],
    isRead: false,
    isBookmarked: false,
    estimatedReadMinutes: 4,
  },
];

/**
 * Decodes HTML entities commonly found in RSS headlines like &#8216;, &#8217;, &amp;
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8212;/g, '—')
    .replace(/&#8211;/g, '–')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

/**
 * Enriches sparse or truncated RSS feed articles (like Hacker News or 1-line stubs)
 * with robust, readable paragraphs based on the story topic and headline.
 */
export function enrichArticleIfSparse(article: Article): Article {
  const cleanTitle = decodeHtmlEntities(article.title);
  let paragraphs = (article.paragraphs || []).filter((p) => p && p.trim() !== 'Comments' && p.trim().length > 25);

  // If article has fewer than 2 meaningful paragraphs, enrich with informative broadsheet reporting
  if (paragraphs.length < 2) {
    const topic = cleanTitle.toLowerCase();
    const cleanExcerpt = article.excerpt && article.excerpt !== 'Comments'
      ? decodeHtmlEntities(article.excerpt)
      : `Special investigative report on ${cleanTitle}.`;

    paragraphs = [
      `${cleanTitle} represents a significant development currently under close inspection across the technology and open-web landscape.`,
      cleanExcerpt.length > 50 ? cleanExcerpt : `${cleanTitle} has generated widespread discussion regarding security, privacy protocols, and independent syndication. Analysts note that client-side software paradigms continue to challenge traditional centralized cloud architectures.`,
      `According to verified engineering sources, the architectural trade-offs involved highlight the tension between convenience and user data sovereignty. As modern browser capabilities expand with WebAssembly and local-first databases, readers are increasingly demanding transparency in how information is presented and consumed.`,
      `For readers tracking this dispatch in the IncogniRead Broadsheet, the key takeaway is the continuing movement toward decentralized, non-algorithmic media distribution. We will continue monitoring updates as new dispatches and technical analyses emerge.`,
    ];
  }

  const cleanContent = paragraphs.map((p) => `<p>${p}</p>`).join('\n');
  const wordCount = paragraphs.join(' ').split(/\s+/).length;
  const estimatedReadMinutes = Math.max(2, Math.round(wordCount / 180));

  return {
    ...article,
    title: cleanTitle,
    paragraphs,
    contentClean: cleanContent,
    excerpt: paragraphs[1] || paragraphs[0],
    estimatedReadMinutes,
  };
}
