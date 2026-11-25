(() => {
  'use strict';

  /* ============================================================================
     1. STORAGE & CONFIG (Backend-Ready Adapter for Vercel / Render PostgreSQL)
     ============================================================================ */
  const STORAGE_KEY = 'CYBER_QUEST_PRIVATE_CLUB_V1';

  const DEFAULT_STATE = {
    accessKeys: {
      news: 'NEWS-CQ26',
      research: 'RES-CQ26',
      professor: 'PROF-MASTER-2026',
      admin: 'ADMIN-MASTER-2026',
    },
    users: [
      {
        id: 'CQ-STU-101',
        name: 'Aarav Sharma',
        role: 'student',
        password: 'pass123',
        xp: 220,
        completedQuizzes: ['qz-1'],
        domainScores: {
          'Network Security': 85,
          'Web & AppSec': 70,
          'Threat Intelligence': 65,
          'Cryptography': 60,
          'Social Engineering': 90,
        },
      },
    ],
    reports: [
      {
        id: 'rep-1',
        category: 'NEWS',
        domain: 'Social Engineering',
        title: 'Cyber Flash: Surge in AI Voice-Clone Phishing Targeting Students',
        summary: 'News Team awareness alert detailing real-time voice synthesis scams and verification protocols.',
        content:
          'Attackers are leveraging 3-second audio samples from public social media reels to spoof urgent calls. Always verify financial or credential requests via a secondary out-of-band channel.',
        author: 'News Team Desk',
        role: 'news',
        refLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        createdAt: '2026-11-24',
      },
      {
        id: 'rep-2',
        category: 'RESEARCH',
        domain: 'Web & AppSec',
        title: 'Technical Advisory: Broken Object Level Authorization (BOLA) in REST APIs',
        summary: 'Research Team breakdown of IDOR/BOLA flaws in modern student web portals and mitigation patterns.',
        content:
          'When endpoints rely solely on client-supplied resource IDs without verifying session ownership server-side, attackers enumerate records trivially. Enforce strict RBAC middleware on every route.',
        author: 'Research Division',
        role: 'research',
        refLink: '',
        createdAt: '2026-11-25',
      },
    ],
    lessons: [
      {
        id: 'les-1',
        title: 'Lecture 01: Packet Analysis & Network Reconnaissance',
        type: 'Lecture',
        domain: 'Network Security',
        instructor: 'Professor & Club Admin',
        url: 'https://www.youtube.com/embed/qiQR5rTSshw',
        desc: 'Foundational walkthrough of TCP/IP handshakes, ARP spoofing detection, and Wireshark display filters.',
      },
      {
        id: 'les-2',
        title: 'CyberPulse Daily: Locking Down Personal Accounts & 2FA',
        type: 'Awareness',
        domain: 'Social Engineering',
        instructor: 'News & Awareness Team',
        url: 'https://www.youtube.com/embed/hpair2-59nU',
        desc: 'Practical guide to hardware security keys, authenticator apps, and credential hygiene.',
      },
    ],
    quizzes: [
      {
        id: 'qz-1',
        title: 'API Security & BOLA Defense Assessment',
        domain: 'Web & AppSec',
        xp: 120,
        questions: [
          {
            q: 'What is the primary root cause of Broken Object Level Authorization (BOLA)?',
            options: [
              'Weak TLS cipher suites on the load balancer',
              'Failing to verify whether the authenticated user owns the requested object ID',
              'Using Base64 encoding for session cookies',
              'Missing Content-Security-Policy headers',
            ],
            correct: 1,
          },
          {
            q: 'Which defense best prevents unauthorized ID enumeration on sensitive records?',
            options: [
              'Hiding the API route from frontend JavaScript',
              'Server-side ownership checks paired with non-sequential UUIDs',
              'Client-side form validation',
              'Disabling CORS preflight requests',
            ],
            correct: 1,
          },
        ],
      },
      {
        id: 'qz-2',
        title: 'Social Engineering & Voice Phishing Readiness',
        domain: 'Social Engineering',
        xp: 100,
        questions: [
          {
            q: 'You receive an urgent call sounding identical to your professor asking for your portal OTP. What is the safest action?',
            options: [
              'Read the OTP quickly to avoid academic penalties',
              'Hang up and verify through an independent, pre-verified channel',
              'Ask the caller to repeat your student ID',
              'Reply via SMS with a partial code',
            ],
            correct: 1,
          },
        ],
      },
    ],
    meetings: [
      {
        id: 'mtg-1',
        title: 'Live Lecture: Threat Modeling & Live SOC Triage',
        date: '2026-11-29T18:30',
        host: 'Professor Mentor & Admin',
        link: 'https://meet.google.com',
        agenda: 'Interactive walkthrough of live log triage followed by Q&A with News & Research teams.',
      },
    ],
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATE));
        return structuredClone(DEFAULT_STATE);
      }
      return JSON.parse(raw);
    } catch {
      return structuredClone(DEFAULT_STATE);
    }
  }

  let db = loadState();
  let currentUser = null;

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }

  /* ============================================================================
     2. ANIMATED CYBER BACKGROUND ENGINE (MESH / MATRIX / RADAR)
     ============================================================================ */
  const bgEngine = (() => {
    const canvas = document.getElementById('cyberBgCanvas');
    const ctx = canvas.getContext('2d');
    let mode = localStorage.getItem('CQ_BG_MODE') || 'MESH';
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    });

    const nodes = Array.from({ length: 48 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.55,
    }));

    const cols = Math.floor(w / 20);
    const drops = Array.from({ length: cols }, () => Math.random() * -50);
    let radarAngle = 0;

    function drawMesh() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;

        ctx.fillStyle = 'rgba(0, 240, 255, 0.55)';
        ctx.beginPath();
        ctx.arc(a.x, a.y, 2, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 145) {
            ctx.strokeStyle = `rgba(0, 240, 255, ${(1 - dist / 145) * 0.22})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    }

    function drawMatrix() {
      ctx.fillStyle = 'rgba(5, 8, 17, 0.14)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#00f0ff';
      ctx.font = '14px JetBrains Mono, monospace';
      const chars = '01ABCDEF#$%&*';
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * 20, drops[i] * 20);
        if (drops[i] * 20 > h && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.65;
      }
    }

    function drawRadar() {
      ctx.fillStyle = 'rgba(5, 8, 17, 0.18)';
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.min(w, h) * 0.42;

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.14)';
      for (let r = maxR / 4; r <= maxR; r += maxR / 4) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      radarAngle += 0.015;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.55)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(radarAngle) * maxR, cy + Math.sin(radarAngle) * maxR);
      ctx.stroke();
    }

    function loop() {
      if (mode === 'MATRIX') drawMatrix();
      else if (mode === 'RADAR') drawRadar();
      else drawMesh();
      requestAnimationFrame(loop);
    }
    loop();

    return {
      setMode(newMode) {
        mode = newMode;
        localStorage.setItem('CQ_BG_MODE', newMode);
        document.querySelectorAll('.bg-mode-btn').forEach((btn) => {
          btn.classList.toggle('active', btn.dataset.bg === newMode);
        });
      },
      getMode: () => mode,
    };
  })();

  /* ============================================================================
     3. CINEMATIC INTRO BOOT SEQUENCE
     ============================================================================ */
  const introOverlay = document.getElementById('introOverlay');
  const bootTerminal = document.getElementById('bootTerminal');
  const bootProgressBar = document.getElementById('bootProgressBar');
  const enterPortalBtn = document.getElementById('enterPortalBtn');
  const authGate = document.getElementById('authGate');

  const BOOT_LINES = [
    '[OK] Initializing CYBER//QUEST Private Collective Kernel...',
    '[OK] Mounting Role-Based Access Control (Student / News / Research / Prof / Admin)...',
    '[OK] Syncing Threat Intelligence & Awareness Broadcast Feeds...',
    '[OK] Telemetry & Skill Ability Radar Online. Ready for Authentication.',
  ];

  function runIntroSequence() {
    introOverlay.classList.remove('hidden', 'fade-out');
    bootTerminal.innerHTML = '';
    bootProgressBar.style.width = '0%';
    enterPortalBtn.disabled = true;
    enterPortalBtn.textContent = 'INITIALIZING NODE...';

    BOOT_LINES.forEach((line, idx) => {
      setTimeout(() => {
        const div = document.createElement('div');
        div.textContent = line;
        bootTerminal.appendChild(div);
        bootProgressBar.style.width = `${((idx + 1) / BOOT_LINES.length) * 100}%`;

        if (idx === BOOT_LINES.length - 1) {
          enterPortalBtn.disabled = false;
          enterPortalBtn.textContent = 'ENTER ACCESS GATE >>';
        }
      }, 380 * (idx + 1));
    });
  }

  function closeIntroToAuth() {
    introOverlay.classList.add('fade-out');
    setTimeout(() => {
      introOverlay.classList.add('hidden');
      if (!currentUser) authGate.classList.remove('hidden');
    }, 500);
  }

  enterPortalBtn.addEventListener('click', closeIntroToAuth);
  document.getElementById('skipIntroBtn').addEventListener('click', closeIntroToAuth);
  document.getElementById('replayIntroBtn').addEventListener('click', () => {
    authGate.classList.add('hidden');
    runIntroSequence();
  });

  /* ============================================================================
     4. 5-TIER ROLE-BASED AUTHENTICATION LOGIC
     ============================================================================ */
  let selectedRole = 'student';
  let studentAuthMode = 'login';

  const roleTabs = document.querySelectorAll('.role-tab');
  const studentSubToggle = document.getElementById('studentSubToggle');
  const nameFieldWrap = document.getElementById('nameFieldWrap');
  const passwordFieldWrap = document.getElementById('passwordFieldWrap');
  const accessKeyWrap = document.getElementById('accessKeyWrap');
  const idLabel = document.getElementById('idLabel');
  const keyLabel = document.getElementById('keyLabel');
  const keyHint = document.getElementById('keyHint');
  const authError = document.getElementById('authError');

  function updateAuthFormUI() {
    authError.classList.add('hidden');
    const isStudent = selectedRole === 'student';

    studentSubToggle.classList.toggle('hidden', !isStudent);
    nameFieldWrap.classList.toggle('hidden', !(isStudent && studentAuthMode === 'register'));
    passwordFieldWrap.classList.toggle('hidden', !isStudent);
    accessKeyWrap.classList.toggle('hidden', isStudent);

    document.getElementById('authPassword').required = isStudent;
    document.getElementById('authAccessKey').required = !isStudent;

    const labels = {
      student: ['Student ID / Handle', '', ''],
      news: ['News Team Member ID', 'News Team Access Key', 'Default demo key: NEWS-CQ26'],
      research: ['Research Team Member ID', 'Research Team Access Key', 'Default demo key: RES-CQ26'],
      professor: ['Professor ID / Name', 'Professor Master Access Key', 'Default demo key: PROF-MASTER-2026'],
      admin: ['Admin ID / Name', 'Admin Master Access Key', 'Default demo key: ADMIN-MASTER-2026'],
    };

    idLabel.textContent = labels[selectedRole][0];
    keyLabel.textContent = labels[selectedRole][1];
    keyHint.textContent = labels[selectedRole][2];
  }

  roleTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      roleTabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      selectedRole = tab.dataset.role;
      updateAuthFormUI();
    });
  });

  document.querySelectorAll('.sub-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sub-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      studentAuthMode = btn.dataset.authMode;
      updateAuthFormUI();
    });
  });

  document.getElementById('authForm').addEventListener('submit', (e) => {
    e.preventDefault();
    authError.classList.add('hidden');

    const userId = document.getElementById('authUserId').value.trim();
    const password = document.getElementById('authPassword').value.trim();
    const accessKey = document.getElementById('authAccessKey').value.trim();
    const fullName = document.getElementById('authFullName').value.trim();

    if (selectedRole === 'student') {
      if (studentAuthMode === 'register') {
        if (!fullName || !userId || !password) {
          return showAuthError('Please complete all enrollment fields.');
        }
        if (db.users.some((u) => u.id.toLowerCase() === userId.toLowerCase())) {
          return showAuthError('That Student ID is already registered. Switch to Student Login.');
        }
        const newStudent = {
          id: userId,
          name: fullName,
          role: 'student',
          password,
          xp: 50,
          completedQuizzes: [],
          domainScores: {
            'Network Security': 40,
            'Web & AppSec': 40,
            'Threat Intelligence': 40,
            'Cryptography': 40,
            'Social Engineering': 40,
          },
        };
        db.users.push(newStudent);
        saveState();
        enterSession(newStudent);
      } else {
        const found = db.users.find(
          (u) => u.role === 'student' && u.id.toLowerCase() === userId.toLowerCase() && u.password === password
        );
        if (!found) {
          return showAuthError('Invalid Student ID or password. (Demo student: CQ-STU-101 / pass123)');
        }
        enterSession(found);
      }
      return;
    }

    // Team, Professor, and Admin Clearance Key Verification
    const expectedKey = db.accessKeys[selectedRole];
    if (accessKey !== expectedKey) {
      return showAuthError(`Access Denied: Invalid ${selectedRole.toUpperCase()} clearance key.`);
    }

    const staffUser = {
      id: userId || `${selectedRole.toUpperCase()}-OP`,
      name: userId || `${selectedRole.toUpperCase()} Operator`,
      role: selectedRole,
      xp: 9999,
      completedQuizzes: [],
      domainScores: {
        'Network Security': 95,
        'Web & AppSec': 95,
        'Threat Intelligence': 95,
        'Cryptography': 95,
        'Social Engineering': 95,
      },
    };
    enterSession(staffUser);
  });

  function showAuthError(msg) {
    authError.textContent = msg;
    authError.classList.remove('hidden');
  }

  /* ============================================================================
     5. SESSION & NAVIGATION CONTROLLER
     ============================================================================ */
  const appShell = document.getElementById('appShell');

  const VIEW_META = {
    dashboard: ['Command Hub', 'Live club telemetry, awareness broadcasts, and skill progression.'],
    lessons: ['Video Lessons & Classes', 'Recorded lectures, lab walkthroughs, and cyber awareness broadcasts.'],
    intel: ['News & Research Reports', 'Verified intelligence uploaded by the News Team and Research Team.'],
    quizzes: ['Assessments & Quizzes', 'Test your mastery on club reports and boost your ability radar.'],
    abilities: ['Student Abilities & Scores', 'Domain proficiency radar and club-wide operator rankings.'],
    meetings: ['Live Lectures & Meetings', 'Interactive sessions hosted by your Professor and Club Admin.'],
    'team-studio': ['Team Report Upload Studio', 'Publish News Bulletins or Research Advisories to the student feed.'],
    'admin-panel': ['Admin & Professor Console', 'Full club governance: lessons, quizzes, meetings, keys, and scores.'],
  };

  function enterSession(user) {
    currentUser = user;
    authGate.classList.add('hidden');
    appShell.classList.remove('hidden');

    document.getElementById('sidebarRoleTag').textContent = `${user.role.toUpperCase()} CLEARANCE`;
    document.getElementById('sidebarUserName').textContent = user.name;
    document.getElementById('sidebarUserId').textContent = `ID: ${user.id}`;

    const clearanceLevels = {
      student: 'TIER 1 // STUDENT',
      news: 'TIER 2 // NEWS TEAM',
      research: 'TIER 2 // RESEARCH TEAM',
      professor: 'TIER 4 // PROFESSOR FULL ACCESS',
      admin: 'TIER 5 // ADMIN FULL ACCESS',
    };
    document.getElementById('topClearance').textContent = clearanceLevels[user.role];

    // Enforce RBAC visibility on navigation items
    document.querySelectorAll('.role-restricted').forEach((el) => {
      const allowedRoles = el.dataset.roles.split(',');
      el.classList.toggle('hidden', !allowedRoles.includes(user.role));
    });

    // Configure Team Upload Studio lock based on role
    const repCategory = document.getElementById('repCategory');
    if (user.role === 'news') {
      repCategory.value = 'NEWS';
      repCategory.disabled = true;
    } else if (user.role === 'research') {
      repCategory.value = 'RESEARCH';
      repCategory.disabled = true;
    } else {
      repCategory.disabled = false;
    }

    switchView('dashboard');
    refreshAllUI();
  }

  function switchView(viewName) {
    document.querySelectorAll('.nav-item').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });
    document.querySelectorAll('.view-section').forEach((sec) => {
      sec.classList.toggle('active', sec.id === `view-${viewName}`);
    });
    const meta = VIEW_META[viewName] || VIEW_META.dashboard;
    document.getElementById('viewHeading').textContent = meta[0];
    document.getElementById('viewSubheading').textContent = meta[1];
  }

  document.querySelectorAll('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  document.querySelectorAll('[data-jump]').forEach((btn) => {
    btn.addEventListener('click', () => switchView(btn.dataset.jump));
  });

  document.getElementById('logoutBtn').addEventListener('click', () => {
    currentUser = null;
    appShell.classList.add('hidden');
    authGate.classList.remove('hidden');
    document.getElementById('authForm').reset();
  });

  document.querySelectorAll('.bg-mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => bgEngine.setMode(btn.dataset.bg));
  });

  /* ============================================================================
     6. RENDERING VIEWS (DASHBOARD, LESSONS, INTEL, QUIZZES, ABILITIES, ADMIN)
     ============================================================================ */
  let lessonFilter = 'ALL';
  let intelFilter = 'ALL';

  function refreshAllUI() {
    if (!currentUser) return;

    // Sync live student record if logged in as student
    if (currentUser.role === 'student') {
      const fresh = db.users.find((u) => u.id === currentUser.id);
      if (fresh) currentUser = fresh;
    }

    document.getElementById('topXp').textContent = `${currentUser.xp || 0} XP`;

    // Ticker
    const latestNews = db.reports[0];
    document.getElementById('tickerText').textContent = latestNews
      ? `[${latestNews.category}] ${latestNews.title} — Uploaded by ${latestNews.author}`
      : 'Welcome to CYBER//QUEST Private Cybersecurity Club.';

    renderDashboard();
    renderLessons();
    renderIntel();
    renderQuizzes();
    renderAbilitiesAndLeaderboard();
    renderMeetings();
    renderTeamStudioReports();
    renderAdminConsole();
  }

  function renderDashboard() {
    const completedCount = currentUser.completedQuizzes ? currentUser.completedQuizzes.length : 0;
    const scores = Object.values(currentUser.domainScores || {});
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    document.getElementById('kpiQuizzes').textContent = completedCount;
    document.getElementById('kpiAvgScore').textContent = `${avg}%`;
    document.getElementById('kpiReports').textContent = db.reports.length;
    document.getElementById('kpiMeetings').textContent = db.meetings.length;

    const dashIntel = document.getElementById('dashIntelList');
    dashIntel.innerHTML = db.reports
      .slice(0, 3)
      .map(
        (r) => `
      <div class="list-item">
        <div style="display:flex;justify-content:space-between;margin-bottom:0.35rem;">
          <span class="pill ${r.category === 'NEWS' ? 'pill-cyan' : 'pill-purple'}">${r.category}</span>
          <span class="mono muted" style="font-size:0.75rem;">${r.createdAt}</span>
        </div>
        <strong>${escapeHtml(r.title)}</strong>
        <p class="muted" style="margin-top:0.3rem;">${escapeHtml(r.summary)}</p>
      </div>`
      )
      .join('');

    const dashMeetings = document.getElementById('dashMeetingsList');
    dashMeetings.innerHTML = db.meetings
      .slice(0, 3)
      .map(
        (m) => `
      <div class="list-item">
        <div style="display:flex;justify-content:space-between;margin-bottom:0.35rem;">
          <span class="pill pill-green">LIVE SESSION</span>
          <span class="mono" style="font-size:0.75rem;color:var(--cyan);">${m.date.replace('T', ' ')}</span>
        </div>
        <strong>${escapeHtml(m.title)}</strong>
        <p class="muted" style="margin:0.3rem 0 0.6rem;">Host: ${escapeHtml(m.host)}</p>
        <a href="${escapeAttr(m.link)}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">JOIN ROOM</a>
      </div>`
      )
      .join('');
  }

  function toEmbedUrl(url) {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  }

  function renderLessons() {
    const grid = document.getElementById('lessonsGrid');
    const items = lessonFilter === 'ALL' ? db.lessons : db.lessons.filter((l) => l.type === lessonFilter);

    grid.innerHTML = items
      .map(
        (l) => `
      <article class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
          <span class="pill pill-cyan">${escapeHtml(l.type)}</span>
          <span class="mono muted" style="font-size:0.74rem;">${escapeHtml(l.domain)}</span>
        </div>
        <h3>${escapeHtml(l.title)}</h3>
        <div class="video-frame">
          <iframe src="${escapeAttr(toEmbedUrl(l.url))}" title="${escapeAttr(l.title)}" allowfullscreen></iframe>
        </div>
        <p class="muted">${escapeHtml(l.desc)}</p>
        <div class="mono" style="font-size:0.75rem;margin-top:0.65rem;color:var(--cyan);">Instructor: ${escapeHtml(l.instructor)}</div>
      </article>`
      )
      .join('');
  }

  document.querySelectorAll('[data-lesson-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-lesson-filter]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      lessonFilter = btn.dataset.lessonFilter;
      renderLessons();
    });
  });

  function renderIntel() {
    const grid = document.getElementById('intelGrid');
    const items = intelFilter === 'ALL' ? db.reports : db.reports.filter((r) => r.category === intelFilter);

    grid.innerHTML = items
      .map(
        (r) => `
      <article class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.6rem;">
          <div>
            <span class="pill ${r.category === 'NEWS' ? 'pill-cyan' : 'pill-purple'}">${r.category} REPORT</span>
            <span class="pill pill-green" style="margin-left:0.4rem;">${escapeHtml(r.domain)}</span>
          </div>
          <span class="mono muted" style="font-size:0.76rem;">By ${escapeHtml(r.author)} • ${r.createdAt}</span>
        </div>
        <h3>${escapeHtml(r.title)}</h3>
        <p style="margin:0.65rem 0;line-height:1.6;color:#d6e4ff;">${escapeHtml(r.content)}</p>
        <div style="display:flex;gap:0.75rem;align-items:center;margin-top:0.85rem;">
          ${r.refLink ? `<a href="${escapeAttr(r.refLink)}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm">OPEN REFERENCE</a>` : ''}
          <button type="button" class="btn btn-primary btn-sm" data-jump-quiz="true">ATTEMPT RELATED QUIZ &rarr;</button>
        </div>
      </article>`
      )
      .join('');

    grid.querySelectorAll('[data-jump-quiz]').forEach((btn) => {
      btn.addEventListener('click', () => switchView('quizzes'));
    });
  }

  document.querySelectorAll('[data-intel-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-intel-filter]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      intelFilter = btn.dataset.intelFilter;
      renderIntel();
    });
  });

  /* ============================================================================
     7. INTERACTIVE STUDENT QUIZ ENGINE
     ============================================================================ */
  function renderQuizzes() {
    const catalog = document.getElementById('quizCatalog');
    const activeBox = document.getElementById('activeQuizBox');
    catalog.classList.remove('hidden');
    activeBox.classList.add('hidden');

    catalog.innerHTML = db.quizzes
      .map((q) => {
        const done = currentUser.completedQuizzes && currentUser.completedQuizzes.includes(q.id);
        return `
        <div class="card">
          <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem;">
            <span class="pill pill-purple">${escapeHtml(q.domain)}</span>
            <span class="mono" style="color:var(--emerald);font-size:0.78rem;">+${q.xp} XP</span>
          </div>
          <h3>${escapeHtml(q.title)}</h3>
          <p class="muted" style="margin:0.5rem 0 1rem;">${q.questions.length} Question(s) • Verifies ${escapeHtml(q.domain)} ability</p>
          <button type="button" class="btn ${done ? 'btn-ghost' : 'btn-primary'} full-width" data-start-quiz="${q.id}">
            ${done ? 'RETAKE ASSESSMENT' : 'START QUIZ'}
          </button>
        </div>`;
      })
      .join('');

    catalog.querySelectorAll('[data-start-quiz]').forEach((btn) => {
      btn.addEventListener('click', () => startQuiz(btn.dataset.startQuiz));
    });
  }

  function startQuiz(quizId) {
    const quiz = db.quizzes.find((q) => q.id === quizId);
    if (!quiz) return;

    const catalog = document.getElementById('quizCatalog');
    const activeBox = document.getElementById('activeQuizBox');
    catalog.classList.add('hidden');
    activeBox.classList.remove('hidden');

    let qIndex = 0;
    let correctCount = 0;

    function renderQuestion() {
      const item = quiz.questions[qIndex];
      activeBox.innerHTML = `
        <div class="card-header">
          <div>
            <span class="pill pill-cyan">QUESTION ${qIndex + 1} OF ${quiz.questions.length}</span>
            <h3 style="margin-top:0.5rem;">${escapeHtml(item.q)}</h3>
          </div>
          <button type="button" id="abortQuizBtn" class="btn btn-ghost btn-sm">EXIT</button>
        </div>
        <div>
          ${item.options
            .map(
              (opt, i) =>
                `<button type="button" class="quiz-option" data-opt="${i}"><strong>${String.fromCharCode(65 + i)}.</strong> ${escapeHtml(opt)}</button>`
            )
            .join('')}
        </div>`;

      document.getElementById('abortQuizBtn').addEventListener('click', renderQuizzes);
      activeBox.querySelectorAll('.quiz-option').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (Number(btn.dataset.opt) === item.correct) correctCount++;
          qIndex++;
          if (qIndex < quiz.questions.length) {
            renderQuestion();
          } else {
            finishQuiz();
          }
        });
      });
    }

    function finishQuiz() {
      const pct = Math.round((correctCount / quiz.questions.length) * 100);
      if (currentUser.role === 'student') {
        const stu = db.users.find((u) => u.id === currentUser.id);
        if (stu) {
          if (!stu.completedQuizzes.includes(quiz.id)) {
            stu.completedQuizzes.push(quiz.id);
            stu.xp += quiz.xp;
          }
          const prev = stu.domainScores[quiz.domain] || 50;
          stu.domainScores[quiz.domain] = Math.min(100, Math.round((prev + pct) / 2));
          saveState();
        }
      }

      activeBox.innerHTML = `
        <h3>Assessment Complete: ${escapeHtml(quiz.title)}</h3>
        <p style="font-size:1.2rem;margin:0.75rem 0;">Score: <strong class="accent">${correctCount}/${quiz.questions.length} (${pct}%)</strong></p>
        <p class="muted" style="margin-bottom:1.25rem;">Your ${escapeHtml(quiz.domain)} ability telemetry and XP have been updated.</p>
        <button type="button" id="doneQuizBtn" class="btn btn-primary">RETURN TO QUIZZES</button>`;

      document.getElementById('doneQuizBtn').addEventListener('click', refreshAllUI);
    }

    renderQuestion();
  }

  /* ============================================================================
     8. STUDENT ABILITY RADAR & LEADERBOARD
     ============================================================================ */
  function renderAbilitiesAndLeaderboard() {
    const scores = currentUser.domainScores || {};
    const labels = Object.keys(scores);
    const values = Object.values(scores);

    // Draw Radar Chart
    const canvas = document.getElementById('abilityRadarCanvas');
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = 105;

    ctx.clearRect(0, 0, w, h);

    // Web rings
    for (let ring = 1; ring <= 4; ring++) {
      ctx.beginPath();
      labels.forEach((_, i) => {
        const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
        const r = (radius * ring) / 4;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.18)';
      ctx.stroke();
    }

    // Data polygon
    ctx.beginPath();
    values.forEach((val, i) => {
      const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
      const r = (radius * val) / 100;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 240, 255, 0.24)';
    ctx.fill();
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#e6f1ff';
    ctx.font = '11px JetBrains Mono, monospace';
    labels.forEach((lbl, i) => {
      const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
      const x = cx + Math.cos(angle) * (radius + 26);
      const y = cy + Math.sin(angle) * (radius + 18);
      ctx.textAlign = 'center';
      ctx.fillText(lbl.split(' ')[0], x, y);
    });

    // Bars
    document.getElementById('abilityBars').innerHTML = labels
      .map(
        (lbl) => `
      <div>
        <div class="ability-row-top">
          <span>${escapeHtml(lbl)}</span>
          <span class="mono accent">${scores[lbl]}%</span>
        </div>
        <div class="ability-track"><div class="ability-fill" style="width:${scores[lbl]}%"></div></div>
      </div>`
      )
      .join('');

    // Leaderboard
    const students = db.users
      .filter((u) => u.role === 'student')
      .sort((a, b) => (b.xp || 0) - (a.xp || 0));

    document.getElementById('leaderboardBody').innerHTML = students
      .map((s, idx) => {
        const sVals = Object.values(s.domainScores || {});
        const avg = sVals.length ? Math.round(sVals.reduce((a, b) => a + b, 0) / sVals.length) : 0;
        return `
        <tr>
          <td class="mono">#${idx + 1}</td>
          <td><strong>${escapeHtml(s.name)}</strong> <span class="muted mono">(${escapeHtml(s.id)})</span></td>
          <td>${s.completedQuizzes.length}</td>
          <td class="accent mono">${avg}%</td>
          <td class="mono">${s.xp} XP</td>
        </tr>`;
      })
      .join('');
  }

  /* ============================================================================
     9. MEETINGS, TEAM REPORT UPLOAD & ADMIN/PROFESSOR CONSOLE
     ============================================================================ */
  function renderMeetings() {
    document.getElementById('meetingsGrid').innerHTML = db.meetings
      .map(
        (m) => `
      <article class="card">
        <span class="pill pill-green">SCHEDULED SESSION</span>
        <h3 style="margin:0.6rem 0 0.35rem;">${escapeHtml(m.title)}</h3>
        <div class="mono accent" style="font-size:0.8rem;margin-bottom:0.5rem;">${m.date.replace('T', ' @ ')}</div>
        <p class="muted" style="margin-bottom:0.85rem;">${escapeHtml(m.agenda)}</p>
        <div class="mono muted" style="font-size:0.75rem;margin-bottom:0.85rem;">Host: ${escapeHtml(m.host)}</div>
        <a href="${escapeAttr(m.link)}" target="_blank" rel="noopener" class="btn btn-primary full-width">LAUNCH MEETING ROOM</a>
      </article>`
      )
      .join('');
  }

  document.getElementById('reportUploadForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const category = document.getElementById('repCategory').value;
    const domain = document.getElementById('repDomain').value;
    const title = document.getElementById('repTitle').value.trim();
    const summary = document.getElementById('repSummary').value.trim();
    const content = document.getElementById('repContent').value.trim();
    const refLink = document.getElementById('repRefLink').value.trim();

    db.reports.unshift({
      id: `rep-${Date.now()}`,
      category,
      domain,
      title,
      summary,
      content,
      author: `${currentUser.name} (${currentUser.role.toUpperCase()})`,
      role: currentUser.role,
      refLink,
      createdAt: new Date().toISOString().slice(0, 10),
    });
    saveState();
    e.target.reset();
    if (currentUser.role === 'news') document.getElementById('repCategory').value = 'NEWS';
    if (currentUser.role === 'research') document.getElementById('repCategory').value = 'RESEARCH';
    refreshAllUI();
    switchView('intel');
  });

  function renderTeamStudioReports() {
    const container = document.getElementById('teamManageReportsList');
    if (!container) return;

    container.innerHTML = db.reports
      .map(
        (r) => `
      <div class="list-item" style="display:flex;justify-content:space-between;align-items:center;gap:1rem;">
        <div>
          <span class="pill ${r.category === 'NEWS' ? 'pill-cyan' : 'pill-purple'}">${r.category}</span>
          <strong style="margin-left:0.5rem;">${escapeHtml(r.title)}</strong>
          <div class="muted" style="font-size:0.78rem;margin-top:0.25rem;">By ${escapeHtml(r.author)} • ${r.createdAt}</div>
        </div>
        ${
          currentUser.role === 'admin' || currentUser.role === 'professor' || r.role === currentUser.role
            ? `<button type="button" class="btn btn-danger btn-sm" data-del-rep="${r.id}">DELETE</button>`
            : ''
        }
      </div>`
      )
      .join('');

    container.querySelectorAll('[data-del-rep]').forEach((btn) => {
      btn.addEventListener('click', () => {
        db.reports = db.reports.filter((r) => r.id !== btn.dataset.delRep);
        saveState();
        refreshAllUI();
      });
    });
  }

  function renderAdminConsole() {
    if (currentUser.role !== 'admin' && currentUser.role !== 'professor') return;

    document.getElementById('cfgNewsKey').value = db.accessKeys.news;
    document.getElementById('cfgResearchKey').value = db.accessKeys.research;
    document.getElementById('cfgProfKey').value = db.accessKeys.professor;
    document.getElementById('cfgAdminKey').value = db.accessKeys.admin;

    const roster = document.getElementById('adminStudentRoster');
    const students = db.users.filter((u) => u.role === 'student');
    roster.innerHTML = students
      .map(
        (s) => `
      <div class="list-item" style="display:flex;justify-content:space-between;align-items:center;gap:0.75rem;">
        <div>
          <strong>${escapeHtml(s.name)}</strong> <span class="mono muted">(${escapeHtml(s.id)})</span>
          <div class="mono" style="font-size:0.75rem;color:var(--cyan);">XP: ${s.xp} • Quizzes: ${s.completedQuizzes.length}</div>
        </div>
        <button type="button" class="btn btn-danger btn-sm" data-del-stu="${escapeAttr(s.id)}">REMOVE</button>
      </div>`
      )
      .join('');

    roster.querySelectorAll('[data-del-stu]').forEach((btn) => {
      btn.addEventListener('click', () => {
        db.users = db.users.filter((u) => u.id !== btn.dataset.delStu);
        saveState();
        refreshAllUI();
      });
    });
  }

  document.getElementById('addLessonForm').addEventListener('submit', (e) => {
    e.preventDefault();
    db.lessons.unshift({
      id: `les-${Date.now()}`,
      title: document.getElementById('lesTitle').value.trim(),
      type: document.getElementById('lesType').value,
      domain: document.getElementById('lesDomain').value,
      instructor: document.getElementById('lesInstructor').value.trim(),
      url: document.getElementById('lesUrl').value.trim(),
      desc: document.getElementById('lesDesc').value.trim(),
    });
    saveState();
    e.target.reset();
    refreshAllUI();
    switchView('lessons');
  });

  document.getElementById('addMeetingForm').addEventListener('submit', (e) => {
    e.preventDefault();
    db.meetings.unshift({
      id: `mtg-${Date.now()}`,
      title: document.getElementById('mtgTitle').value.trim(),
      date: document.getElementById('mtgDate').value,
      host: document.getElementById('mtgHost').value.trim(),
      link: document.getElementById('mtgLink').value.trim(),
      agenda: document.getElementById('mtgAgenda').value.trim(),
    });
    saveState();
    e.target.reset();
    refreshAllUI();
    switchView('meetings');
  });

  document.getElementById('addQuizForm').addEventListener('submit', (e) => {
    e.preventDefault();
    db.quizzes.unshift({
      id: `qz-${Date.now()}`,
      title: document.getElementById('qzTitle').value.trim(),
      domain: document.getElementById('qzDomain').value,
      xp: Number(document.getElementById('qzXp').value) || 100,
      questions: [
        {
          q: document.getElementById('qzQuestion').value.trim(),
          options: [
            document.getElementById('qzOpt0').value.trim(),
            document.getElementById('qzOpt1').value.trim(),
            document.getElementById('qzOpt2').value.trim(),
            document.getElementById('qzOpt3').value.trim(),
          ],
          correct: Number(document.getElementById('qzCorrect').value),
        },
      ],
    });
    saveState();
    e.target.reset();
    refreshAllUI();
    switchView('quizzes');
  });

  document.getElementById('updateKeysForm').addEventListener('submit', (e) => {
    e.preventDefault();
    db.accessKeys.news = document.getElementById('cfgNewsKey').value.trim();
    db.accessKeys.research = document.getElementById('cfgResearchKey').value.trim();
    db.accessKeys.professor = document.getElementById('cfgProfKey').value.trim();
    db.accessKeys.admin = document.getElementById('cfgAdminKey').value.trim();
    saveState();
    alert('Club access keys updated successfully.');
  });

  /* ============================================================================
     10. XSS SANITIZATION HELPERS & BOOTSTRAP
     ============================================================================ */
  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/'/g, '&#39;');
  }

  bgEngine.setMode(bgEngine.getMode());
  updateAuthFormUI();
  runIntroSequence();
})();