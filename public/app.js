let user=null,state=null,mode='login',today=new Date().toISOString().slice(0,10);
const $=id=>document.getElementById(id);
const viewMeta={dashboard:['Dashboard','Your command center for learning, practice and cyber defense.'],city:['Cyber City','Unlock districts, build mastery and progress through the cybersecurity journey.'],courses:['Courses','Structured cybersecurity domains from foundations to advanced concepts.'],sessions:['Cyber Sessions','Classroom-style sessions with visuals, real-world threats and defender checks.'],labs:['Cyber Labs','Practice security decisions through safe, interactive simulations.'],challenges:['Challenges','Complete missions and knowledge checks to earn XP and build consistency.'],achievements:['Achievements','Turn learning milestones into visible cybersecurity accomplishments.'],leaderboard:['Leaderboard','See how your cyber learning progress compares with the academy community.'],profile:['My Cyber Profile','Your identity, XP, streak, mastery and academy credentials.'],certificate:['Certificate','Your CYBER//QUEST academy credential and completion progress.'],settings:['Settings','Manage your learning environment and security preferences.']};
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
function render(){let r=['CYBER ROOKIE','SECURITY CADET','THREAT HUNTER','CYBER DEFENDER','SECURITY SPECIALIST','CYBER GUARDIAN'][Math.min(Math.floor(state.xp/200),5)];$('xp').textContent=state.xp;$('xpTop').textContent=state.xp;$('streak').textContent=state.streak;$('rank').textContent=r;$('today').textContent=new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});$('mtype').textContent=m[0];$('mtitle').textContent=m[1];$('mdesc').textContent=m[2];$('factTitle').textContent=f[0];$('fact').textContent=f[1];$('quizQ').textContent=q[0];$('quizChoices').innerHTML=q[1].map((x,i)=>`<button class="choice" onclick="answerQuiz(${i},this)">${x}</button>`).join('');renderProgression();renderZones();renderSessions();renderBoard();renderBadges();renderCertificate()}
$('startM').onclick=()=>{$('mchallenge').style.display='block';$('mq').textContent=m[3];$('mc').innerHTML=m[4].map((x,i)=>`<button class="choice" onclick="answerM(${i},this)">${x}</button>`).join('');$('mchallenge').scrollIntoView({behavior:'smooth',block:'center'})};
async function answerM(i,b){document.querySelectorAll('#mc .choice').forEach(x=>x.disabled=true);if(i===m[5]){b.classList.add('correct');$('mf').innerHTML='<div class="feedback">✓ Mission complete • +50 XP</div>';await gain(50,'mission-'+today)}else{b.classList.add('wrong');$('mf').innerHTML='<div class="feedback">✕ Not the safest move. Look for verification before acting.</div>'}}
async function answerQuiz(i,b){document.querySelectorAll('#quizChoices .choice').forEach(x=>x.disabled=true);if(i===q[2]){b.classList.add('correct');$('quizF').innerHTML='<div class="feedback">✓ Correct • +20 XP</div>';await gain(20,'quiz-'+today)}else{b.classList.add('wrong');$('quizF').innerHTML='<div class="feedback">✕ Review the concept.</div>'}}
async function gain(x,key){let d=await api('/api/progress',{method:'POST',body:JSON.stringify({xp:x,key})});state=d.progress;render()}
function zoneCompleted(i){return state.completed.includes('lesson-'+i)}
function zoneUnlocked(i){return i===0||zoneCompleted(i-1)}
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
