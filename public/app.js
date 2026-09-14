let user=null,state=null,mode='login',today=new Date().toISOString().slice(0,10);
const $=id=>document.getElementById(id);
const viewMeta={dashboard:['Dashboard','Your command center for learning, practice and cyber defense.'],city:['Cyber City','Unlock districts, build mastery and progress through the cybersecurity journey.'],courses:['Courses','Structured cybersecurity domains from foundations to advanced concepts.'],sessions:['Cyber Sessions','Classroom-style sessions with visuals, real-world threats and defender checks.'],labs:['Cyber Labs','Practice security decisions through safe, interactive simulations.'],challenges:['Challenges','Complete missions and knowledge checks to earn XP and build consistency.'],achievements:['Achievements','Turn learning milestones into visible cybersecurity accomplishments.'],leaderboard:['Leaderboard','See how your cyber learning progress compares with the academy community.'],profile:['My Cyber Profile','Your identity, XP, streak, mastery and academy credentials.'],certificate:['Certificate','Your CYBER//QUEST academy credential and completion progress.'],settings:['Settings','Manage your learning environment and security preferences.'],intelligence:['Cyber Intelligence','Your adaptive skill profile, learning signals and next-best action.']};
function setView(view,scroll=true){view=view||'dashboard';document.querySelectorAll('.sideNav [data-view],.sideBottom [data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===view));document.querySelectorAll('[data-view-section]').forEach(el=>{const views=(el.dataset.viewSection||'').split(/\s+/);el.classList.toggle('viewHidden',!views.includes(view));});const meta=viewMeta[view]||viewMeta.dashboard;$('viewHeading').textContent=meta[0];$('viewSubheading').textContent=meta[1];document.body.dataset.view=view; if(scroll)window.scrollTo({top:0,behavior:'smooth'});}
const go=s=>{const id=(s||'').replace('#','');const map={missions:'challenges',simulations:'labs',learn:'courses',sessions:'sessions',leaderboard:'leaderboard',progress:'city',certificate:'certificate'};setView(map[id]||'dashboard');setTimeout(()=>document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'}),80)};

// CYBER//QUEST cinematic secure-boot intro
(function initCyberIntro(){
  const intro=$('cyberIntro'); if(!intro) return;
  const bar=$('introProgressBar'), status=$('introStatus'), hint=$('introHint'), log=$('introLog'), enter=$('introEnter'), clock=$('introClock');
  const lines=['Establishing encrypted channel...','Checking identity services...','Loading Cyber City modules...','Activating threat simulations...','Synchronizing learner progress...','SYSTEM READY ✓'];
  const started=Date.now(); let finished=false;
  function tick(){const d=new Date(); clock.textContent=d.toTimeString().slice(0,8); if(!finished) requestAnimationFrame(tick)} tick();
  function finish(){if(finished)return; finished=true; bar.style.width='100%'; status.textContent='SYSTEM SECURED ✓'; hint.textContent='WELCOME TO THE CYBER//QUEST LEARNING GRID'; enter.classList.add('ready'); intro.classList.add('complete'); setTimeout(()=>{intro.classList.add('gone');intro.setAttribute('aria-hidden','true');},850);}
  function run(){let i=0; const step=()=>{if(i>=lines.length){setTimeout(finish,450);return} status.textContent=lines[i].toUpperCase(); hint.textContent=['VERIFYING...','AUTH SERVICES ONLINE','BUILDING CYBER CITY','SIMULATIONS ONLINE','PROGRESS DATABASE ONLINE','ALL SYSTEMS NOMINAL'][i]; bar.style.width=((i+1)/lines.length*100)+'%'; const div=document.createElement('div');div.textContent='> '+lines[i];log.appendChild(div);i++;setTimeout(step,520)};step()}
  enter.onclick=finish; document.addEventListener('keydown',e=>{if(e.key==='Enter'&&!finished)finish()});
  setTimeout(run,350);
})();
async function api(u,o={}){let r=await fetch(u,{headers:{'Content-Type':'application/json'},...o}),d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||'Request failed');return d}
async function boot(){try{let d=await api('/api/me');user=d.user;state=d.progress;show()}catch(e){$('auth').classList.remove('hide')}}
function show(){$('auth').classList.add('hide');$('app').classList.remove('hide');setView('dashboard',false);$('welcome').textContent=user.name.split(' ')[0];$('pname').textContent=user.name;$('pemail').textContent=user.email;$('avatar').textContent=user.name[0].toUpperCase();render();term()}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');mode=b.dataset.mode;$('nameRow').classList.toggle('hide',mode==='login');$('authSubmit').textContent=mode==='login'?'ENTER CYBER//QUEST →':'CREATE CYBER ID →'});
$('authForm').onsubmit=async e=>{e.preventDefault();try{let body={email:$('email').value,password:$('password').value};if(mode==='register')body.name=$('name').value;let d=await api(mode==='login'?'/api/login':'/api/register',{method:'POST',body:JSON.stringify(body)});user=d.user;state=d.progress;show()}catch(e){alert(e.message)}};
$('demoBtn').onclick=()=>{$('email').value='student@cyberquest.demo';$('password').value='CyberQuest123';$('authForm').requestSubmit()};
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
$('profileQuick').onclick=()=>setView('profile');
$('globalSearch').oninput=e=>{const q=e.target.value.trim().toLowerCase();if(!q)return;setView('courses',false);$('search').value=q;renderZones();};

$('logout').onclick=async()=>{await api('/api/logout',{method:'POST'});location.reload()};$('theme').onclick=()=>document.body.classList.toggle('light');

const lessons=[['Computer & Network Fundamentals','foundation','⌁','Understand networks, devices and communication.',['IP/DNS','TCP/IP','Routers & switches','Firewalls']],['Cybersecurity Foundations','foundation','◈','Build the core security mindset.',['CIA triad','Threats','Vulnerabilities','Risk']],['Social Engineering & Phishing','defense','✉','Recognize manipulation and suspicious messages.',['Phishing','Pretexting','Baiting','Reporting']],['Identity & Access Control','defense','🔐','Learn authentication and authorization.',['MFA','RBAC','Least privilege','Accounts']],['Malware & Ransomware','defense','☣','Explore malware types and defenses.',['Virus','Trojan','Ransomware','Recovery']],['Cryptography','advanced','⌬','Understand encryption, hashing and signatures.',['Symmetric','Public key','Hashing','Signatures']],['Network Defense & SOC','defense','◉','Learn monitoring and incident triage.',['Logs','SIEM','IDS/IPS','Triage']],['Operating System Security','defense','▣','Secure endpoints through updates and controls.',['Patching','Permissions','Processes','Endpoint']],['Web & Application Security','advanced','</>','Learn secure development concepts.',['Input validation','Sessions','Access control','OWASP']],['Cloud Security','advanced','☁','Understand cloud identity and shared responsibility.',['IAM','Storage','Monitoring','Responsibility']],['Digital Forensics & IR','advanced','⌕','Investigate incidents and preserve evidence.',['Evidence','Timelines','Containment','Recovery']],['Ethical Hacking Concepts','advanced','⚔','Learn authorized security testing responsibly.',['Assessment','Validation','Disclosure','Authorization']]];
const sessions=[
{title:'Computer & Network Fundamentals',level:'FOUNDATION',icon:'⌁',definition:'Computer networks allow devices to exchange data and services using agreed communication rules. Cybersecurity starts with understanding how traffic moves between users, devices, routers, servers and the internet.',slides:[['THE BIG PICTURE','A network connects endpoints such as laptops and phones to services such as web servers. IP addresses identify devices logically, DNS helps resolve names, and protocols such as TCP/IP define how data is transported.'],['CORE DEFINITIONS','IP address: a logical network address. DNS: translates names into addresses. Router: forwards traffic between networks. Switch: connects devices within a local network. Firewall: applies rules to traffic.'],['HOW A THREAT TRAVELS','An attacker may enter through a compromised device, exposed service, stolen credentials or unsafe network. Once inside, poor segmentation can let the attacker move toward more valuable systems.'],['REAL-LIFE THREAT','Large botnets have repeatedly abused insecure internet-connected devices to launch distributed denial-of-service attacks. The lesson: every exposed device can become part of a larger attack surface.'],['DEFENDER CHECK','Use secure Wi-Fi, patch routers and endpoints, segment sensitive systems, disable unnecessary services, and monitor unusual traffic.'] ],takeaway:'Know the path of data before trying to secure it.'},
{title:'Cybersecurity Foundations',level:'FOUNDATION',icon:'◈',definition:'Cybersecurity protects systems, information and people from unauthorized access, misuse, disruption, alteration and destruction. The CIA triad is a simple framework for thinking about security goals.',slides:[['THE CIA TRIAD','Confidentiality keeps information from unauthorized people. Integrity protects data from unauthorized change. Availability keeps systems and information accessible when needed.'],['KEY DEFINITIONS','Threat: something that can cause harm. Vulnerability: a weakness. Risk: the likelihood and impact of a threat exploiting a weakness. Control: a safeguard that reduces risk.'],['RISK THINKING','Security is not only about blocking attacks. Teams identify valuable assets, assess likely threats, choose controls, test them and improve when conditions change.'],['REAL-LIFE THREAT','Ransomware incidents show all three CIA goals can be affected: files may become unavailable, data may be stolen, and attackers may alter systems.'],['DEFENDER CHECK','Start with assets and impact. Prioritize strong authentication, backups, patching, access control, monitoring and an incident-response plan.']],takeaway:'Think in terms of assets, threats, vulnerabilities, impact and controls.'},
{title:'Social Engineering & Phishing',level:'DEFENSE',icon:'✉',definition:'Social engineering manipulates people into revealing information, approving actions or bypassing security. Phishing is a common form that uses messages, websites or other communication to create a deceptive request.',slides:[['WHAT IS PHISHING?','Phishing messages often imitate trusted organizations and create urgency, fear, curiosity or authority. The goal may be to steal credentials, money or access.'],['WARNING SIGNS','Unexpected urgency, mismatched domains, unusual payment requests, suspicious attachments, requests for passwords or MFA codes, and links that do not match the claimed organization are common warning signs.'],['ATTACK FLOW','A message creates pressure → the victim clicks or responds → the attacker collects information or delivers a malicious action → the attacker attempts account or financial abuse.'],['REAL-LIFE THREAT','Business email compromise has caused organizations to send large payments to fraudulent accounts after attackers impersonated executives or suppliers.'],['DEFENDER CHECK','Pause. Verify using an independent official channel. Never share passwords or one-time codes. Report suspicious messages and preserve them for investigation.']],takeaway:'The safest response to pressure is to slow down and verify.'},
{title:'Identity & Access Control',level:'DEFENSE',icon:'🔐',definition:'Identity and access control determines who or what is requesting access and what that identity is allowed to do. Authentication proves identity; authorization determines permissions.',slides:[['AUTHENTICATION VS AUTHORIZATION','Authentication answers “Who are you?” Authorization answers “What are you allowed to do?” Accounting or logging records important access activity.'],['CORE DEFINITIONS','MFA uses multiple verification factors. RBAC assigns permissions through roles. Least privilege gives only necessary access. Session management controls how authenticated sessions are created and ended.'],['ATTACK FLOW','Credential theft → login attempt → MFA bypass or abuse → unauthorized access → privilege escalation or data theft. Strong controls break this chain.'],['REAL-LIFE THREAT','Credential-stuffing attacks reuse passwords leaked from other services. When people reuse passwords, one breach can become an entry point to other accounts.'],['DEFENDER CHECK','Use unique passwords, a password manager, phishing-resistant MFA where available, least privilege, timely access removal and login monitoring.']],takeaway:'Strong identity controls reduce the damage caused by stolen credentials.'},
{title:'Malware & Ransomware',level:'DEFENSE',icon:'☣',definition:'Malware is software designed to perform unwanted or harmful actions. Ransomware is malware that can encrypt or otherwise disrupt data and may threaten to expose stolen information.',slides:[['MALWARE TYPES','Viruses attach to files, worms spread between systems, trojans disguise malicious behavior, spyware collects information, and ransomware disrupts access or extorts victims.'],['HOW INFECTIONS START','Common paths include malicious attachments, compromised websites, vulnerable services, unsafe downloads, stolen credentials and infected removable media.'],['ATTACK FLOW','Initial access → execution → persistence → privilege escalation → data access or disruption → extortion. Defenders aim to detect and stop the chain early.'],['REAL-LIFE THREAT','WannaCry demonstrated how rapidly ransomware can spread when vulnerable systems are left unpatched, affecting organizations around the world.'],['DEFENDER CHECK','Patch quickly, restrict execution, use endpoint protection, segment networks, maintain tested offline or isolated backups, and rehearse recovery.']],takeaway:'Backups matter, but prevention and rapid containment matter too.'},
{title:'Cryptography',level:'ADVANCED',icon:'⌬',definition:'Cryptography uses mathematical techniques to protect information and establish trust. Encryption mainly protects confidentiality, hashing supports integrity, and digital signatures help prove integrity and origin.',slides:[['THREE CORE TOOLS','Encryption transforms readable data into protected ciphertext using a key. Hashing produces a fixed-length digest for integrity checks. Digital signatures use asymmetric cryptography to support authenticity and integrity.'],['SYMMETRIC VS PUBLIC-KEY','Symmetric encryption uses the same secret key to encrypt and decrypt. Public-key cryptography uses a public/private key pair and supports tasks such as key exchange and signatures.'],['WHERE IT APPEARS','HTTPS, secure messaging, disk encryption, password storage systems and signed software updates all rely on cryptographic techniques in different ways.'],['REAL-LIFE THREAT','Weak or incorrectly implemented cryptography can expose sensitive information even when an application appears “encrypted.” Security depends on correct algorithms, key management and implementation.'],['DEFENDER CHECK','Use modern, well-reviewed cryptography, protect keys, avoid inventing algorithms, use secure protocols and store passwords with appropriate password-hashing methods.']],takeaway:'Encryption, hashing and signatures solve different security problems.'},
{title:'Network Defense & SOC',level:'DEFENSE',icon:'◉',definition:'Network defense combines controls and monitoring to detect suspicious activity and protect communications. A Security Operations Center (SOC) investigates alerts and coordinates response.',slides:[['DEFENSE LAYERS','Firewalls filter traffic. IDS/IPS can detect or prevent suspicious activity. Network segmentation limits movement. Secure configurations reduce exposed services.'],['SOC DEFINITIONS','A log records an event. SIEM systems centralize and correlate security data. An alert signals something worth investigating. Triage determines priority and likely impact.'],['INCIDENT FLOW','Detect → validate and triage → contain → eradicate or remediate → recover → learn. Good responders preserve useful evidence while reducing harm.'],['REAL-LIFE THREAT','Attackers often combine multiple failed logins, unusual locations and suspicious processes. Individually these events may look small; together they can reveal an account compromise.'],['DEFENDER CHECK','Centralize logs, synchronize time, define alert priorities, monitor privileged activity and document an incident-response process.']],takeaway:'Good defense turns noisy events into a clear, prioritized story.'},
{title:'Operating System Security',level:'DEFENSE',icon:'▣',definition:'Operating system security protects the software layer that manages hardware, files, processes, users and permissions. Secure configuration and timely updates reduce attack opportunities.',slides:[['WHAT THE OS CONTROLS','The operating system manages accounts, processes, memory, storage, networking and device access. A compromise at this layer can affect many applications.'],['CORE CONTROLS','Patching fixes known weaknesses. Permissions limit access. Secure boot helps protect startup integrity. Endpoint protection monitors suspicious behavior.'],['ATTACK FLOW','Exploit a vulnerable component → gain execution → escalate privileges → establish persistence → access or alter data.'],['REAL-LIFE THREAT','Unpatched operating systems have repeatedly been exploited by worms and ransomware. The recurring lesson is simple: known vulnerabilities become dangerous when updates are delayed.'],['DEFENDER CHECK','Enable automatic updates where appropriate, remove unnecessary software, use standard accounts for daily work, protect administrator access and monitor endpoints.']],takeaway:'A secure operating system is maintained, minimized and monitored.'},
{title:'Web & Application Security',level:'ADVANCED',icon:'</>',definition:'Application security protects software from design-time and runtime weaknesses. Secure development validates inputs, protects sessions, enforces authorization and handles data safely.',slides:[['COMMON WEAKNESSES','Broken access control, injection, insecure authentication, security misconfiguration and unsafe handling of sensitive data are recurring application risks.'],['CORE DEFINITIONS','Input validation checks data before use. Access control decides what a user may do. Session management protects authenticated state. Secure defaults reduce accidental exposure.'],['ATTACK FLOW','Craft malicious input or request → application processes it incorrectly → attacker reads, changes or triggers something unintended → data or account impact.'],['REAL-LIFE THREAT','The Log4Shell vulnerability showed how a flaw in a widely used software component could affect many applications and organizations downstream.'],['DEFENDER CHECK','Use secure coding practices, dependency scanning, code review, strong authorization checks, safe error handling and regular security testing.']],takeaway:'Security must be designed into the application, not added at the end.'},
{title:'Cloud Security',level:'ADVANCED',icon:'☁',definition:'Cloud security protects identities, workloads, data, networks and configurations in cloud environments. Responsibility is shared between the cloud provider and the customer.',slides:[['SHARED RESPONSIBILITY','Providers secure the underlying cloud infrastructure. Customers remain responsible for areas such as identities, configurations, data and workloads according to the service model.'],['CORE CONTROLS','IAM limits access. Encryption protects data. Logging provides visibility. Security groups and network policies control connectivity. Configuration management reduces accidental exposure.'],['ATTACK FLOW','Misconfigured storage or identity → unauthorized discovery or access → data exposure or resource abuse.'],['REAL-LIFE THREAT','Publicly exposed cloud storage has repeatedly led to accidental data disclosure. A secure cloud deployment depends heavily on correct permissions and configuration.'],['DEFENDER CHECK','Use least privilege, deny-by-default policies, secrets management, continuous configuration checks, logging and strong separation of environments.']],takeaway:'Cloud security is often a configuration and identity problem as much as a technology problem.'},
{title:'Digital Forensics & Incident Response',level:'ADVANCED',icon:'⌕',definition:'Digital forensics examines digital evidence to understand what happened. Incident response is the organized process of detecting, containing, investigating, recovering from and learning from security incidents.',slides:[['FORENSICS BASICS','Evidence can include logs, files, memory captures, network records and timestamps. Investigators preserve evidence and document actions so findings can be trusted.'],['CORE DEFINITIONS','Chain of custody records evidence handling. Timeline analysis reconstructs events. Containment limits damage. Recovery restores safe operations. Lessons learned improve defenses.'],['INVESTIGATION FLOW','Identify scope → preserve evidence → build timeline → contain → remove cause → recover → document findings.'],['REAL-LIFE THREAT','After major breaches, investigators often reconstruct attacker activity from authentication logs, endpoint telemetry and network records to determine initial access and impact.'],['DEFENDER CHECK','Centralize logs, retain useful evidence, synchronize system time, document response decisions and practice incident-response playbooks.']],takeaway:'Good incident response is disciplined, evidence-driven and documented.'},
{title:'Ethical Hacking Concepts',level:'ADVANCED',icon:'⚔',definition:'Ethical hacking is authorized security testing performed to find weaknesses before criminals exploit them. The defining requirement is explicit permission and a clearly defined scope.',slides:[['WHAT ETHICAL HACKING MEANS','A tester works within an agreed scope, documents findings and avoids unnecessary impact. The goal is to improve security, not to gain unauthorized access.'],['CORE DEFINITIONS','Scope defines what may be tested. Vulnerability is a weakness. Exploitability describes how a weakness could be used. Responsible disclosure communicates findings to the authorized owner.'],['SAFE TESTING FLOW','Plan and authorize → discover → validate carefully → document evidence → report → remediate → retest.'],['REAL-LIFE THREAT','Bug-bounty programs have helped organizations discover real vulnerabilities through authorized researchers before those weaknesses were abused more widely.'],['DEFENDER CHECK','Get written authorization, define targets and limits, protect sensitive findings, avoid destructive actions and report responsibly.']],takeaway:'Authorization is the line between ethical security testing and unauthorized intrusion.'}
];
const facts=[['THE CIA TRIAD','Confidentiality, Integrity and Availability are foundational goals of information security.'],['MFA','Multi-factor authentication uses different verification factors, making stolen passwords less useful.'],['HASHING','Hashing creates a fixed-length representation of data and is not the same as encryption.'],['LEAST PRIVILEGE','Give users and systems only the access required for their tasks.'],['PHISHING','Phishing commonly uses urgency, fear or authority to pressure people into unsafe actions.'],['DNS','DNS helps translate domain names into network addresses.']];
const quizzes=[['Which principle means giving only the access required for a task?',['Least privilege','Open access','Port forwarding','Public access'],0],['What should you do with a suspicious login alert?',['Ignore it','Verify it and follow the security process','Share your password','Delete logs'],1],['What does MFA add to a login?',['More bandwidth','Additional verification factors','A public IP','A backup server'],1]];
const missions=[['PHISHING','THE URGENT EMAIL','A message says your account will be locked in 10 minutes and asks you to sign in through a link.','What is the safest next move?',['Click before the deadline.','Open it on your phone.','Verify through an official channel and report the message.','Reply asking for the sender password.'],2],['ACCOUNT SECURITY','THE LOGIN ALERT','A login notification shows a device and location you do not recognize.','What should you do first?',['Ignore it.','Verify the alert, secure the account and report if unauthorized.','Post it publicly.','Send your password to support.'],1]];
let m=missions[new Date().getDate()%missions.length],q=quizzes[new Date().getDate()%quizzes.length],f=facts[new Date().getDate()%facts.length];
function render(){renderIntelligence();let r=['CYBER ROOKIE','SECURITY CADET','THREAT HUNTER','CYBER DEFENDER','SECURITY SPECIALIST','CYBER GUARDIAN'][Math.min(Math.floor(state.xp/200),5)];$('xp').textContent=state.xp;$('xpTop').textContent=state.xp;$('streak').textContent=state.streak;$('rank').textContent=r;$('today').textContent=new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});$('mtype').textContent=m[0];$('mtitle').textContent=m[1];$('mdesc').textContent=m[2];$('factTitle').textContent=f[0];$('fact').textContent=f[1];$('quizQ').textContent=q[0];$('quizChoices').innerHTML=q[1].map((x,i)=>`<button class="choice" onclick="answerQuiz(${i},this)">${x}</button>`).join('');renderProgression();renderZones();renderSessions();renderBoard();renderBadges();renderCertificate()}
$('startM').onclick=()=>{$('mchallenge').style.display='block';$('mq').textContent=m[3];$('mc').innerHTML=m[4].map((x,i)=>`<button class="choice" onclick="answerM(${i},this)">${x}</button>`).join('');$('mchallenge').scrollIntoView({behavior:'smooth',block:'center'})};
async function answerM(i,b){document.querySelectorAll('#mc .choice').forEach(x=>x.disabled=true);if(i===m[5]){b.classList.add('correct');$('mf').innerHTML='<div class="feedback">✓ Mission complete • +50 XP</div>';await gain(50,'mission-'+today)}else{b.classList.add('wrong');$('mf').innerHTML='<div class="feedback">✕ Not the safest move. Look for verification before acting.</div>'}}
async function answerQuiz(i,b){document.querySelectorAll('#quizChoices .choice').forEach(x=>x.disabled=true);if(i===q[2]){b.classList.add('correct');$('quizF').innerHTML='<div class="feedback">✓ Correct • +20 XP</div>';await gain(20,'quiz-'+today)}else{b.classList.add('wrong');$('quizF').innerHTML='<div class="feedback">✕ Review the concept.</div>'}}
async function gain(x,key){let d=await api('/api/progress',{method:'POST',body:JSON.stringify({xp:x,key})});state=d.progress;render()}
function zoneCompleted(i){return state.completed.includes('lesson-'+i)}
function zoneUnlocked(i){return i===0||zoneCompleted(i-1)}
async function renderIntelligence(){const el=$('intelligencePanel');if(!el)return;try{const d=await api('/api/intelligence');const bars=d.skills.map(s=>`<div class="skillRow"><div class="skillHead"><span>${s.name}</span><b>${s.score}%</b></div><div class="skillBar"><span style="width:${s.score}%"></span></div></div>`).join('');el.innerHTML=`<div class="intelHero"><div><span class="kicker">OVERALL CYBER READINESS</span><strong>${d.overall}%</strong><p>Your profile is calculated from completed learning zones, Cyber Sessions and advanced labs.</p></div><div class="intelRecommendation"><span>🧠 NEXT BEST ACTION</span><b>${d.recommendation}</b><small>Weakest signal: ${d.weakest.name} • Strongest signal: ${d.strongest.name}</small></div></div><div class="intelGrid"><article class="intelCard"><span class="kicker">SKILL PROFILE</span><h3>CYBER SKILL SIGNALS</h3>${bars}</article><article class="intelCard"><span class="kicker">LEARNING SIGNALS</span><h3>YOUR ACTIVITY</h3><div class="signalGrid"><div><b>${d.signals.lessons}</b><small>Zones</small></div><div><b>${d.signals.sessions}</b><small>Sessions</small></div><div><b>${d.signals.labs}</b><small>Advanced Labs</small></div></div><div class="intelCallout"><b>Adaptive engine</b><p>Complete more activities to make your recommendations more precise.</p></div></article></div>`}catch(e){el.innerHTML='<div class="intelLoading">INTELLIGENCE ENGINE TEMPORARILY UNAVAILABLE</div>'}}

function renderProgression(){let done=lessons.filter((_,i)=>zoneCompleted(i)).length,pct=Math.round(done/lessons.length*100);$('masteryText').textContent=`${done}/12 ZONES`;$('masteryPct').textContent=pct+'%';$('masteryBar').style.width=pct+'%';let next=lessons.findIndex((_,i)=>!zoneCompleted(i));$('nextZone').textContent=next<0?'MASTERED':`ZONE ${String(next+1).padStart(2,'0')}`;$('certStatus').textContent=done===12?'READY':'LOCKED';let groups=[['FOUNDATION DISTRICT','Zones 01–02','foundation','2'],['DEFENSE DISTRICT','Zones 03–08','defense','6'],['ADVANCED DISTRICT','Zones 09–12','advanced','4']];$('districts').innerHTML=groups.map(g=>{let count=lessons.filter(x=>x[1]===g[2]).length,completed=lessons.filter((x,i)=>x[1]===g[2]&&zoneCompleted(i)).length;return `<div class="district"><div><span class="districtIcon">${g[2]==='foundation'?'⌁':g[2]==='defense'?'◉':'⌬'}</span><div><small>${g[1]}</small><b>${g[0]}</b></div></div><span>${completed}/${count}</span></div>`}).join('')}
function renderZones(){let s=($('search').value||'').toLowerCase();$('zones').innerHTML=lessons.map((x,i)=>[x,i]).filter(([x])=>(x[0]+' '+x[3]+' '+x[4]).toLowerCase().includes(s)).map(([x,i])=>{let done=zoneCompleted(i),open=zoneUnlocked(i);return `<article class="zone ${done?'zoneDone':''} ${!open?'zoneLocked':''}" onclick="lesson(${i})"><div class="zoneTop"><small>ZONE ${String(i+1).padStart(2,'0')} • ${x[1].toUpperCase()}</small><span>${done?'✓ COMPLETE':open?'UNLOCKED':'🔒 LOCKED'}</span></div><h3>${x[2]} ${x[0]}</h3><p>${x[3]}</p>${x[4].map(t=>`<span class="tag">${t}</span>`).join('')}</article>`}).join('')}
$('search').oninput=renderZones;
function renderSessions(){let el=$('sessionCards');if(!el)return;el.innerHTML=sessions.map((x,i)=>{let done=state.completed.includes('session-'+i);return `<article class="sessionCard ${done?'sessionDone':''}" onclick="openSession(${i})"><div class="sessionTop"><span class="sessionIcon">${x.icon}</span><small>SESSION ${String(i+1).padStart(2,'0')} • ${x.level}</small><span>${done?'✓ COMPLETE':'READ & EXPLORE →'}</span></div><h3>${x.title}</h3><p>${x.definition}</p><div class="sessionMeta"><b>${x.slides.length} SLIDES</b><b>REAL-LIFE THREAT</b><b>DEFENDER CHECK</b></div></article>`}).join('')}
function sessionVisual(i,slide){
 const visuals=[
  ['NETWORK MAP','🖥️','ENDPOINT','ROUTER','SERVER','Data packet','network'],
  ['CIA TRIAD','🛡️','CONFIDENTIALITY','INTEGRITY','AVAILABILITY','Security goal','triad'],
  ['PHISHING FLOW','🎣','FAKE MESSAGE','VICTIM','FAKE LOGIN','Credential bait','phish'],
  ['ACCESS GATE','🔐','IDENTITY','MFA','AUTHORIZED','Access token','auth'],
  ['MALWARE CHAIN','☣️','EMAIL','MALWARE','FILES','Payload','malware'],
  ['CRYPTO LAB','🔒','PLAINTEXT','ENCRYPT','CIPHERTEXT','Secret data','crypto'],
  ['SOC PIPELINE','📡','EVENT','SIEM','ANALYST','Alert','soc'],
  ['ENDPOINT SHIELD','💻','PROCESS','PERMISSION','KERNEL','Protected action','os'],
  ['WEB ATTACK PATH','🌐','BROWSER','WEB APP','DATABASE','Request','web'],
  ['CLOUD CONTROL','☁️','USER','IAM','CLOUD','API request','cloud'],
  ['FORENSICS TRAIL','🔎','ALERT','EVIDENCE','TIMELINE','Evidence item','forensics'],
  ['ETHICAL HACK FLOW','⚔️','RECON','TEST','FIX','Finding','hack']
 ][i]||['CYBER FLOW','◈','SOURCE','CONTROL','TARGET','Packet','default'];
 const [title,icon,a,b,c,item,kind]=visuals;
 const labels=[[a,b,c],[a,item,b],[b,item,c],[a,b,'✓ SAFE'],[a,b,c]][slide%5];
 return `<div class="sessionVisual visual-${kind}">
   <div class="visualHead"><span>${icon}</span><div><b>${title}</b><small>LIVE CONCEPT MAP</small></div><em>● ANIMATED</em></div>
   <div class="visualCanvas">
    <div class="visualNode nodeA"><span>${labels[0]}</span></div>
    <div class="visualLine line1"></div>
    <div class="visualNode nodeB"><span>${labels[1]}</span></div>
    <div class="visualLine line2"></div>
    <div class="visualNode nodeC"><span>${labels[2]}</span></div>
    <div class="travelDot dot1"></div><div class="travelDot dot2"></div>
    <div class="visualPulse"></div>
   </div>
   <div class="visualCaption"><b>${item}</b><span>${slide===3?'REAL-WORLD THREAT':slide===4?'DEFENDER VIEW':'SEE THE CONCEPT IN ACTION'}</span></div>
 </div>`;
}
function openSession(i){let x=sessions[i],slide=0;function draw(){let sl=x.slides[slide];$('modalBody').innerHTML=`<div class="sessionModal"><div class="sessionModalHead"><span class="kicker">CYBER//QUEST SESSION ${String(i+1).padStart(2,'0')} // ${x.level}</span><span class="slideCount">SLIDE ${slide+1}/${x.slides.length}</span></div><h2>${x.icon} ${x.title}</h2><div class="slideProgress"><span style="width:${((slide+1)/x.slides.length)*100}%"></span></div><div class="sessionVisualWrap">${sessionVisual(i,slide)}<div class="sessionSlide"><span class="slideLabel">${sl[0]}</span><p>${sl[1]}</p></div></div><div class="sessionNav"><button class="choice" id="prevSlide" ${slide===0?'disabled':''}>← PREVIOUS</button><button class="btn primary" id="nextSlide">${slide===x.slides.length-1?'FINISH SESSION':'NEXT SLIDE →'}</button></div>${slide===x.slides.length-1?`<div class="sessionTakeaway"><b>DEFENDER TAKEAWAY</b><p>${x.takeaway}</p></div>${state.completed.includes('session-'+i)?'<div class="feedback">✓ Session completed. Your progress is saved.</div>':'<button class="btn primary full" id="completeSession">MARK SESSION COMPLETE +40 XP</button>'}`:''}</div>`;$('modal').style.display='grid';$('prevSlide').onclick=()=>{slide--;draw()};$('nextSlide').onclick=()=>{if(slide<x.slides.length-1){slide++;draw()}else if(!state.completed.includes('session-'+i)){completeSession(i)}};let cs=$('completeSession');if(cs)cs.onclick=()=>completeSession(i)}draw()}
async function completeSession(i){if(state.completed.includes('session-'+i))return;await gain(40,'session-'+i);openSession(i)}
function lesson(i){let x=lessons[i];if(!zoneUnlocked(i)){let prev=lessons[i-1];$('modalBody').innerHTML=`<span class="kicker">ACCESS CONTROL // LOCKED ZONE</span><h2>ZONE ${String(i+1).padStart(2,'0')} LOCKED</h2><p>Complete <b>${prev[0]}</b> first. CYBER//QUEST unlocks the next zone after each completed learning mission.</p><div class="lockCard">🔒 <b>PROGRESSION REQUIRED</b><span>Complete Zone ${String(i).padStart(2,'0')} to unlock this zone.</span></div>`;$('modal').style.display='grid';return}$('modalBody').innerHTML=`<span class="kicker">${x[1].toUpperCase()} // LEARNING ZONE ${String(i+1).padStart(2,'0')}</span><h2>${x[0]}</h2><p>${x[3]}</p><h3>CORE CONCEPTS</h3><ul>${x[4].map(t=>`<li>${t}</li>`).join('')}</ul><div class="think"><b>DEFENDER'S QUESTION</b><p>How could misunderstanding this concept create security risk?</p></div>${zoneCompleted(i)?'<div class="feedback">✓ Zone already completed. Your mastery progress is saved.</div>':`<button class="btn primary" onclick="completeLesson(${i})">COMPLETE LESSON +30 XP</button>`}`;$('modal').style.display='grid'}
async function completeLesson(i){if(zoneCompleted(i))return;await gain(30,'lesson-'+i);closeModal()}
function closeModal(){$('modal').style.display='none'}
function resultCard(title,desc,points,key,correct){$('modalBody').insertAdjacentHTML('beforeend',`<div class="simResult ${correct?'success':'failure'}"><b>${correct?'✓':'✕'} ${title}</b><p>${desc}</p>${correct?`<span>+${points} XP</span>`:''}</div>`);if(correct)gain(points,key)}
function sim(t){let c=$('modalBody');
if(t==='phish')c.innerHTML=`<span class="kicker">SIM 01 // PHISHING INVESTIGATION</span><h2>SPOT THE PHISH</h2><p class="simIntro">You are the first-line defender. Inspect the message, identify the warning signs, then make the call.</p><div class="emailMock"><div class="emailTop"><span>INBOX // NEW MESSAGE</span><span class="risk">RISK: HIGH</span></div><b>From: it-support@university-help.co</b><h3>URGENT — account suspension</h3><p>Your account will be disabled today. Click the link and sign in immediately.</p><div class="clueRow"><button class="clue" onclick="this.classList.toggle('found');document.getElementById('phishClues').textContent=document.querySelectorAll('.clue.found').length+'/3 clues found'">DOMAIN</button><button class="clue" onclick="this.classList.toggle('found');document.getElementById('phishClues').textContent=document.querySelectorAll('.clue.found').length+'/3 clues found'">URGENCY</button><button class="clue" onclick="this.classList.toggle('found');document.getElementById('phishClues').textContent=document.querySelectorAll('.clue.found').length+'/3 clues found'">LOGIN REQUEST</button></div><small id="phishClues">0/3 clues found</small></div><h3 class="decisionTitle">YOUR DECISION</h3><div class="simChoices"><button class="choice" onclick="phishDecision(false,this)">OPEN THE LINK</button><button class="choice" onclick="phishDecision(true,this)">REPORT PHISHING</button></div>`;
if(t==='network')c.innerHTML=`<span class="kicker">SIM 02 // NETWORK DEFENSE</span><h2>PACKET PATROL</h2><p class="simIntro">Packets are approaching your firewall. Inspect each one and decide whether policy should ALLOW or BLOCK it.</p><div class="packetStage gameStage"><div class="node client">ENDPOINT</div><div class="fw">FIREWALL</div><div class="node server">SERVER</div><div class="packetGame" id="packetGame"></div></div><div id="packetInfo" class="simInfo">Packet 1 of 3 ready for inspection.</div><div class="simChoices" id="packetChoices"><button class="choice" onclick="packetDecision(true)">ALLOW</button><button class="choice" onclick="packetDecision(false)">BLOCK</button></div>`;
if(t==='crypto')c.innerHTML=`<span class="kicker">SIM 03 // CRYPTOGRAPHY LAB</span><h2>PROTECT THE MESSAGE</h2><p class="simIntro">Choose the right security technique for each goal. Think about what must be protected.</p><div class="cryptoStage cryptoGame"><div class="cryptoBox"><b>MESSAGE</b><p>EXAM RESULTS: 92%</p></div><div class="cryptoArrow">→</div><div class="cryptoBox activeCrypto"><b>PROTECTED DATA</b><p class="cipher">8F2A • 19C4 • 77BD</p></div></div><div class="cryptoQuestion">A student needs to send confidential results so unauthorized people cannot read them. Which technique is the best fit?</div><div class="simChoices"><button class="choice" onclick="cryptoDecision('hash',this)">HASHING</button><button class="choice" onclick="cryptoDecision('encrypt',this)">ENCRYPTION</button><button class="choice" onclick="cryptoDecision('sign',this)">DIGITAL SIGNATURE</button></div>`;
if(t==='soc')c.innerHTML=`<span class="kicker">SIM 04 // SOC INCIDENT RESPONSE</span><h2>ALERT → RESPONSE</h2><p class="simIntro">You are the SOC analyst. Investigate the alert, then choose the safest response order.</p><div class="alert liveAlert"><b>⚠ HIGH PRIORITY</b><p>Multiple failed logins followed by a successful login from an unusual location.</p><div class="pulseDot"></div></div><div class="socOrder"><div class="orderStep" data-step="1">01 • DETECT</div><div class="orderStep" data-step="2">02 • TRIAGE</div><div class="orderStep" data-step="3">03 • CONTAIN</div><div class="orderStep" data-step="4">04 • RECOVER</div></div><div id="socInfo" class="simInfo">Choose the next response step.</div><div class="simChoices" id="socChoices"><button class="choice" onclick="socDecision('triage',this)">TRIAGE THE ALERT</button><button class="choice" onclick="socDecision('contain',this)">IMMEDIATELY WIPE THE SERVER</button><button class="choice" onclick="socDecision('post',this)">POST THE ALERT PUBLICLY</button></div>`;
$('modal').style.display='grid'}
function phishDecision(ok,b){document.querySelectorAll('.simChoices .choice').forEach(x=>x.disabled=true);b.classList.add(ok?'correct':'wrong');if(ok){b.classList.add('correct');resultCard('PHISH DETECTED','Three red flags: suspicious domain, artificial urgency and an unexpected login request. Verify through an official channel.',60,'sim-phish',true)}else resultCard('PHISHING TRAP','The safe move is to avoid the message link and report it. Always verify through a trusted channel.',0,'sim-phish',false)}
let packetIndex=0,packetScore=0;const packets=[{label:'HTTPS • university portal',safe:true,reason:'Encrypted web traffic to an expected service matches policy.'},{label:'Unknown host • suspicious port',safe:false,reason:'Unexpected destination/port should be blocked pending investigation.'},{label:'DNS • approved resolver',safe:true,reason:'The approved resolver is part of normal network operations.'}];
function packetDecision(allow){let p=packets[packetIndex],ok=allow===p.safe;packetScore+=ok?1:0;const g=$('packetGame');g.innerHTML=`<div class="travelPacket ${p.safe?'safe':'danger'}"></div>`;$('packetInfo').innerHTML=`<b>${ok?'✓ Correct':'✕ Incorrect'}</b> — ${p.reason}`;document.querySelectorAll('#packetChoices .choice').forEach(x=>x.disabled=true);setTimeout(()=>{packetIndex++;if(packetIndex<packets.length){$('packetInfo').textContent=`Packet ${packetIndex+1} of 3 ready for inspection.`;document.querySelectorAll('#packetChoices .choice').forEach(x=>x.disabled=false)}else{let okAll=packetScore===3;$('packetInfo').innerHTML=okAll?'✓ Firewall policy handled correctly.':'Review the traffic policy and try the exercise again.';if(okAll)resultCard('NETWORK SECURED','You correctly classified all three packets according to the simulated policy.',70,'sim-network',true)}},900)}
function cryptoDecision(choice,b){document.querySelectorAll('.cryptoGame~.simChoices .choice').forEach(x=>x.disabled=true);let ok=choice==='encrypt';b.classList.add(ok?'correct':'wrong');if(ok){document.querySelector('.activeCrypto').classList.add('encrypting');resultCard('MESSAGE PROTECTED','Encryption is designed to make readable data unintelligible without the appropriate key.',50,'sim-crypto',true)}else resultCard('NOT THE BEST FIT','Hashing is for integrity-oriented representations; digital signatures help authenticate integrity and origin. Confidentiality here calls for encryption.',0,'sim-crypto',false)}
let socStep=0;function socDecision(choice,b){let good=choice==='triage'&&socStep===0;document.querySelectorAll('#socChoices .choice').forEach(x=>x.disabled=true);if(good){b.classList.add('correct');socStep=1;$('socInfo').textContent='✓ Triage complete. Now contain the suspected account/session.';$('socChoices').innerHTML='<button class="choice" onclick="socDecision(\'contain\',this)">CONTAIN THE ACCOUNT/SESSION</button><button class="choice" onclick="socDecision(\'ignore\',this)">CLOSE THE ALERT</button>'}else if(choice==='contain'&&socStep===1){b.classList.add('correct');socStep=2;$('socInfo').textContent='✓ Containment complete. Recover only after investigation and credential reset.';$('socChoices').innerHTML='<button class="choice" onclick="socDecision(\'recover\',this)">RECOVER AND VERIFY</button><button class="choice" onclick="socDecision(\'delete\',this)">DELETE THE LOGS</button>'}else if(choice==='recover'&&socStep===2){b.classList.add('correct');socStep=3;document.querySelectorAll('.orderStep').forEach(x=>x.classList.add('done'));resultCard('INCIDENT CONTAINED','You followed a defensible response flow: detect → triage → contain → recover.',80,'sim-soc',true)}else{b.classList.add('wrong');$('socInfo').textContent='✕ That response skips an important investigation step. Follow the incident-response sequence.';setTimeout(()=>document.querySelectorAll('#socChoices .choice').forEach(x=>x.disabled=false),500)}}
async function renderBoard(){try{let d=await api('/api/leaderboard');$('board').innerHTML=d.students.map((x,i)=>`<div class="row"><b>#${i+1}</b><strong class="${x.id===user.id?'you':''}">${x.name}${x.id===user.id?' (YOU)':''}</strong><span>${x.xp} XP</span><small>${x.xp>=1000?'CYBER GUARDIAN':x.xp>=500?'CYBER DEFENDER':'CYBER CADET'}</small></div>`).join('')}catch(e){}}
const badges=[['🛡️','FIRST DEFENSE',()=>state.completed.some(x=>x.startsWith('lesson-'))],['🎣','PHISH FINDER',()=>state.completed.some(x=>x.startsWith('mission-')||x==='sim-phish')],['🧠','QUIZ MASTER',()=>state.completed.some(x=>x.startsWith('quiz-'))],['🔥','STREAK STARTER',()=>state.streak>=3],['🌐','NETWORK NAVIGATOR',()=>state.completed.filter(x=>x.startsWith('lesson-')).length>=3||state.completed.includes('sim-network')],['⚔️','CYBER DEFENDER',()=>state.xp>=500],['👑','CYBER GUARDIAN',()=>state.xp>=1200],['⌬','CRYPTO CADET',()=>state.completed.includes('lesson-5')||state.completed.includes('sim-crypto')]];
function renderBadges(){$('badges').innerHTML=badges.map(b=>`<div class="badge ${b[2]?'on':''}"><div>${b[0]}</div><b>${b[1]}</b><small>Achievement</small></div>`).join('')}
async function renderCertificate(){try{let d=await api('/api/certificate');let done=d.completedZones||lessons.filter((_,i)=>zoneCompleted(i)).length;let eligible=d.eligible;let card=$('certificateCard');if(d.issuedAt){card.innerHTML=`<div class="certificateReady"><div class="certSeal">✓</div><div><span class="kicker">VERIFIED ACADEMY CREDENTIAL</span><h3>CYBER//QUEST STUDENT CERTIFICATE</h3><p>This certifies that <b>${user.name}</b> has completed all 12 cybersecurity learning zones.</p><small>Issued ${new Date(d.issuedAt).toLocaleDateString()} • Verification code: <b>${d.code}</b></small></div><button class="btn primary" onclick="printCertificate()">PRINT / SAVE PDF</button></div>`}else if(eligible){card.innerHTML=`<div class="certificateReady"><div class="certSeal">★</div><div><span class="kicker">MASTERY COMPLETE</span><h3>YOUR CERTIFICATE IS READY</h3><p>${user.name}, you completed all 12 learning zones. Issue your certificate and receive a unique verification code.</p></div><button class="btn primary" onclick="issueCertificate()">ISSUE CERTIFICATE</button></div>`}else{card.innerHTML=`<div class="certificateLocked"><div class="certProgress"><b>${done}/12</b><span>zones complete</span></div><div><span class="kicker">CREDENTIAL LOCKED</span><h3>MASTER THE CYBER CITY</h3><p>Complete every learning zone to unlock your certificate.</p><div class="miniTrack"><span style="width:${Math.round(done/12*100)}%"></span></div></div><strong>${Math.round(done/12*100)}%</strong></div>`}}catch(e){}}
async function issueCertificate(){try{let d=await api('/api/certificate',{method:'POST',body:'{}'});alert(`Certificate issued! Verification code: ${d.code}`);renderCertificate()}catch(e){alert(e.message)}}
function printCertificate(){window.print()}
function term(){let a=['Authenticating student session...','Identity verified: '+user.email,'Loading security telemetry...','[OK] Access controls','[OK] Learning zones','[OK] Mission queue','[OK] Interactive simulations','STATUS: READY FOR TODAY\'S CHALLENGE'];$('term').innerHTML=a.map((x,i)=>`<div class="line" style="animation-delay:${i*.35}s">> ${x}</div>`).join('')}
boot();

// ============================================================
// PHASE 2 // ADVANCED CYBER LAB ENGINE
// Safe, fictional training scenarios only.
// ============================================================
const advancedLabCatalog={
  phishing:{
    title:'PHISHING INVESTIGATION',
    subtitle:'SOC CASE FILE // PH-1042',
    xp:100,
    key:'advanced-phishing-investigation',
    steps:['EVIDENCE','ANALYZE','DECIDE','REPORT']
  }
};
let activeAdvancedLab=null;
let phishingEvidence=new Set();
let phishingDecision=null;

function advancedLab(type){
  if(type==='ransomware') return openRansomwareLab();
  if(type!=='phishing') return;
  activeAdvancedLab=type;
  phishingEvidence=new Set();
  phishingDecision=null;
  const c=$('modalBody');
  c.innerHTML=`
    <div class="labModalHead">
      <div><span class="kicker">PHASE 2 // ADVANCED LAB 01</span><h2>PHISHING INVESTIGATION</h2>
      <p class="simIntro">A student reported a suspicious account-verification email. You are the analyst. Collect evidence before making your final classification.</p></div>
      <div class="caseBadge">CASE PH-1042<br><small>OPEN</small></div>
    </div>
    <div class="labProgress"><span id="phishLabProgress" style="width:25%"></span></div>
    <div class="investigationGrid">
      <aside class="evidencePanel">
        <div class="panelTitle"><span>CASE FILE</span><b>5 EVIDENCE ITEMS</b></div>
        <button class="evidenceItem active" onclick="phishLabEvidence('email',this)"><b>01</b><span>EMAIL BODY</span><i>›</i></button>
        <button class="evidenceItem" onclick="phishLabEvidence('sender',this)"><b>02</b><span>SENDER</span><i>›</i></button>
        <button class="evidenceItem" onclick="phishLabEvidence('domain',this)"><b>03</b><span>LINK DOMAIN</span><i>›</i></button>
        <button class="evidenceItem" onclick="phishLabEvidence('header',this)"><b>04</b><span>MESSAGE HEADER</span><i>›</i></button>
        <button class="evidenceItem" onclick="phishLabEvidence('context',this)"><b>05</b><span>USER CONTEXT</span><i>›</i></button>
      </aside>
      <div class="evidenceWorkspace">
        <div id="phishEvidenceView" class="evidenceView"></div>
        <div class="evidenceCounter"><span id="phishEvidenceCount">0/5 evidence items reviewed</span><span id="phishLabHint">Review every item before deciding.</span></div>
      </div>
    </div>
    <div class="labDecisionBlock">
      <div><span class="kicker">FINAL CLASSIFICATION</span><h3>What should the SOC record?</h3></div>
      <div class="labDecisionChoices">
        <button class="choice" onclick="phishLabDecision('safe',this)">LEGITIMATE</button>
        <button class="choice" onclick="phishLabDecision('suspicious',this)">SUSPICIOUS</button>
        <button class="choice" onclick="phishLabDecision('malicious',this)">MALICIOUS PHISHING</button>
      </div>
      <div id="phishLabFeedback"></div>
    </div>`;
  $('modal').style.display='grid';
  phishLabEvidence('email',document.querySelector('.evidenceItem'));
}

const phishingEvidenceData={
 email:{title:'EMAIL BODY',type:'MESSAGE',html:`<div class="fakeEmail"><div class="fakeEmailBar"><span>INBOX // REPORTED MESSAGE</span><span class="riskHigh">HIGH RISK</span></div><div class="emailRow"><b>Subject</b><span>URGENT: Verify your student account today</span></div><div class="emailRow"><b>Message</b><span>Your account will be suspended within 30 minutes. Use the verification portal below to restore access.</span></div><div class="fakeLink">VERIFY-STUDENT-ACCOUNT</div><small>Reminder: never use a message link to sign in when the request is unexpected.</small></div>`,clue:'Artificial urgency + unexpected login request.'},
 sender:{title:'SENDER',type:'IDENTITY',html:`<div class="forensicCard"><div><span>DISPLAY NAME</span><b>University IT Security</b></div><div><span>ACTUAL ADDRESS</span><b>it-security@univer5ity-support.example</b></div><div class="redFlag">⚠ The domain uses a look-alike spelling and is not the university's official domain.</div></div>`,clue:'Sender identity does not match the trusted organization.'},
 domain:{title:'LINK DOMAIN',type:'URL ANALYSIS',html:`<div class="urlInspect"><span>DESTINATION PREVIEW</span><code>https://login.univer5ity-support.example/verify</code><div class="urlParts"><b>HTTPS</b><b>LOOK-ALIKE DOMAIN</b><b>/verify</b></div><p>The use of HTTPS does not prove a site is trustworthy. The domain itself is the key clue.</p></div>`,clue:'HTTPS can encrypt a connection to a malicious site; the domain remains suspicious.'},
 header:{title:'MESSAGE HEADER',type:'MAIL TRACE',html:`<div class="headerCard"><div><span>RETURN-PATH</span><b>bounce@mailer.univer5ity-support.example</b></div><div><span>REPLY-TO</span><b>verify-team@univer5ity-support.example</b></div><div><span>AUTH STATUS</span><b class="warningText">DOMAIN MISMATCH</b></div><div class="traceLine"><i></i><span>UNKNOWN SENDER → EXTERNAL MAILER → STUDENT INBOX</span></div></div>`,clue:'The message authentication context does not align with the claimed organization.'},
 context:{title:'USER CONTEXT',type:'CORRELATION',html:`<div class="contextCard"><div class="contextSignal"><b>USER REPORT</b><span>“I did not request an account change.”</span></div><div class="contextSignal"><b>KNOWN ACTIVITY</b><span>No scheduled maintenance or account action exists for this student.</span></div><div class="contextSignal"><b>RISK</b><span>Credential theft is plausible if the student follows the link.</span></div></div>`,clue:'The request is unexpected and conflicts with known user activity.'}
};

function phishLabEvidence(key,button){
  const d=phishingEvidenceData[key];
  if(!d)return;
  phishingEvidence.add(key);
  document.querySelectorAll('.evidenceItem').forEach(x=>x.classList.remove('active'));
  if(button)button.classList.add('active');
  $('phishEvidenceView').innerHTML=`<div class="evidenceViewHead"><span class="kicker">${d.type}</span><h3>${d.title}</h3></div>${d.html}<div class="analystNote">ANALYST CLUE <span>✓ ${d.clue}</span></div>`;
  $('phishEvidenceCount').textContent=`${phishingEvidence.size}/5 evidence items reviewed`;
  $('phishLabProgress').style.width=(25+(phishingEvidence.size/5)*35)+'%';
  $('phishLabHint').textContent=phishingEvidence.size===5?'All evidence reviewed. Make your classification.':'Review the remaining evidence before deciding.';
}

async function phishLabDecision(choice,b){
  document.querySelectorAll('.labDecisionChoices .choice').forEach(x=>x.disabled=true);
  phishingDecision=choice;
  const complete=phishingEvidence.size===5;
  const correct=choice==='malicious';
  if(correct)b.classList.add('correct'); else b.classList.add('wrong');
  if(!complete){
    $('phishLabFeedback').innerHTML=`<div class="feedback wrongFeedback">⚠ Classification recorded, but your evidence review is incomplete. A strong analyst documents the available evidence first.</div>`;
  }else if(correct){
    $('phishLabFeedback').innerHTML=`<div class="feedback correctFeedback">✓ Correct classification. The evidence strongly supports a malicious phishing attempt.</div>`;
    setTimeout(()=>completeAdvancedPhishing(),650);
  }else{
    $('phishLabFeedback').innerHTML=`<div class="feedback wrongFeedback">✕ Reassess the evidence. Look at the sender, look-alike domain, header mismatch and unexpected request.</div>`;
    setTimeout(()=>document.querySelectorAll('.labDecisionChoices .choice').forEach(x=>x.disabled=false),650);
  }
}

async function completeAdvancedPhishing(){
  const score=Math.min(1000,650+phishingEvidence.size*70);
  $('phishLabProgress').style.width='100%';
  $('phishLabFeedback').innerHTML=`<div class="labResult"><div class="resultIcon">✓</div><div><span class="kicker">CASE CLOSED</span><h3>PHISHING CONFIRMED</h3><p>You collected ${phishingEvidence.size}/5 evidence items and reached the correct classification.</p><b>INVESTIGATION SCORE ${score}/1000</b></div><div class="resultXP">+100 XP</div></div>`;
  await gain(100,'advanced-phishing-investigation');
  $('phishLabHint').textContent='Case complete • XP saved to your academy progress.';
  render();
}


// ============================================================
// PHASE 2.4 // RANSOMWARE RESPONSE LAB
// Safe, fictional defensive incident-response training.
// ============================================================
let ransomwareEvidence=new Set();
let ransomwareStage=0;

function openRansomwareLab(){
  ransomwareEvidence=new Set();
  ransomwareStage=0;
  const c=$('modalBody');
  c.innerHTML=`
    <div class="labModalHead">
      <div><span class="kicker">PHASE 2 // ADVANCED LAB 03</span><h2>RANSOMWARE RESPONSE</h2>
      <p class="simIntro">A finance workstation shows signs of rapid file encryption. You are the incident responder. Review the evidence, contain the host, preserve evidence, then plan safe recovery.</p></div>
      <div class="caseBadge">CASE RW-3141<br><small>ACTIVE</small></div>
    </div>
    <div class="labProgress"><span id="ransomLabProgress" style="width:12%"></span></div>
    <div class="ransomBanner"><div><span class="kicker">CRITICAL INCIDENT</span><h3>ENCRYPTION ACTIVITY DETECTED</h3></div><div class="ransomStat"><b>1,842</b><span>FILES AFFECTED</span></div><div class="ransomStat"><b>FINANCE-PC-07</b><span>HOST</span></div></div>
    <div class="investigationGrid">
      <aside class="evidencePanel">
        <div class="panelTitle"><span>CASE FILE</span><b>6 EVIDENCE ITEMS</b></div>
        <button class="evidenceItem active" onclick="ransomEvidenceView('alert',this)"><b>01</b><span>ALERT</span><i>›</i></button>
        <button class="evidenceItem" onclick="ransomEvidenceView('endpoint',this)"><b>02</b><span>ENDPOINT</span><i>›</i></button>
        <button class="evidenceItem" onclick="ransomEvidenceView('process',this)"><b>03</b><span>PROCESS</span><i>›</i></button>
        <button class="evidenceItem" onclick="ransomEvidenceView('files',this)"><b>04</b><span>FILES</span><i>›</i></button>
        <button class="evidenceItem" onclick="ransomEvidenceView('network',this)"><b>05</b><span>NETWORK</span><i>›</i></button>
        <button class="evidenceItem" onclick="ransomEvidenceView('timeline',this)"><b>06</b><span>TIMELINE</span><i>›</i></button>
      </aside>
      <div class="evidenceWorkspace">
        <div id="ransomEvidenceView" class="evidenceView"></div>
        <div class="evidenceCounter"><span id="ransomEvidenceCount">0/6 evidence items reviewed</span><span id="ransomLabHint">Review the full incident before taking action.</span></div>
      </div>
    </div>
    <div class="labDecisionBlock">
      <div><span class="kicker">RESPONSE STEP 01</span><h3>What is the safest first action?</h3></div>
      <div class="labDecisionChoices ransomChoices">
        <button class="choice" onclick="ransomDecision('isolate',this)">ISOLATE THE AFFECTED HOST</button>
        <button class="choice" onclick="ransomDecision('reboot',this)">REBOOT THE HOST IMMEDIATELY</button>
        <button class="choice" onclick="ransomDecision('pay',this)">PAY THE RANSOM FIRST</button>
      </div>
      <div id="ransomFeedback"></div>
    </div>`;
  $('modal').style.display='grid';
  ransomEvidenceView('alert',document.querySelector('.evidenceItem'));
}

const ransomwareEvidenceData={
 alert:{title:'SIEM ALERT',type:'DETECTION',html:`<div class="socEvidenceCard"><div class="socMetric critical"><span>SEVERITY</span><b>CRITICAL</b></div><div class="socMetric"><span>RULE</span><b>Mass file modification + suspicious process + outbound connection</b></div><div class="socMetric"><span>HOST</span><b>FINANCE-PC-07</b></div><div class="socMetric"><span>ALERT TIME</span><b>10:42:17 UTC</b></div></div>`,clue:'The alert combines rapid file changes with suspicious execution on one endpoint.'},
 endpoint:{title:'ENDPOINT TELEMETRY',type:'HOST',html:`<div class="socEvidenceCard"><div class="socMetric"><span>USER</span><b>finance.employee</b></div><div class="socMetric"><span>HOST</span><b>FINANCE-PC-07</b></div><div class="socMetric"><span>AGENT</span><b>ONLINE • REPORTING</b></div><div class="redFlag">⚠ The host is still connected. Containment should limit spread while keeping evidence available.</div></div>`,clue:'The affected workstation is still online, creating an opportunity for containment.'},
 process:{title:'PROCESS TREE',type:'EXECUTION',html:`<div class="processTree"><div>explorer.exe</div><span>↓</span><div>invoice-viewer.exe <small>untrusted source</small></div><span>↓</span><div class="dangerProcess">encryptor.exe <small>rapid file operations</small></div></div>`,clue:'An unfamiliar process is performing rapid encryption-like file operations.'},
 files:{title:'FILE ACTIVITY',type:'IMPACT',html:`<div class="forensicCard"><div><span>FILES MODIFIED</span><b>1,842</b></div><div><span>EXTENSION PATTERN</span><b>.locked-demo</b></div><div><span>SHARED DRIVE</span><b>NO EVIDENCE OF ACCESS</b></div><div class="redFlag">⚠ The simulation uses a harmless fictional extension. No real files are modified by CYBER//QUEST.</div></div>`,clue:'The impact is concentrated on the endpoint and uses a fictional training artifact.'},
 network:{title:'NETWORK TELEMETRY',type:'CONNECTION',html:`<div class="networkEvidence"><div class="routeRow"><span>HOST</span><b>FINANCE-PC-07</b></div><div class="routeRow"><span>DESTINATION</span><b>198.51.100.44:443</b></div><div class="routeRow"><span>STATUS</span><b class="warningText">NEW EXTERNAL DESTINATION</b></div><div class="routeRow"><span>BEHAVIOR</span><b>SHORT BURSTS AFTER EXECUTION</b></div><p>198.51.100.0/24 is reserved for documentation and is used here only as a fictional training destination.</p></div>`,clue:'A new outbound destination appears after the suspicious process starts.'},
 timeline:{title:'INCIDENT TIMELINE',type:'CORRELATION',html:`<div class="incidentTimeline"><div><b>10:39</b><span>Employee opens an unexpected invoice attachment</span></div><div><b>10:41</b><span>Untrusted process launches from user context</span></div><div><b>10:42</b><span>Rapid file modifications begin</span></div><div><b>10:42</b><span>SIEM alert + new outbound connection</span></div></div>`,clue:'Execution, file impact and network activity align in one short incident window.'}
};

function ransomEvidenceView(key,button){
  const d=ransomwareEvidenceData[key];
  if(!d)return;
  ransomwareEvidence.add(key);
  document.querySelectorAll('.evidenceItem').forEach(x=>x.classList.remove('active'));
  if(button)button.classList.add('active');
  $('ransomEvidenceView').innerHTML=`<div class="evidenceViewHead"><span class="kicker">${d.type}</span><h3>${d.title}</h3></div>${d.html}<div class="analystNote">ANALYST CLUE <span>✓ ${d.clue}</span></div>`;
  $('ransomEvidenceCount').textContent=`${ransomwareEvidence.size}/6 evidence items reviewed`;
  $('ransomLabProgress').style.width=(12+(ransomwareEvidence.size/6)*43)+'%';
  $('ransomLabHint').textContent=ransomwareEvidence.size===6?'Evidence correlated. Choose the safest containment action.':'Review the remaining evidence before deciding.';
}

function ransomDecision(choice,b){
  document.querySelectorAll('.ransomChoices .choice').forEach(x=>x.disabled=true);
  if(ransomwareEvidence.size!==6){
    b.classList.add('wrong');
    $('ransomFeedback').innerHTML=`<div class="feedback wrongFeedback">⚠ Containment is premature. Review all six evidence items first.</div>`;
    setTimeout(()=>document.querySelectorAll('.ransomChoices .choice').forEach(x=>x.disabled=false),650);
    return;
  }
  if(choice==='isolate'){
    b.classList.add('correct');
    ransomwareStage=1;
    $('ransomLabProgress').style.width='72%';
    $('ransomFeedback').innerHTML=`<div class="feedback correctFeedback">✓ Correct. Isolate the affected host to limit spread while preserving evidence.</div>
      <div class="ransomNext"><span class="kicker">RESPONSE STEP 02</span><h3>What should happen before recovery?</h3>
      <div class="ransomNextChoices"><button class="choice" onclick="ransomRecovery('preserve',this)">PRESERVE EVIDENCE + VERIFY BACKUPS</button><button class="choice" onclick="ransomRecovery('restore',this)">RESTORE IMMEDIATELY WITHOUT INVESTIGATION</button><button class="choice" onclick="ransomRecovery('reconnect',this)">RECONNECT THE HOST TO TEST IT</button></div><div id="ransomRecoveryFeedback"></div></div>`;
  }else{
    b.classList.add('wrong');
    $('ransomFeedback').innerHTML=`<div class="feedback wrongFeedback">✕ That action can destroy evidence or increase impact. Contain the affected endpoint first.</div>`;
    setTimeout(()=>document.querySelectorAll('.ransomChoices .choice').forEach(x=>x.disabled=false),650);
  }
}

async function ransomRecovery(choice,b){
  document.querySelectorAll('.ransomNextChoices .choice').forEach(x=>x.disabled=true);
  if(choice==='preserve'){
    b.classList.add('correct');
    ransomwareStage=2;
    $('ransomLabProgress').style.width='100%';
    $('ransomRecoveryFeedback').innerHTML=`<div class="feedback correctFeedback">✓ Strong response. Preserve evidence, verify recovery sources, and only restore after the incident is understood.</div>`;
    setTimeout(()=>completeRansomwareLab(),650);
  }else{
    b.classList.add('wrong');
    $('ransomRecoveryFeedback').innerHTML=`<div class="feedback wrongFeedback">✕ Recovery should follow containment and evidence preservation. Avoid reconnecting or restoring blindly.</div>`;
    setTimeout(()=>document.querySelectorAll('.ransomNextChoices .choice').forEach(x=>x.disabled=false),650);
  }
}

async function completeRansomwareLab(){
  const score=Math.min(1000,760+ransomwareEvidence.size*40);
  $('ransomLabProgress').style.width='100%';
  $('ransomFeedback').insertAdjacentHTML('beforeend',`<div class="labResult"><div class="resultIcon">✓</div><div><span class="kicker">INCIDENT CONTAINED</span><h3>RANSOMWARE RESPONSE COMPLETE</h3><p>You correlated ${ransomwareEvidence.size}/6 evidence items, isolated the affected host and chose evidence-preserving recovery.</p><b>RESPONSE SCORE ${score}/1000</b></div><div class="resultXP">+150 XP</div></div>`);
  await gain(150,'advanced-ransomware-response');
  $('ransomLabHint').textContent='Case complete • XP saved to your academy progress.';
  render();
}


// ============================================================
// PHASE 2.3 // SOC INCIDENT RESPONSE LAB
// Safe, fictional defensive training scenario.
// ============================================================
let socEvidence=new Set();

function openSocLab(){
  socEvidence=new Set();
  socDecision=null;
  const c=$('modalBody');
  c.innerHTML=`
    <div class="labModalHead">
      <div><span class="kicker">PHASE 2 // ADVANCED LAB 02</span><h2>SOC INCIDENT RESPONSE</h2>
      <p class="simIntro">A workstation has triggered a high-confidence alert. You are the Tier-1 analyst. Correlate the evidence, identify the incident, then choose the safest containment sequence.</p></div>
      <div class="caseBadge">CASE SOC-2077<br><small>ACTIVE</small></div>
    </div>
    <div class="labProgress"><span id="socLabProgress" style="width:15%"></span></div>
    <div class="investigationGrid">
      <aside class="evidencePanel">
        <div class="panelTitle"><span>CASE FILE</span><b>6 EVIDENCE ITEMS</b></div>
        <button class="evidenceItem active" onclick="socLabEvidence('alert',this)"><b>01</b><span>SIEM ALERT</span><i>›</i></button>
        <button class="evidenceItem" onclick="socLabEvidence('endpoint',this)"><b>02</b><span>ENDPOINT</span><i>›</i></button>
        <button class="evidenceItem" onclick="socLabEvidence('auth',this)"><b>03</b><span>AUTH LOG</span><i>›</i></button>
        <button class="evidenceItem" onclick="socLabEvidence('process',this)"><b>04</b><span>PROCESS</span><i>›</i></button>
        <button class="evidenceItem" onclick="socLabEvidence('network',this)"><b>05</b><span>NETWORK</span><i>›</i></button>
        <button class="evidenceItem" onclick="socLabEvidence('timeline',this)"><b>06</b><span>TIMELINE</span><i>›</i></button>
      </aside>
      <div class="evidenceWorkspace">
        <div id="socEvidenceView" class="evidenceView"></div>
        <div class="evidenceCounter"><span id="socEvidenceCount">0/6 evidence items reviewed</span><span id="socLabHint">Correlate the evidence before containment.</span></div>
      </div>
    </div>
    <div class="labDecisionBlock">
      <div><span class="kicker">INCIDENT TRIAGE</span><h3>What is the most likely incident?</h3></div>
      <div class="labDecisionChoices socChoices">
        <button class="choice" onclick="socLabDecision('benign',this)">BENIGN ADMIN ACTIVITY</button>
        <button class="choice" onclick="socLabDecision('phishing',this)">PHISHING ONLY</button>
        <button class="choice" onclick="socLabDecision('compromise',this)">ENDPOINT COMPROMISE</button>
      </div>
      <div id="socLabFeedback"></div>
    </div>`;
  $('modal').style.display='grid';
  socLabEvidence('alert',document.querySelector('.evidenceItem'));
}

const socEvidenceData={
 alert:{title:'SIEM ALERT',type:'DETECTION',html:`<div class="socEvidenceCard"><div class="socMetric critical"><span>SEVERITY</span><b>CRITICAL</b></div><div class="socMetric"><span>RULE</span><b>Credential access + unusual process + outbound connection</b></div><div class="socMetric"><span>HOST</span><b>STUDENT-LT-042</b></div><div class="socMetric"><span>ALERT TIME</span><b>10:14:22 UTC</b></div></div>`,clue:'Multiple signals fired on the same endpoint within a short window.'},
 endpoint:{title:'ENDPOINT',type:'HOST TELEMETRY',html:`<div class="socEvidenceCard"><div class="socMetric"><span>USER</span><b>student01</b></div><div class="socMetric"><span>HOST</span><b>STUDENT-LT-042</b></div><div class="socMetric"><span>SECURITY AGENT</span><b>ONLINE • REPORTING</b></div><div class="redFlag">⚠ The alert is tied to a real user workstation, so containment should protect the account and host.</div></div>`,clue:'The affected asset is an active student workstation, not a test server.'},
 auth:{title:'AUTH LOG',type:'IDENTITY',html:`<div class="logTable"><div><span>10:11:04</span><b>student01</b><em>LOGIN SUCCESS</em></div><div><span>10:12:17</span><b>student01</b><em>PRIVILEGE REQUEST</em></div><div><span>10:13:51</span><b>student01</b><em>NEW SESSION • UNUSUAL</em></div><div><span>10:14:02</span><b>student01</b><em>AUTH FAILURE ×3</em></div></div>`,clue:'The identity shows an unusual session followed by repeated authentication failures.'},
 process:{title:'PROCESS TREE',type:'ENDPOINT',html:`<div class="processTree"><div>explorer.exe</div><span>↓</span><div>powershell.exe <small>encoded command</small></div><span>↓</span><div class="dangerProcess">rundll32.exe <small>unexpected child</small></div></div>`,clue:'An encoded PowerShell process spawned an unusual child process.'},
 network:{title:'NETWORK TELEMETRY',type:'CONNECTION',html:`<div class="networkEvidence"><div class="routeRow"><span>HOST</span><b>STUDENT-LT-042</b></div><div class="routeRow"><span>DESTINATION</span><b>203.0.113.77:443</b></div><div class="routeRow"><span>STATUS</span><b class="warningText">NEW EXTERNAL DESTINATION</b></div><div class="routeRow"><span>VOLUME</span><b>PERIODIC OUTBOUND BEACON</b></div><p>203.0.113.0/24 is reserved for documentation and is used here as a fictional training destination.</p></div>`,clue:'The endpoint is making a new periodic outbound connection after the suspicious process activity.'},
 timeline:{title:'CORRELATED TIMELINE',type:'CORRELATION',html:`<div class="incidentTimeline"><div><b>10:12</b><span>Unusual authentication session</span></div><div><b>10:13</b><span>Encoded PowerShell launches</span></div><div><b>10:14</b><span>Credential failures + SIEM alert</span></div><div><b>10:14</b><span>New outbound beacon observed</span></div></div>`,clue:'Identity, process and network signals align into one incident window.'}
};

function socLabEvidence(key,button){
  const d=socEvidenceData[key];
  if(!d)return;
  socEvidence.add(key);
  document.querySelectorAll('.evidenceItem').forEach(x=>x.classList.remove('active'));
  if(button)button.classList.add('active');
  $('socEvidenceView').innerHTML=`<div class="evidenceViewHead"><span class="kicker">${d.type}</span><h3>${d.title}</h3></div>${d.html}<div class="analystNote">ANALYST CLUE <span>✓ ${d.clue}</span></div>`;
  $('socEvidenceCount').textContent=`${socEvidence.size}/6 evidence items reviewed`;
  $('socLabProgress').style.width=(15+(socEvidence.size/6)*45)+'%';
  $('socLabHint').textContent=socEvidence.size===6?'Evidence correlated. Choose the incident classification.':'Review the remaining evidence before deciding.';
}

async function socLabDecision(choice,b){
  document.querySelectorAll('.socChoices .choice').forEach(x=>x.disabled=true);
  socDecision=choice;
  const complete=socEvidence.size===6;
  const correct=choice==='compromise';
  if(correct)b.classList.add('correct'); else b.classList.add('wrong');
  if(!complete){
    $('socLabFeedback').innerHTML=`<div class="feedback wrongFeedback">⚠ Triage is premature. Review all six evidence items before recording the incident.</div>`;
  }else if(correct){
    $('socLabFeedback').innerHTML=`<div class="feedback correctFeedback">✓ Correct. The correlated signals indicate an endpoint compromise requiring containment.</div>
      <div class="socContainment"><span class="kicker">CONTAINMENT DECISION</span><h3>Choose the safest first response</h3>
      <div class="containChoices">
        <button class="choice" onclick="socContainment('isolate',this)">ISOLATE HOST + PRESERVE EVIDENCE</button>
        <button class="choice" onclick="socContainment('reboot',this)">REBOOT HOST IMMEDIATELY</button>
        <button class="choice" onclick="socContainment('delete',this)">DELETE SUSPICIOUS FILES FIRST</button>
      </div><div id="socContainFeedback"></div></div>`;
  }else{
    $('socLabFeedback').innerHTML=`<div class="feedback wrongFeedback">✕ Reassess the correlation. The process, identity and network signals point beyond a simple phishing event.</div>`;
    setTimeout(()=>document.querySelectorAll('.socChoices .choice').forEach(x=>x.disabled=false),650);
  }
}

async function socContainment(choice,b){
  document.querySelectorAll('.containChoices .choice').forEach(x=>x.disabled=true);
  if(choice==='isolate'){
    b.classList.add('correct');
    $('socContainFeedback').innerHTML=`<div class="feedback correctFeedback">✓ Defensible response. Isolate the affected host while preserving evidence for investigation.</div>`;
    setTimeout(()=>completeSocLab(),650);
  }else{
    b.classList.add('wrong');
    $('socContainFeedback').innerHTML=`<div class="feedback wrongFeedback">✕ Not the safest first action. Preserve evidence and stop further activity before destructive cleanup.</div>`;
    setTimeout(()=>document.querySelectorAll('.containChoices .choice').forEach(x=>x.disabled=false),650);
  }
}

async function completeSocLab(){
  const score=Math.min(1000,700+socEvidence.size*45);
  $('socLabProgress').style.width='100%';
  $('socLabFeedback').innerHTML=`<div class="labResult"><div class="resultIcon">✓</div><div><span class="kicker">INCIDENT CONTAINED</span><h3>SOC CASE CLOSED</h3><p>You correlated ${socEvidence.size}/6 evidence items and selected a defensible containment action.</p><b>RESPONSE SCORE ${score}/1000</b></div><div class="resultXP">+120 XP</div></div>`;
  await gain(120,'advanced-soc-incident-response');
  $('socLabHint').textContent='Case complete • XP saved to your academy progress.';
  render();
}

// Extend the Phase 2 lab launcher without replacing the existing phishing lab.
const _originalAdvancedLab=advancedLab;
advancedLab=function(type){
  if(type==='soc') return openSocLab();
  return _originalAdvancedLab(type);
};


// ============================================================
// PHASE 2.5 // NETWORK ATTACK INVESTIGATION LAB
// Safe, fictional defensive training scenario using documentation IPs.
// ============================================================
let networkEvidenceReviewed=new Set();
let networkStage=0;

function openNetworkLab(){
  networkEvidenceReviewed=new Set();
  networkStage=0;
  const c=$('modalBody');
  c.innerHTML=`
    <div class="labModalHead">
      <div><span class="kicker">PHASE 2 // ADVANCED LAB 04</span><h2>NETWORK ATTACK INVESTIGATION</h2>
      <p class="simIntro">A monitoring sensor has flagged unusual traffic from a workstation. You are the network analyst. Correlate the traffic evidence before identifying the attack and selecting a defensive response.</p></div>
      <div class="caseBadge">CASE NET-3141<br><small>ACTIVE</small></div>
    </div>
    <div class="labProgress"><span id="networkLabProgress" style="width:15%"></span></div>
    <div class="investigationGrid">
      <aside class="evidencePanel">
        <div class="panelTitle"><span>CASE FILE</span><b>6 EVIDENCE ITEMS</b></div>
        <button class="evidenceItem active" onclick="networkLabEvidence('alert',this)"><b>01</b><span>IDS ALERT</span><i>›</i></button>
        <button class="evidenceItem" onclick="networkLabEvidence('ports',this)"><b>02</b><span>PORT ACTIVITY</span><i>›</i></button>
        <button class="evidenceItem" onclick="networkLabEvidence('dns',this)"><b>03</b><span>DNS LOG</span><i>›</i></button>
        <button class="evidenceItem" onclick="networkLabEvidence('flows',this)"><b>04</b><span>FLOW DATA</span><i>›</i></button>
        <button class="evidenceItem" onclick="networkLabEvidence('firewall',this)"><b>05</b><span>FIREWALL</span><i>›</i></button>
        <button class="evidenceItem" onclick="networkLabEvidence('timeline',this)"><b>06</b><span>TIMELINE</span><i>›</i></button>
      </aside>
      <div class="evidenceWorkspace">
        <div id="networkEvidenceView" class="evidenceView"></div>
        <div class="evidenceCounter"><span id="networkEvidenceCount">0/6 evidence items reviewed</span><span id="networkLabHint">Correlate traffic, ports and destinations before deciding.</span></div>
      </div>
    </div>
    <div class="labDecisionBlock">
      <div><span class="kicker">ATTACK IDENTIFICATION</span><h3>What is the most likely attack?</h3></div>
      <div class="labDecisionChoices networkChoices">
        <button class="choice" onclick="networkAttackDecision('portscan',this)">PORT SCANNING / RECONNAISSANCE</button>
        <button class="choice" onclick="networkAttackDecision('beacon',this)">COMMAND-AND-CONTROL BEACONING</button>
        <button class="choice" onclick="networkAttackDecision('dns',this)">DNS MISCONFIGURATION</button>
      </div>
      <div id="networkLabFeedback"></div>
    </div>`;
  $('modal').style.display='grid';
  networkLabEvidence('alert',document.querySelector('.evidenceItem'));
}

const networkEvidenceData={
 alert:{title:'IDS ALERT',type:'DETECTION',html:`<div class="networkEvidenceCard"><div class="networkMetric critical"><span>SEVERITY</span><b>HIGH</b></div><div class="networkMetric"><span>SIGNATURE</span><b>Horizontal connection sweep</b></div><div class="networkMetric"><span>SOURCE</span><b>10.20.4.17</b></div><div class="networkMetric"><span>WINDOW</span><b>14:02:11–14:02:29 UTC</b></div></div>`,clue:'The sensor detected many connection attempts from one internal workstation in a short window.'},
 ports:{title:'PORT ACTIVITY',type:'TRAFFIC',html:`<div class="portMatrix"><div><span>DESTINATION</span><b>10.20.8.21</b><em>22 / CLOSED</em></div><div><span>DESTINATION</span><b>10.20.8.22</b><em>80 / CLOSED</em></div><div><span>DESTINATION</span><b>10.20.8.23</b><em>443 / CLOSED</em></div><div><span>DESTINATION</span><b>10.20.8.24</b><em>3389 / OPEN</em></div><div><span>DESTINATION</span><b>10.20.8.25</b><em>445 / CLOSED</em></div></div>`,clue:'The same source tests multiple hosts and ports, with one reachable service.'},
 dns:{title:'DNS LOG',type:'NAME RESOLUTION',html:`<div class="networkEvidenceCard"><div class="networkMetric"><span>CLIENT</span><b>10.20.4.17</b></div><div class="networkMetric"><span>QUERY</span><b>fileserver.training.internal</b></div><div class="networkMetric"><span>RESULT</span><b>10.20.8.24</b></div><div class="networkMetric"><span>RATE</span><b>1 QUERY • NORMAL</b></div><p class="networkMuted">No suspicious external domain resolution appears in this case.</p></div>`,clue:'DNS is normal, making a name-resolution failure less likely than a network discovery event.'},
 flows:{title:'FLOW DATA',type:'NETFLOW',html:`<div class="flowTable"><div><span>14:02:11</span><b>10.20.4.17 → 10.20.8.21:22</b><em>REJECT</em></div><div><span>14:02:15</span><b>10.20.4.17 → 10.20.8.22:80</b><em>REJECT</em></div><div><span>14:02:19</span><b>10.20.4.17 → 10.20.8.23:443</b><em>REJECT</em></div><div><span>14:02:24</span><b>10.20.4.17 → 10.20.8.24:3389</b><em>ACCEPT</em></div><div><span>14:02:29</span><b>10.20.4.17 → 10.20.8.25:445</b><em>REJECT</em></div></div>`,clue:'Sequential attempts across multiple hosts and ports form a clear horizontal scan pattern.'},
 firewall:{title:'FIREWALL DECISION',type:'CONTROL',html:`<div class="networkEvidenceCard"><div class="networkMetric"><span>RULE</span><b>INTERNAL EAST-WEST TRAFFIC</b></div><div class="networkMetric"><span>DEFAULT</span><b>ALLOW WITH INSPECTION</b></div><div class="networkMetric"><span>ANOMALY ACTION</span><b>ALERT • NO AUTO-BLOCK</b></div><div class="redFlag">⚠ The source host remains online. A defensive response should limit further reconnaissance without destroying investigation evidence.</div></div>`,clue:'The network control has alerted but has not automatically contained the source workstation.'},
 timeline:{title:'CORRELATED TIMELINE',type:'CORRELATION',html:`<div class="incidentTimeline networkTimeline"><div><b>14:02:11</b><span>First connection attempt from 10.20.4.17</span></div><div><b>14:02:15</b><span>Second destination probed</span></div><div><b>14:02:19</b><span>Third destination probed</span></div><div><b>14:02:24</b><span>RDP service responds on 10.20.8.24</span></div><div><b>14:02:29</b><span>Additional SMB probe observed</span></div></div>`,clue:'The sequence is broad, fast and sequential — consistent with reconnaissance across the internal network.'}
};

function networkLabEvidence(key,button){
  const d=networkEvidenceData[key];
  if(!d)return;
  networkEvidenceReviewed.add(key);
  document.querySelectorAll('.evidenceItem').forEach(x=>x.classList.remove('active'));
  if(button)button.classList.add('active');
  $('networkEvidenceView').innerHTML=`<div class="evidenceViewHead"><span class="kicker">${d.type}</span><h3>${d.title}</h3></div>${d.html}<div class="analystNote">ANALYST CLUE <span>✓ ${d.clue}</span></div>`;
  $('networkEvidenceCount').textContent=`${networkEvidenceReviewed.size}/6 evidence items reviewed`;
  $('networkLabProgress').style.width=(15+(networkEvidenceReviewed.size/6)*45)+'%';
  $('networkLabHint').textContent=networkEvidenceReviewed.size===6?'Traffic correlated. Identify the attack pattern.':'Review the remaining evidence before deciding.';
}

async function networkAttackDecision(choice,b){
  document.querySelectorAll('.networkChoices .choice').forEach(x=>x.disabled=true);
  if(networkEvidenceReviewed.size!==6){
    b.classList.add('wrong');
    $('networkLabFeedback').innerHTML=`<div class="feedback wrongFeedback">⚠ Identification is premature. Review all six network evidence items first.</div>`;
    setTimeout(()=>document.querySelectorAll('.networkChoices .choice').forEach(x=>x.disabled=false),650);
    return;
  }
  if(choice==='portscan'){
    b.classList.add('correct');
    networkStage=1;
    $('networkLabProgress').style.width='72%';
    $('networkLabFeedback').innerHTML=`<div class="feedback correctFeedback">✓ Correct. The sequential probes across multiple internal hosts and ports indicate network reconnaissance / port scanning.</div>
      <div class="networkContainment"><span class="kicker">DEFENSIVE RESPONSE</span><h3>What is the safest first action?</h3>
      <div class="containChoices networkContainChoices">
        <button class="choice" onclick="networkContainment('isolate',this)">ISOLATE SOURCE HOST + PRESERVE TRAFFIC EVIDENCE</button>
        <button class="choice" onclick="networkContainment('flush',this)">FLUSH ALL FIREWALL RULES</button>
        <button class="choice" onclick="networkContainment('shutdown',this)">SHUT DOWN THE ENTIRE NETWORK</button>
      </div><div id="networkContainFeedback"></div></div>`;
  }else{
    b.classList.add('wrong');
    $('networkLabFeedback').innerHTML=`<div class="feedback wrongFeedback">✕ Reassess the sequence. The evidence shows many short-lived probes across multiple internal destinations, not normal DNS behavior or a periodic beacon.</div>`;
    setTimeout(()=>document.querySelectorAll('.networkChoices .choice').forEach(x=>x.disabled=false),650);
  }
}

async function networkContainment(choice,b){
  document.querySelectorAll('.networkContainChoices .choice').forEach(x=>x.disabled=true);
  if(choice==='isolate'){
    b.classList.add('correct');
    networkStage=2;
    $('networkLabProgress').style.width='100%';
    $('networkContainFeedback').innerHTML=`<div class="feedback correctFeedback">✓ Defensible response. Isolate the source workstation and preserve the network evidence for follow-up analysis.</div>`;
    setTimeout(()=>completeNetworkLab(),650);
  }else{
    b.classList.add('wrong');
    $('networkContainFeedback').innerHTML=`<div class="feedback wrongFeedback">✕ That response is unnecessarily destructive or too broad. Contain the source host while preserving evidence.</div>`;
    setTimeout(()=>document.querySelectorAll('.networkContainChoices .choice').forEach(x=>x.disabled=false),650);
  }
}

async function completeNetworkLab(){
  const score=Math.min(1000,730+networkEvidenceReviewed.size*45);
  $('networkLabProgress').style.width='100%';
  $('networkLabFeedback').insertAdjacentHTML('beforeend',`<div class="labResult"><div class="resultIcon">✓</div><div><span class="kicker">NETWORK CONTAINED</span><h3>INVESTIGATION COMPLETE</h3><p>You correlated ${networkEvidenceReviewed.size}/6 evidence items, identified the reconnaissance pattern and selected a targeted containment response.</p><b>NETWORK ANALYSIS SCORE ${score}/1000</b></div><div class="resultXP">+120 XP</div></div>`);
  await gain(120,'advanced-network-attack-investigation');
  $('networkLabHint').textContent='Case complete • XP saved to your academy progress.';
  render();
}

// Extend the advanced lab launcher for Lab 04 without replacing earlier labs.
const _advancedLabWithNetwork=advancedLab;
advancedLab=function(type){
  if(type==='network') return openNetworkLab();
  return _advancedLabWithNetwork(type);
};


// ============================================================
// PHASE 2.6 // DIGITAL FORENSICS CASE
// Safe, fictional evidence only. No real files or systems are touched.
// ============================================================
let forensicsEvidenceReviewed=new Set();
let forensicsStage=0;

function openForensicsLab(){
  forensicsEvidenceReviewed=new Set();
  forensicsStage=0;
  const c=$('modalBody');
  c.innerHTML=`
    <div class="labModalHead">
      <div><span class="kicker">PHASE 2 // ADVANCED LAB 05</span><h2>DIGITAL FORENSICS CASE</h2>
      <p class="simIntro">A fictional workstation was flagged after suspicious activity. Reconstruct the incident from simulated forensic artifacts, establish the timeline, and identify the evidence that supports your conclusion.</p></div>
      <div class="caseBadge">CASE DF-2047<br><small>ACTIVE</small></div>
    </div>
    <div class="labProgress"><span id="forensicsLabProgress" style="width:14%"></span></div>
    <div class="investigationGrid">
      <aside class="evidencePanel">
        <div class="panelTitle"><span>CASE FILE</span><b>7 EVIDENCE ITEMS</b></div>
        <button class="evidenceItem active" onclick="forensicsEvidence('alert',this)"><b>01</b><span>CASE ALERT</span><i>›</i></button>
        <button class="evidenceItem" onclick="forensicsEvidence('timeline',this)"><b>02</b><span>EVENT TIMELINE</span><i>›</i></button>
        <button class="evidenceItem" onclick="forensicsEvidence('auth',this)"><b>03</b><span>AUTH LOG</span><i>›</i></button>
        <button class="evidenceItem" onclick="forensicsEvidence('browser',this)"><b>04</b><span>BROWSER ARTIFACT</span><i>›</i></button>
        <button class="evidenceItem" onclick="forensicsEvidence('process',this)"><b>05</b><span>PROCESS ARTIFACT</span><i>›</i></button>
        <button class="evidenceItem" onclick="forensicsEvidence('persistence',this)"><b>06</b><span>PERSISTENCE CLUE</span><i>›</i></button>
        <button class="evidenceItem" onclick="forensicsEvidence('network',this)"><b>07</b><span>NETWORK ARTIFACT</span><i>›</i></button>
      </aside>
      <div class="evidenceWorkspace">
        <div id="forensicsEvidenceView" class="evidenceView"></div>
        <div class="evidenceCounter"><span id="forensicsEvidenceCount">0/7 evidence items reviewed</span><span id="forensicsLabHint">Review every artifact before writing your conclusion.</span></div>
        <div id="forensicsLabFeedback"></div>
      </div>
    </div>`;
  $('modal').style.display='grid';
  forensicsEvidence('alert',document.querySelector('.evidencePanel .evidenceItem'));
}

function forensicsEvidence(type,b){
  if(b){document.querySelectorAll('.evidencePanel .evidenceItem').forEach(x=>x.classList.remove('active'));b.classList.add('active');}
  forensicsEvidenceReviewed.add(type);
  const views={
    alert:`<div class="networkEvidence"><span class="kicker">CASE ALERT</span><h3>WORKSTATION ANOMALY DETECTED</h3><div class="socMetric"><span>HOST</span><b>ENG-LT-07</b></div><div class="socMetric"><span>USER</span><b>analyst01</b></div><div class="socMetric"><span>FIRST ALERT</span><b>09:14:22</b></div><div class="socMetric critical"><span>SEVERITY</span><b>HIGH</b></div><div class="analystNote">Start with the timeline. Your goal is to determine what happened, not simply what was detected.</div></div>`,
    timeline:`<div class="logTable"><div><span>09:07:11</span><b>browser.exe</b><em>Opened shortened URL</em></div><div><span>09:08:03</span><b>powershell.exe</b><em>Started by browser child process</em></div><div><span>09:08:19</span><b>script-host</b><em>Executed encoded command</em></div><div><span>09:09:02</span><b>reg.exe</b><em>Modified user startup entry</em></div><div><span>09:14:22</span><b>EDR</b><em>Persistence behavior alerted</em></div></div><div class="analystNote">The sequence matters: browser activity precedes script execution and a startup modification.</div>`,
    auth:`<div class="networkEvidence"><span class="kicker">AUTHENTICATION ARTIFACT</span><h3>ACCOUNT ACTIVITY</h3><div class="socMetric"><span>08:56:44</span><b>Local interactive logon — analyst01</b></div><div class="socMetric"><span>09:06:51</span><b>Browser session — analyst01</b></div><div class="socMetric"><span>09:17:05</span><b>Remote logon — NOT OBSERVED</b></div><div class="socMetric"><span>PRIVILEGE</span><b>STANDARD USER</b></div><div class="analystNote">No evidence suggests a separate remote account was used during the incident window.</div></div>`,
    browser:`<div class="networkEvidence"><span class="kicker">BROWSER ARTIFACT</span><h3>VISITED RESOURCE</h3><div class="socMetric"><span>09:07:11</span><b>https://training-example.invalid/update</b></div><div class="socMetric"><span>REFERRER</span><b>EMAIL LINK</b></div><div class="socMetric"><span>DOWNLOAD</span><b>update-check.js</b></div><div class="analystNote">This is a fictional training domain. The artifact establishes the likely initial access vector.</div></div>`,
    process:`<div class="processTree"><div><b>browser.exe</b><span> user session</span></div><div>↓</div><div><b>powershell.exe</b><span> suspicious encoded command</span></div><div>↓</div><div><b>script-host</b><span> created startup modification</span></div></div>`,
    persistence:`<div class="networkEvidence"><span class="kicker">PERSISTENCE ARTIFACT</span><h3>STARTUP ENTRY</h3><div class="socMetric"><span>LOCATION</span><b>SIMULATED USER STARTUP KEY</b></div><div class="socMetric"><span>VALUE</span><b>script-host --profile</b></div><div class="socMetric critical"><span>ASSESSMENT</span><b>UNEXPECTED PERSISTENCE</b></div><div class="analystNote">The artifact shows an attempt to run a suspicious process automatically at user sign-in.</div></div>`,
    network:`<div class="networkEvidence"><span class="kicker">NETWORK ARTIFACT</span><h3>OUTBOUND CONNECTION</h3><div class="socMetric"><span>09:08:21</span><b>ENG-LT-07 → 192.0.2.44:443</b></div><div class="socMetric"><span>TRAFFIC</span><b>SMALL PERIODIC HTTPS REQUESTS</b></div><div class="socMetric"><span>DESTINATION</span><b>DOCUMENTATION ADDRESS</b></div><div class="analystNote">The address is reserved for documentation. In this fictional case, the pattern is a simulated command-and-control clue.</div></div>`
  };
  $('forensicsEvidenceView').innerHTML=views[type];
  $('forensicsEvidenceCount').textContent=`${forensicsEvidenceReviewed.size}/7 evidence items reviewed`;
  $('forensicsLabProgress').style.width=`${Math.max(14,Math.round(forensicsEvidenceReviewed.size/7*58))}%`;
  if(forensicsEvidenceReviewed.size===7) showForensicsDecision();
}

function showForensicsDecision(){
  if($('forensicsDecisionBlock')) return;
  $('forensicsLabFeedback').innerHTML=`<div id="forensicsDecisionBlock" class="labDecisionBlock"><span class="kicker">FINAL ANALYSIS</span><h3>What is the best-supported conclusion?</h3><div class="labDecisionChoices"><button class="choice" onclick="forensicsDecision('malicious',this)">MALICIOUS EXECUTION WITH PERSISTENCE</button><button class="choice" onclick="forensicsDecision('benign',this)">NORMAL SOFTWARE UPDATE</button><button class="choice" onclick="forensicsDecision('hardware',this)">HARDWARE FAILURE</button></div><div id="forensicsDecisionFeedback"></div></div>`;
  $('forensicsLabHint').textContent='All evidence reviewed. Build the most defensible conclusion.';
  $('forensicsLabProgress').style.width='72%';
}

function forensicsDecision(choice,b){
  document.querySelectorAll('#forensicsDecisionBlock .choice').forEach(x=>x.disabled=true);
  if(choice==='malicious'){
    b.classList.add('correct');
    $('forensicsDecisionFeedback').innerHTML=`<div class="feedback correctFeedback">✓ Correct. The evidence supports a browser-led execution chain followed by persistence and simulated outbound beaconing.</div><div class="labDecisionBlock"><span class="kicker">EVIDENCE PRESERVATION</span><h3>What should the analyst do next?</h3><div class="labDecisionChoices"><button class="choice" onclick="forensicsContainment('preserve',this)">PRESERVE THE IMAGE + TIMELINE AND ESCALATE</button><button class="choice" onclick="forensicsContainment('delete',this)">DELETE THE ARTIFACTS IMMEDIATELY</button><button class="choice" onclick="forensicsContainment('reconnect',this)">RECONNECT THE HOST TO NORMAL TRAFFIC</button></div><div id="forensicsContainFeedback"></div></div>`;
  }else{
    b.classList.add('wrong');
    $('forensicsDecisionFeedback').innerHTML=`<div class="feedback wrongFeedback">✕ Reassess the evidence. The sequence includes script execution, persistence, and a simulated periodic outbound connection.</div>`;
    setTimeout(()=>document.querySelectorAll('#forensicsDecisionBlock .choice').forEach(x=>x.disabled=false),650);
  }
}

async function forensicsContainment(choice,b){
  document.querySelectorAll('#forensicsDecisionBlock .choice').forEach(x=>x.disabled=true);
  if(choice==='preserve'){
    b.classList.add('correct');
    forensicsStage=2;
    $('forensicsLabProgress').style.width='100%';
    $('forensicsContainFeedback').innerHTML=`<div class="feedback correctFeedback">✓ Correct forensic practice. Preserve the evidence and timeline, document findings, and escalate for response.</div>`;
    setTimeout(()=>completeForensicsLab(),650);
  }else{
    b.classList.add('wrong');
    $('forensicsContainFeedback').innerHTML=`<div class="feedback wrongFeedback">✕ That could destroy evidence or increase risk. Preserve the artifacts and timeline before remediation.</div>`;
    setTimeout(()=>document.querySelectorAll('#forensicsDecisionBlock .choice').forEach(x=>x.disabled=false),650);
  }
}

async function completeForensicsLab(){
  const score=Math.min(1000,760+forensicsEvidenceReviewed.size*34);
  $('forensicsLabFeedback').insertAdjacentHTML('beforeend',`<div class="labResult"><div class="resultIcon">✓</div><div><span class="kicker">CASE RECONSTRUCTED</span><h3>INVESTIGATION COMPLETE</h3><p>You reconstructed the browser-to-script sequence, identified persistence, and preserved the simulated evidence.</p><b>FORENSIC ANALYSIS SCORE ${score}/1000</b></div><div class="resultXP">+150 XP</div></div>`);
  await gain(150,'advanced-digital-forensics-case');
  $('forensicsLabHint').textContent='Case complete • XP saved to your academy progress.';
  render();
}

// Extend the advanced lab launcher for Lab 05 without replacing earlier labs.
const _advancedLabWithForensics=advancedLab;
advancedLab=function(type){
  if(type==='forensics') return openForensicsLab();
  return _advancedLabWithForensics(type);
};


// ============================================================
// PHASE 2.7 // WEB SECURITY LAB
// Safe, fictional application-security training environment.
// ============================================================
let webEvidenceReviewed=new Set();
let webStage=0;

function openWebSecurityLab(){
  webEvidenceReviewed=new Set();
  webStage=0;
  const c=$('modalBody');
  c.innerHTML=`
    <div class="labModalHead">
      <div><span class="kicker">PHASE 2 // ADVANCED LAB 06</span><h2>WEB SECURITY LAB</h2>
      <p class="simIntro">You are reviewing a fictional student portal after unusual application activity. Inspect the evidence, identify the weaknesses, then select the safest remediation sequence.</p></div>
      <div class="caseBadge">CASE WEB-3014<br><small>ACTIVE</small></div>
    </div>
    <div class="labProgress"><span id="webLabProgress" style="width:14%"></span></div>
    <div class="investigationGrid">
      <aside class="evidencePanel">
        <div class="panelTitle"><span>APPLICATION CASE FILE</span><b>6 EVIDENCE ITEMS</b></div>
        <button class="evidenceItem active" onclick="webSecurityEvidence('alert',this)"><b>01</b><span>ALERT</span><i>›</i></button>
        <button class="evidenceItem" onclick="webSecurityEvidence('request',this)"><b>02</b><span>REQUEST TRACE</span><i>›</i></button>
        <button class="evidenceItem" onclick="webSecurityEvidence('auth',this)"><b>03</b><span>AUTH SESSION</span><i>›</i></button>
        <button class="evidenceItem" onclick="webSecurityEvidence('access',this)"><b>04</b><span>ACCESS CONTROL</span><i>›</i></button>
        <button class="evidenceItem" onclick="webSecurityEvidence('input',this)"><b>05</b><span>INPUT VALIDATION</span><i>›</i></button>
        <button class="evidenceItem" onclick="webSecurityEvidence('logs',this)"><b>06</b><span>APP LOGS</span><i>›</i></button>
      </aside>
      <div class="evidenceWorkspace">
        <div id="webEvidenceView" class="evidenceView"></div>
        <div class="evidenceCounter"><span id="webEvidenceCount">0/6 evidence items reviewed</span><span id="webLabHint">Review every artifact before selecting a remediation.</span></div>
      </div>
    </div>
    <div class="labDecisionBlock">
      <div><span class="kicker">VULNERABILITY ASSESSMENT</span><h3>What is the best-supported primary finding?</h3></div>
      <div class="labDecisionChoices webChoices">
        <button class="choice" onclick="webSecurityDecision('cosmetic',this)">COSMETIC UI ISSUE</button>
        <button class="choice" onclick="webSecurityDecision('access',this)">ACCESS CONTROL + INPUT VALIDATION WEAKNESS</button>
        <button class="choice" onclick="webSecurityDecision('hardware',this)">HARDWARE FAILURE</button>
      </div>
      <div id="webLabFeedback"></div>
    </div>`;
  $('modal').style.display='grid';
  webSecurityEvidence('alert',document.querySelector('.evidenceItem'));
}

const webSecurityEvidenceData={
 alert:{title:'APPLICATION ALERT',type:'DETECTION',html:`<div class="webEvidenceCard"><div class="webMetric critical"><span>SEVERITY</span><b>HIGH</b></div><div class="webMetric"><span>RULE</span><b>Unexpected account access + invalid object requests</b></div><div class="webMetric"><span>APP</span><b>STUDENT PORTAL // SIMULATED</b></div><div class="webMetric"><span>TIME WINDOW</span><b>14:22:10–14:24:41 UTC</b></div></div>`,clue:'The alert combines identity and object-access anomalies in one application session.'},
 request:{title:'REQUEST TRACE',type:'HTTP TELEMETRY',html:`<div class="webEvidenceCard"><div class="webMetric"><span>METHOD</span><b>GET</b></div><div class="webMetric"><span>ROUTE</span><b>/api/profile?id=student-104</b></div><div class="webMetric"><span>RESPONSE</span><b class="warningText">200 • UNEXPECTED OBJECT</b></div><div class="webMetric"><span>NOTE</span><b>SIMULATED TRACE</b></div><div class="redFlag">⚠ The fictional endpoint returns another student's profile when the object identifier is changed.</div></div>`,clue:'The application should verify authorization for the requested object, not rely only on a client-supplied identifier.'},
 auth:{title:'AUTH SESSION',type:'SESSION SECURITY',html:`<div class="webEvidenceCard"><div class="webMetric"><span>SESSION</span><b>WEB-7F31</b></div><div class="webMetric"><span>USER</span><b>student01</b></div><div class="webMetric"><span>STATUS</span><b>AUTHENTICATED</b></div><div class="webMetric"><span>COOKIE</span><b>SIMULATED • SECURE</b></div><div class="analystNote">The session itself is valid. The weakness is what the application permits the authenticated user to access.</div></div>`,clue:'A valid login does not grant access to every object. Authorization must be checked server-side.'},
 access:{title:'ACCESS CONTROL',type:'AUTHORIZATION',html:`<div class="webEvidenceCard"><div class="accessMatrix"><div><span>student01</span><b>OWN PROFILE</b><em>ALLOW</em></div><div class="badRow"><span>student01</span><b>student-104 PROFILE</b><em>ALLOW ⚠</em></div><div><span>student01</span><b>ADMIN SETTINGS</b><em>DENY</em></div></div><p class="webMuted">The fictional application correctly blocks an admin-only route but fails to enforce ownership on one profile object.</p></div>`,clue:'Authorization is partially enforced; object ownership must be checked on every protected request.'},
 input:{title:'INPUT VALIDATION',type:'APPLICATION INPUT',html:`<div class="webEvidenceCard"><div class="inputFlow"><div>USER INPUT <b>profileId</b></div><span>↓</span><div class="badRow">DIRECT OBJECT LOOKUP <b>NO SERVER-SIDE OWNERSHIP CHECK</b></div><span>↓</span><div>PROFILE RESPONSE</div></div><div class="redFlag">⚠ Treat identifiers as untrusted input. Validate format and authorization on the server before returning data.</div></div>`,clue:'Input validation and authorization belong on the server and should be enforced before sensitive data is returned.'},
 logs:{title:'APPLICATION LOGS',type:'CORRELATION',html:`<div class="webLogTable"><div><span>14:22:10</span><b>LOGIN</b><em>student01</em></div><div><span>14:23:04</span><b>GET /api/profile?id=student-104</b><em>200</em></div><div><span>14:23:16</span><b>GET /api/profile?id=student-104</b><em>200</em></div><div><span>14:24:41</span><b>ALERT CORRELATED</b><em>REVIEW</em></div></div>`,clue:'Repeated cross-object requests after a valid login provide the strongest correlation for the access-control finding.'}
};

function webSecurityEvidence(key,button){
  const d=webSecurityEvidenceData[key];
  if(!d)return;
  webEvidenceReviewed.add(key);
  document.querySelectorAll('.evidencePanel .evidenceItem').forEach(x=>x.classList.remove('active'));
  if(button)button.classList.add('active');
  $('webEvidenceView').innerHTML=`<div class="evidenceViewHead"><span class="kicker">${d.type}</span><h3>${d.title}</h3></div>${d.html}<div class="analystNote">ANALYST CLUE <span>✓ ${d.clue}</span></div>`;
  $('webEvidenceCount').textContent=`${webEvidenceReviewed.size}/6 evidence items reviewed`;
  $('webLabProgress').style.width=(14+(webEvidenceReviewed.size/6)*52)+'%';
  $('webLabHint').textContent=webEvidenceReviewed.size===6?'Evidence correlated. Select the primary finding.':'Review the remaining evidence before deciding.';
}

function webSecurityDecision(choice,b){
  document.querySelectorAll('.webChoices .choice').forEach(x=>x.disabled=true);
  const complete=webEvidenceReviewed.size===6;
  const correct=choice==='access';
  if(correct)b.classList.add('correct'); else b.classList.add('wrong');
  if(!complete){
    $('webLabFeedback').innerHTML=`<div class="feedback wrongFeedback">⚠ Assessment is premature. Review all six evidence items before recording the finding.</div>`;
    setTimeout(()=>document.querySelectorAll('.webChoices .choice').forEach(x=>x.disabled=false),650);
    return;
  }
  if(correct){
    $('webLabFeedback').innerHTML=`<div class="feedback correctFeedback">✓ Correct. The evidence supports an object-level authorization weakness combined with insufficient server-side input validation.</div><div class="webRemediation"><span class="kicker">REMEDIATION</span><h3>What should the development team implement?</h3><div class="webRemediationChoices"><button class="choice" onclick="webSecurityRemediation('server',this)">ENFORCE SERVER-SIDE AUTHORIZATION + INPUT VALIDATION</button><button class="choice" onclick="webSecurityRemediation('client',this)">HIDE THE ID FIELD IN THE UI</button><button class="choice" onclick="webSecurityRemediation('disable',this)">DISABLE ALL USER PROFILES</button></div><div id="webRemediationFeedback"></div></div>`;
    $('webLabProgress').style.width='82%';
  }else{
    $('webLabFeedback').innerHTML=`<div class="feedback wrongFeedback">✕ Reassess the evidence. The application is authenticating the user but not consistently authorizing access to the requested object.</div>`;
    setTimeout(()=>document.querySelectorAll('.webChoices .choice').forEach(x=>x.disabled=false),650);
  }
}

async function webSecurityRemediation(choice,b){
  document.querySelectorAll('.webRemediationChoices .choice').forEach(x=>x.disabled=true);
  if(choice==='server'){
    b.classList.add('correct');
    $('webLabProgress').style.width='100%';
    $('webRemediationFeedback').innerHTML=`<div class="feedback correctFeedback">✓ Correct remediation. Validate untrusted input and enforce object ownership on the server before returning sensitive data.</div>`;
    setTimeout(()=>completeWebSecurityLab(),650);
  }else{
    b.classList.add('wrong');
    $('webRemediationFeedback').innerHTML=`<div class="feedback wrongFeedback">✕ This does not address the server-side authorization weakness. Client-side hiding or disabling the feature is not sufficient.</div>`;
    setTimeout(()=>document.querySelectorAll('.webRemediationChoices .choice').forEach(x=>x.disabled=false),650);
  }
}

async function completeWebSecurityLab(){
  const score=Math.min(1000,760+webEvidenceReviewed.size*40);
  $('webLabFeedback').insertAdjacentHTML('beforeend',`<div class="labResult"><div class="resultIcon">✓</div><div><span class="kicker">APPLICATION SECURED</span><h3>WEB SECURITY LAB COMPLETE</h3><p>You correlated the simulated request trail, identified the authorization weakness, and selected a server-side remediation.</p><b>SECURITY ANALYSIS SCORE ${score}/1000</b></div><div class="resultXP">+130 XP</div></div>`);
  await gain(130,'advanced-web-security-lab');
  $('webLabHint').textContent='Lab complete • XP saved to your academy progress.';
  render();
}

const _advancedLabWithWeb=_advancedLabWithForensics;
advancedLab=function(type){
  if(type==='web') return openWebSecurityLab();
  return _advancedLabWithWeb(type);
};
