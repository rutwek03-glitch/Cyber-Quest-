require('dotenv').config();
require('dotenv').config({ path: '.env.local' });
const express=require('express'),path=require('path'),bcrypt=require('bcryptjs'),session=require('express-session'),PgSession=require('connect-pg-simple')(session),{Pool}=require('pg');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const {
  issueSignedToken,
  presignUrl,
  head,
  get,
  del
} = require('@vercel/blob');

// =================================
// CYBER//QUEST GMAIL MAIL SERVICE
// =================================

let mailTransporter = null;

function getMailTransporter() {
  if (mailTransporter) return mailTransporter;

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = String(process.env.SMTP_PASS || '')
    .replace(/\s/g, '');

  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error('Gmail SMTP configuration is incomplete.');
  }

  mailTransporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    requireTLS: smtpPort === 587,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  return mailTransporter;
}

// =================================
// CYBER//QUEST MEETING EMAIL TEMPLATE
// =================================

function escapeEmailHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

async function sendMeetingInvitationEmail({
  to,
  name,
  title,
  description,
  scheduledAt,
  durationMinutes,
  meetingUrl
}) {
  const dateLabel = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'short'
  }).format(new Date(scheduledAt));

  const safeName = escapeEmailHtml(name);
  const safeTitle = escapeEmailHtml(title);
  const safeDescription = escapeEmailHtml(description);
  const safeUrl = escapeEmailHtml(meetingUrl);

  const text = `
Hello ${name},

You have received a meeting invitation from CYBER//QUEST Academy.

Meeting: ${title}
Description: ${description || 'No description provided.'}
Date and time: ${dateLabel}
Duration: ${durationMinutes} minutes

${meetingUrl ? `Meeting link: ${meetingUrl}` : 'The meeting link will be shared separately if required.'}

Please log in to CYBER//QUEST to accept or decline this invitation.

CYBER//QUEST Academy
  `.trim();

  const html = `
    <div style="font-family:Arial,sans-serif;background:#f1f5f9;padding:30px;">
      <div style="max-width:600px;margin:auto;background:#ffffff;
                  padding:30px;border-radius:12px;">

        <h2 style="color:#0f766e;">
          CYBER//QUEST Academy
        </h2>

        <p>Hello ${safeName},</p>

        <p>You have received a new cybersecurity academy meeting invitation.</p>

        <div style="background:#f0fdfa;padding:20px;border-radius:10px;">
          <h2>${safeTitle}</h2>
          <p>${safeDescription || 'No description provided.'}</p>

          <p><strong>Date and time:</strong> ${escapeEmailHtml(dateLabel)}</p>
          <p><strong>Duration:</strong> ${durationMinutes} minutes</p>
        </div>

        ${
          meetingUrl
            ? `<p><a href="${safeUrl}"
                 style="display:inline-block;background:#10b981;
                 color:#ffffff;padding:12px 20px;text-decoration:none;
                 border-radius:6px;">JOIN MEETING</a></p>`
            : ''
        }

        <p>Please log in to CYBER//QUEST to accept or decline this invitation.</p>

        <hr>

        <p style="color:#64748b;font-size:12px;">
          CYBER//QUEST Academy — Learn. Think. Defend.
        </p>
      </div>
    </div>
  `;

  return getMailTransporter().sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject: `Meeting Invitation: ${title}`,
    text,
    html
  });
}

const app=express(),pool=new Pool({connectionString:process.env.DATABASE_URL});
// Render runs behind a reverse proxy. Trust it so secure session cookies are set correctly.
app.set('trust proxy',1);
app.use(express.json());app.use(session({store:new PgSession({pool,createTableIfMissing:true}),secret:process.env.SESSION_SECRET||'dev-change-this',resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:604800000}}));app.use(express.static(path.join(__dirname,'public')));
const pub=r=>({id:r.id,name:r.name,email:r.email,xp:r.xp,streak:r.streak||1,completed:r.completed||[]});
async function init(){
  await pool.query(`CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,xp INT NOT NULL DEFAULT 0,streak INT NOT NULL DEFAULT 1,last_active DATE,completed JSONB NOT NULL DEFAULT '[]'::jsonb,created_at TIMESTAMPTZ DEFAULT NOW())`);
  await pool.query(`
  ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'student'
`);
await pool.query(`
  ALTER TABLE users
  ADD COLUMN IF NOT EXISTS account_status TEXT NOT NULL DEFAULT 'approved'
`);
  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS certificate_issued_at TIMESTAMPTZ');
  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS certificate_code TEXT UNIQUE');
  await pool.query(`CREATE TABLE IF NOT EXISTS xp_events(user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,event_key TEXT NOT NULL,amount INT NOT NULL,created_at TIMESTAMPTZ DEFAULT NOW(),PRIMARY KEY(user_id,event_key))`);
  // PROFESSOR VIDEO LIBRARY
await pool.query(`
  CREATE TABLE IF NOT EXISTS academy_videos (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'General',
    blob_pathname TEXT NOT NULL UNIQUE,
    file_name TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    content_type TEXT NOT NULL DEFAULT 'video/mp4',
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);
// TEMPORARY VIDEO UPLOAD TRACKING
await pool.query(`
  CREATE TABLE IF NOT EXISTS academy_video_uploads (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'General',
    blob_pathname TEXT NOT NULL UNIQUE,
    file_name TEXT NOT NULL,
    expected_size_bytes BIGINT NOT NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);
  let e=await pool.query('SELECT id FROM users WHERE email=$1',['student@cyberquest.demo']);
  if(!e.rowCount){let h=await bcrypt.hash('CyberQuest123',12);await pool.query('INSERT INTO users(name,email,password_hash,last_active) VALUES($1,$2,$3,CURRENT_DATE)',['Demo Student','student@cyberquest.demo',h])}
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const adminName = process.env.ADMIN_NAME?.trim();
const adminHash = process.env.ADMIN_PASSWORD_HASH;

if (adminEmail && adminName && adminHash) {
  const existingAdmin = await pool.query(
    'SELECT id, role FROM users WHERE email = $1',
    [adminEmail]
  );

  if (!existingAdmin.rowCount) {
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role, last_active)
       VALUES ($1, $2, $3, 'admin', CURRENT_DATE)`,
      [adminName, adminEmail, adminHash]
    );

    console.log('Professor admin account created.');
  } else if (existingAdmin.rows[0].role !== 'admin') {
    throw new Error('Configured admin email already belongs to a non-admin account.');
  }
}

// =================================
// CYBER//QUEST MEETING CENTER
// =================================

// Meetings created by the professor
await pool.query(`
  CREATE TABLE IF NOT EXISTS academy_meetings (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 60
      CHECK (duration_minutes BETWEEN 15 AND 480),
    meeting_url TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled'
      CHECK (status IN ('scheduled', 'cancelled', 'completed')),
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

// Student invitations and responses
await pool.query(`
  CREATE TABLE IF NOT EXISTS academy_meeting_invites (
    id BIGSERIAL PRIMARY KEY,
    meeting_id BIGINT NOT NULL
      REFERENCES academy_meetings(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL
      REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'accepted', 'declined')),
    email_status TEXT NOT NULL DEFAULT 'pending'
      CHECK (email_status IN ('pending', 'sent', 'failed')),
    invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    responded_at TIMESTAMPTZ,
    UNIQUE (meeting_id, user_id)
  )
`);

// In-app notifications
await pool.query(`
  CREATE TABLE IF NOT EXISTS academy_notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL
      REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'meeting_invitation',
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    meeting_id BIGINT
      REFERENCES academy_meetings(id) ON DELETE SET NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);

// Indexes for faster meeting and notification queries
await pool.query(`
  CREATE INDEX IF NOT EXISTS idx_academy_meetings_date
  ON academy_meetings(scheduled_at)
`);

await pool.query(`
  CREATE INDEX IF NOT EXISTS idx_meeting_invites_user
  ON academy_meeting_invites(user_id, status)
`);

await pool.query(`
  CREATE INDEX IF NOT EXISTS idx_academy_notifications_user
  ON academy_notifications(user_id, is_read, created_at DESC)
`);

}
async function auth(req, res, next) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not signed in' });
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [req.session.userId]
    );

    if (!result.rowCount) {
      return res.status(401).json({ error: 'Session expired' });
    }

    req.user = result.rows[0];

    // Admin accounts are handled by adminOnly middleware.
    if (
      req.user.role === 'student' &&
      req.user.account_status !== 'approved'
    ) {
      const message = req.user.account_status === 'pending'
        ? 'Your account is awaiting professor approval.'
        : 'Your account is suspended. Please contact the professor.';

      req.session.destroy(() => {});
      return res.status(403).json({ error: message });
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      error: 'Authentication failed.'
    });
  }
}
function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied. Professor privileges required.'
    });
  }

  next();
}
function studentOnly(req, res, next) {
  if (
    !req.user ||
    req.user.role !== 'student' ||
    req.user.account_status !== 'approved'
  ) {
    return res.status(403).json({
      error: 'Approved student access required.'
    });
  }

  next();
}
app.post('/api/register', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (name.length < 2) {
      return res.status(400).json({ error: 'Enter your name.' });
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return res.status(400).json({ error: 'Enter a valid email.' });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters.'
      });
    }

    const hash = await bcrypt.hash(password, 12);

    await pool.query(
      `INSERT INTO users
       (name, email, password_hash, last_active, role, account_status)
       VALUES ($1, $2, $3, CURRENT_DATE, 'student', 'pending')`,
      [name, email, hash]
    );

    return res.status(201).json({
      pendingApproval: true,
      message: 'Registration submitted! Your account is waiting for professor approval.'
    });

  } catch (error) {
    return res.status(error.code === '23505' ? 409 : 500).json({
      error: error.code === '23505'
        ? 'An account with that email already exists.'
        : 'Could not create account.'
    });
  }
});
app.post('/api/admin/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (email !== String(process.env.ADMIN_EMAIL || '').trim().toLowerCase()) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND role = 'admin'",
      [email]
    );

    if (!result.rowCount || !(await bcrypt.compare(password, result.rows[0].password_hash))) {
      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    req.session.userId = result.rows[0].id;

    res.json({
      success: true,
      message: 'Professor login successful.',
      role: 'admin',
      name: result.rows[0].name
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Admin login failed.' });
  }
});
app.post('/api/login',async(req,res)=>{try{let email=String(req.body.email||'').trim().toLowerCase(),password=String(req.body.password||''),r=await pool.query('SELECT * FROM users WHERE email=$1',[email]);if(!r.rowCount||!(await bcrypt.compare(password,r.rows[0].password_hash)))return res.status(401).json({error:'Incorrect email or password.'});let u=r.rows[0],today=new Date(),last=u.last_active?new Date(u.last_active):null;if (u.account_status !== 'approved') {
  const message = u.account_status === 'pending'
    ? 'Your account is awaiting professor approval.'
    : 'Your account is suspended. Please contact the professor.';

  return res.status(403).json({ error: message });
}if(last){let d=Math.floor((Date.UTC(today.getFullYear(),today.getMonth(),today.getDate())-Date.UTC(last.getFullYear(),last.getMonth(),last.getDate()))/86400000);u.streak=d===1?u.streak+1:d>1?1:u.streak}else u.streak=1;await pool.query('UPDATE users SET streak=$1,last_active=CURRENT_DATE WHERE id=$2',[u.streak,u.id]);req.session.userId=u.id;res.json({user:pub(u),progress:pub(u)})}catch(e){res.status(500).json({error:'Login failed.'})}});
app.post('/api/logout',(req,res)=>req.session.destroy(()=>res.json({ok:true})));
app.get('/api/admin/me', auth, adminOnly, (req, res) => {
  res.json({
    success: true,
    role: 'admin',
    name: req.user.name,
    email: req.user.email
  });
});app.get('/api/me', auth, (req, res) => {
  try {
    // Only student accounts can access the student dashboard.
    if (req.user.role !== 'student') {
      return res.status(403).json({
        error: 'Student access required.'
      });
    }

    // auth middleware already verifies account approval.
    if (req.user.account_status !== 'approved') {
      return res.status(403).json({
        error: 'Your account is not approved.'
      });
    }

    res.set('Cache-Control', 'no-store');

    res.json({
      user: pub(req.user),
      progress: pub(req.user)
    });

  } catch (error) {
    console.error('Student identity error:', error);
    res.status(500).json({
      error: 'Could not load student account.'
    });
  }
});
app.post('/api/progress',auth,studentOnly,async(req,res)=>{
  const amount=Math.max(0,Math.min(100,Number(req.body.xp)||0));
  const key=String(req.body.key||'').trim();
  if(amount<=0)return res.status(400).json({error:'XP amount must be greater than 0.'});
  const c=Array.isArray(req.user.completed)?req.user.completed:[];
  const client=await pool.connect();
  try{
    await client.query('BEGIN');
    let awarded=false;
    if(key){
      if(!c.includes(key)){
        const event=await client.query('INSERT INTO xp_events(user_id,event_key,amount) VALUES($1,$2,$3) ON CONFLICT(user_id,event_key) DO NOTHING RETURNING event_key',[req.user.id,key,amount]);
        if(event.rowCount){c.push(key);await client.query('UPDATE users SET xp=xp+$1,completed=$2 WHERE id=$3',[amount,JSON.stringify(c),req.user.id]);awarded=true;}
      }
    }else{
      await client.query('UPDATE users SET xp=xp+$1 WHERE id=$2',[amount,req.user.id]);
      awarded=true;
    }
    await client.query('COMMIT');
    const r=await pool.query('SELECT * FROM users WHERE id=$1',[req.user.id]);
    res.json({progress:pub(r.rows[0]),awarded,xpAwarded:awarded?amount:0});
  }catch(e){await client.query('ROLLBACK');console.error('Progress save failed:',e);res.status(500).json({error:'Could not save XP. Please try again.'})}
  finally{client.release()}
});
app.get('/api/certificate',auth,studentOnly,async(req,res)=>{try{let completed=Array.isArray(req.user.completed)?req.user.completed:[],completedZones=Array.from({length:12},(_,i)=>completed.includes('lesson-'+i)).filter(Boolean).length,r=await pool.query('SELECT certificate_issued_at,certificate_code FROM users WHERE id=$1',[req.user.id]),row=r.rows[0];res.json({eligible:completedZones===12,completedZones,issuedAt:row.certificate_issued_at,code:row.certificate_code})}catch(e){res.status(500).json({error:'Could not load certificate.'})}});
app.post('/api/certificate',auth,studentOnly,async(req,res)=>{try{let completed=Array.isArray(req.user.completed)?req.user.completed:[],completedZones=Array.from({length:12},(_,i)=>completed.includes('lesson-'+i)).filter(Boolean).length;if(completedZones<12)return res.status(403).json({error:`Complete all 12 learning zones first. You have completed ${completedZones}/12.`});let existing=await pool.query('SELECT certificate_issued_at,certificate_code FROM users WHERE id=$1',[req.user.id]);if(existing.rows[0].certificate_issued_at)return res.json({issuedAt:existing.rows[0].certificate_issued_at,code:existing.rows[0].certificate_code});let code='CQ-'+Math.random().toString(36).slice(2,8).toUpperCase()+'-'+Math.random().toString(36).slice(2,6).toUpperCase(),r=await pool.query('UPDATE users SET certificate_issued_at=NOW(),certificate_code=$1 WHERE id=$2 RETURNING certificate_issued_at,certificate_code',[code,req.user.id]);res.json({issuedAt:r.rows[0].certificate_issued_at,code:r.rows[0].certificate_code})}catch(e){res.status(500).json({error:'Could not issue certificate.'})}});
app.get('/api/leaderboard',async(req,res)=>{let r=await pool.query('SELECT id,name,xp FROM users ORDER BY xp DESC,created_at ASC LIMIT 20');res.json({students:r.rows})});
app.get('/api/analytics',auth,studentOnly,async(req,res)=>{try{const c=Array.isArray(req.user.completed)?req.user.completed:[];const dailyRows=await pool.query(`SELECT d::date AS day,COALESCE(SUM(x.amount),0)::int AS xp,COUNT(x.event_key)::int AS events FROM generate_series(CURRENT_DATE-INTERVAL '13 days',CURRENT_DATE,INTERVAL '1 day') d LEFT JOIN xp_events x ON x.user_id=$1 AND x.created_at::date=d::date GROUP BY d::date ORDER BY d::date`,[req.user.id]);const daily=dailyRows.rows.map(r=>({label:new Date(r.day).toLocaleDateString(undefined,{month:'short',day:'numeric'}),xp:Number(r.xp)||0,events:Number(r.events)||0}));const weekXp=daily.slice(-7).reduce((n,x)=>n+x.xp,0);const prevWeekXp=daily.slice(0,7).reduce((n,x)=>n+x.xp,0);const events7=daily.slice(-7).reduce((n,x)=>n+x.events,0);const activeDays7=daily.slice(-7).filter(x=>x.events>0).length;const weekDelta=prevWeekXp?Math.round((weekXp-prevWeekXp)/prevWeekXp*100):weekXp?100:0;const lessons=c.filter(x=>x.startsWith('lesson-')).length,sessions=c.filter(x=>x.startsWith('session-')).length,labs=c.filter(x=>x.startsWith('advanced-')).length;const completedTotal=lessons+sessions+labs;const overall=Math.round((lessons/12+sessions/12+labs/6)/3*100);const eventCount=await pool.query('SELECT COUNT(*)::int AS n FROM xp_events WHERE user_id=$1',[req.user.id]);const activity=[{label:'Learning Zones',count:lessons,icon:'📚'},{label:'Cyber Sessions',count:sessions,icon:'◫'},{label:'Advanced Labs',count:labs,icon:'⌬'},{label:'XP Events',count:eventCount.rows[0].n,icon:'⚡'}];let momentumText='Keep learning to build your first performance trend.';if(weekXp>prevWeekXp)momentumText=`Your XP momentum is up ${weekDelta}% versus the previous 7-day period.`;else if(weekXp<prevWeekXp)momentumText=`Your recent XP momentum is ${Math.abs(weekDelta)}% lower than the previous 7-day period. A focused session can restart the trend.`;else if(weekXp)momentumText='Your XP momentum is steady. Keep completing focused activities to improve the trend.';res.json({xpTotal:req.user.xp,weekXp,prevWeekXp,weekDelta,events7,activeDays7,daily,completion:{lessons,sessions,labs},completedTotal,overall,activity,momentumText})}catch(e){console.error('Analytics error:',e);res.status(500).json({error:'Could not load student analytics.'})}});

app.get('/api/intelligence',auth,studentOnly,async(req,res)=>{try{const c=Array.isArray(req.user.completed)?req.user.completed:[];const lessonMap={"Phishing Awareness":[0,1],"Network Defense":[2,6],"Cryptography":[5],"SOC & Incident Response":[6,11],"Digital Forensics":[10],"Web Security":[8],"Identity & Access":[3],"Malware Defense":[4]};const labMap={"Phishing Awareness":['advanced-phishing-investigation'],"SOC & Incident Response":['advanced-soc-incident-response'],"Malware Defense":['advanced-ransomware-response'],"Network Defense":['advanced-network-attack-investigation'],"Digital Forensics":['advanced-digital-forensics-case'],"Web Security":['advanced-web-security-lab']};const skills=Object.entries(lessonMap).map(([name,idxs])=>{let lessonScore=Math.round(idxs.reduce((n,i)=>n+(c.includes('lesson-'+i)?1:0),0)/idxs.length*55);let sessionScore=Math.round(idxs.reduce((n,i)=>n+(c.includes('session-'+i)?1:0),0)/idxs.length*25);let labs=labMap[name]||[];let labScore=labs.length?Math.round(labs.reduce((n,k)=>n+(c.includes(k)?1:0),0)/labs.length*20):0;return {name,score:Math.min(100,lessonScore+sessionScore+labScore)}});skills.sort((a,b)=>a.score-b.score);const weakest=skills[0],strongest=[...skills].sort((a,b)=>b.score-a.score)[0];const recommendation=weakest.score<50?`Strengthen ${weakest.name} with a focused session and its advanced lab.`:weakest.score<80?`Practice ${weakest.name} next to move toward mastery.`:`Try an advanced challenge in ${strongest.name}.`;res.json({overall:Math.round(skills.reduce((n,s)=>n+s.score,0)/skills.length),skills,weakest,strongest,recommendation,signals:{lessons:c.filter(x=>x.startsWith('lesson-')).length,sessions:c.filter(x=>x.startsWith('session-')).length,labs:c.filter(x=>x.startsWith('advanced-')).length}})}catch(e){res.status(500).json({error:'Could not calculate learning intelligence.'})}});
app.get('/api/recommendations',auth,studentOnly,async(req,res)=>{try{const c=Array.isArray(req.user.completed)?req.user.completed:[];const profiles=[
{name:'Phishing Awareness',session:2,lesson:2,lab:'advanced-phishing-investigation',labLabel:'Phishing Investigation',icon:'🎣',reason:'Strengthen your ability to spot manipulation, suspicious links and social-engineering signals.'},
{name:'Network Defense',session:6,lesson:6,lab:'advanced-network-attack-investigation',labLabel:'Network Attack Investigation',icon:'🌐',reason:'Build stronger traffic-analysis and defensive triage skills.'},
{name:'Cryptography',session:5,lesson:5,lab:null,labLabel:null,icon:'🔐',reason:'Reinforce encryption, hashing and digital-signature fundamentals.'},
{name:'SOC & Incident Response',session:6,lesson:11,lab:'advanced-soc-incident-response',labLabel:'SOC Incident Response',icon:'🚨',reason:'Improve alert correlation, triage and incident containment decisions.'},
{name:'Digital Forensics',session:10,lesson:10,lab:'advanced-digital-forensics-case',labLabel:'Digital Forensics Case',icon:'🔍',reason:'Practice evidence correlation, timelines and defensible preservation decisions.'},
{name:'Web Security',session:8,lesson:8,lab:'advanced-web-security-lab',labLabel:'Web Security Lab',icon:'🛡️',reason:'Strengthen secure application analysis, authorization and input-validation reasoning.'},
{name:'Identity & Access',session:3,lesson:3,lab:null,labLabel:null,icon:'🔑',reason:'Reinforce authentication, authorization, MFA and least-privilege concepts.'},
{name:'Malware Defense',session:4,lesson:4,lab:'advanced-ransomware-response',labLabel:'Ransomware Response',icon:'🦠',reason:'Practice containment and recovery decisions during a simulated malware incident.'}
];
const lessonMap={};profiles.forEach(p=>lessonMap[p.name]=p.lesson);const labMap={};profiles.forEach(p=>{if(p.lab)labMap[p.name]=p.lab});const scored=profiles.map(p=>{const lessonDone=c.includes('lesson-'+p.lesson),sessionDone=c.includes('session-'+p.session),labDone=p.lab?c.includes(p.lab):false;const score=(lessonDone?55:0)+(sessionDone?25:0)+(labDone?20:0);let actionType='session',actionTitle=`Cyber Session: ${p.name}`,actionDetail='Build the concept foundation before taking on the investigation.',action='openSession',actionArg=p.session,cta='START SESSION';if(!sessionDone){actionType='session';actionTitle=`Cyber Session: ${p.name}`;actionDetail='A focused refresher will raise this skill signal and prepare you for practice.';action='openSession';actionArg=p.session;cta='START SESSION'}else if(p.lab&&!labDone){actionType='lab';actionTitle=p.labLabel;actionDetail='You understand the basics. Now apply them in an evidence-based investigation.';action=p.lab==='advanced-digital-forensics-case'?'openForensicsLab':p.lab==='advanced-web-security-lab'?'openWebSecurityLab':'advancedLab';actionArg=p.lab==='advanced-digital-forensics-case'||p.lab==='advanced-web-security-lab'?null:p.lab.replace('advanced-','').replace(/-investigation|-/g,'');cta='OPEN LAB'}else{actionType='challenge';actionTitle=`Advanced ${p.name} Challenge`;actionDetail='Your foundation is strong. Keep progressing with a harder challenge.';action='challenges';actionArg=null;cta='VIEW CHALLENGES'}return {...p,score,lessonDone,sessionDone,labDone,actionType,actionTitle,actionDetail,action,actionArg,cta}}).sort((a,b)=>a.score-b.score);const focus=scored[0],strong=scored[scored.length-1];const completedCount=c.filter(x=>x.startsWith('lesson-')||x.startsWith('session-')||x.startsWith('advanced-')).length;res.json({focus,strong,items:scored.slice(0,4),completedCount,headline:focus.score<50?'FOUNDATION FOCUS':focus.score<80?'SKILL BOOST':'MASTERY STRETCH'});}catch(e){console.error('Recommendation error:',e);res.status(500).json({error:'Could not calculate adaptive recommendations.'})}});
// =================================
// PROFESSOR MEMBER MANAGEMENT
// =================================

// View all student members
app.get('/api/admin/members', auth, adminOnly, async (req, res) => {
  try {
    const status = String(req.query.status || 'all');

    const allowed = ['all', 'pending', 'approved', 'suspended', 'removed'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid member status.' });
    }

    let result;

    if (status === 'all') {
      result = await pool.query(`
        SELECT id, name, email, role, account_status,
               xp, streak, created_at, last_active
        FROM users
        WHERE role = 'student'
        ORDER BY created_at DESC
      `);
    } else {
      result = await pool.query(`
        SELECT id, name, email, role, account_status,
               xp, streak, created_at, last_active
        FROM users
        WHERE role = 'student' AND account_status = $1
        ORDER BY created_at DESC
      `, [status]);
    }

    res.json({
      success: true,
      members: result.rows
    });

  } catch (error) {
    console.error('Member loading error:', error);
    res.status(500).json({ error: 'Could not load members.' });
  }
});


// Approve, suspend or remove a student
app.patch('/api/admin/members/:id/status', auth, adminOnly, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const status = String(req.body.status || '');

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid member ID.' });
    }

    if (!['approved', 'suspended', 'removed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid account status.' });
    }

    const result = await pool.query(`
      UPDATE users
      SET account_status = $1
      WHERE id = $2 AND role = 'student'
      RETURNING id, name, email, role, account_status
    `, [status, id]);

    if (!result.rowCount) {
      return res.status(404).json({ error: 'Student member not found.' });
    }

    res.json({
      success: true,
      message: `Member status updated to ${status}.`,
      member: result.rows[0]
    });

  } catch (error) {
    console.error('Member update error:', error);
    res.status(500).json({ error: 'Could not update member.' });
  }
});

const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500 MB
const VIDEO_UPLOAD_VALIDITY = 15 * 60 * 1000; // 15 minutes

// PROFESSOR: CREATE A PRIVATE VIDEO UPLOAD URL
app.post('/api/admin/videos/upload-url', auth, adminOnly, async (req, res) => {
  try {
    const title = String(req.body.title || '').trim();
    const description = String(req.body.description || '').trim();
    const category = String(req.body.category || 'General').trim();
    const fileName = String(req.body.fileName || '').trim();
    const fileSize = Number(req.body.fileSize);

    if (title.length < 3 || title.length > 120) {
      return res.status(400).json({
        error: 'Title must contain 3–120 characters.'
      });
    }

    if (description.length > 2000 || category.length > 80) {
      return res.status(400).json({
        error: 'Description or category is too long.'
      });
    }

    if (
      !fileName ||
      !fileName.toLowerCase().endsWith('.mp4')
    ) {
      return res.status(400).json({
        error: 'Only MP4 video files are allowed.'
      });
    }

    if (
      !Number.isSafeInteger(fileSize) ||
      fileSize <= 0 ||
      fileSize > MAX_VIDEO_SIZE
    ) {
      return res.status(400).json({
        error: 'Video must be smaller than 500 MB.'
      });
    }

    const uploadId = crypto.randomUUID();
    const pathname = `academy-videos/${uploadId}.mp4`;
    const expiresAt = Date.now() + VIDEO_UPLOAD_VALIDITY;

    const signedToken = await issueSignedToken({
      pathname,
      operations: ['put'],
      allowedContentTypes: ['video/mp4'],
      maximumSizeInBytes: MAX_VIDEO_SIZE,
      validUntil: expiresAt
    });

    const { presignedUrl } = await presignUrl(signedToken, {
      operation: 'put',
      pathname,
      access: 'private',
      allowedContentTypes: ['video/mp4'],
      maximumSizeInBytes: MAX_VIDEO_SIZE,
      addRandomSuffix: false,
      allowOverwrite: false,
      validUntil: expiresAt
    });

    await pool.query(
      `INSERT INTO academy_video_uploads
       (id, title, description, category, blob_pathname,
        file_name, expected_size_bytes, created_by, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        uploadId,
        title,
        description,
        category,
        pathname,
        fileName,
        fileSize,
        req.user.id,
        new Date(expiresAt)
      ]
    );

    res.status(201).json({
      success: true,
      uploadId,
      uploadUrl: presignedUrl,
      expiresAt,
      maxSizeBytes: MAX_VIDEO_SIZE
    });

  } catch (error) {
    console.error('Video upload URL error:', error);
    res.status(500).json({
      error: 'Could not prepare video upload.'
    });
  }
});

// PROFESSOR: VERIFY UPLOAD AND SAVE VIDEO LESSON
app.post('/api/admin/videos/complete', auth, adminOnly, async (req, res) => {
  try {
    const uploadId = String(req.body.uploadId || '');

    if (!/^[0-9a-f-]{36}$/i.test(uploadId)) {
      return res.status(400).json({ error: 'Invalid upload ID.' });
    }

    const pendingResult = await pool.query(
      `SELECT *
       FROM academy_video_uploads
       WHERE id = $1
         AND created_by = $2
         AND expires_at > NOW()`,
      [uploadId, req.user.id]
    );

    if (!pendingResult.rowCount) {
      return res.status(404).json({
        error: 'Upload not found or upload session expired.'
      });
    }

    const pending = pendingResult.rows[0];

    // Verify the actual object in private Blob storage.
    const blob = await head(pending.blob_pathname);

    if (
      blob.pathname !== pending.blob_pathname ||
      blob.contentType !== 'video/mp4' ||
      Number(blob.size) !== Number(pending.expected_size_bytes) ||
      Number(blob.size) > MAX_VIDEO_SIZE
    ) {
      return res.status(400).json({
        error: 'Uploaded video failed file verification.'
      });
    }

    const result = await pool.query(
      `INSERT INTO academy_videos
       (title, description, category, blob_pathname,
        file_name, file_size_bytes, content_type,
        is_published, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, 'video/mp4', FALSE, $7)
       RETURNING id, title, description, category,
                 file_name, file_size_bytes,
                 content_type, is_published, created_at`,
      [
        pending.title,
        pending.description,
        pending.category,
        pending.blob_pathname,
        pending.file_name,
        blob.size,
        req.user.id
      ]
    );

    await pool.query(
      'DELETE FROM academy_video_uploads WHERE id = $1',
      [uploadId]
    );

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully as a draft.',
      video: result.rows[0]
    });

  } catch (error) {
    console.error('Video completion error:', error);
    res.status(500).json({
      error: 'Could not verify and save the uploaded video.'
    });
  }
});

// =================================
// PROFESSOR VIDEO LIBRARY MANAGEMENT
// =================================

// List videos for professor
app.get('/api/admin/videos', auth, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, description, category,
             file_name, file_size_bytes,
             content_type, is_published, created_at
      FROM academy_videos
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      videos: result.rows
    });
  } catch (error) {
    console.error('Video listing error:', error);
    res.status(500).json({ error: 'Could not load videos.' });
  }
});

// Publish or unpublish a lesson
app.patch('/api/admin/videos/:id/publish', auth, adminOnly, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const isPublished = req.body.isPublished;

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid video ID.' });
    }

    if (typeof isPublished !== 'boolean') {
      return res.status(400).json({
        error: 'Publication status must be true or false.'
      });
    }

    const result = await pool.query(`
      UPDATE academy_videos
      SET is_published = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, title, is_published
    `, [isPublished, id]);

    if (!result.rowCount) {
      return res.status(404).json({ error: 'Video not found.' });
    }

    res.json({
      success: true,
      video: result.rows[0]
    });
  } catch (error) {
    console.error('Video publication error:', error);
    res.status(500).json({ error: 'Could not update video.' });
  }
});

// =================================
// APPROVED STUDENT VIDEO ACCESS
// =================================

// List published lessons for approved students
app.get('/api/videos', auth, async (req, res) => {
  try {
    if (
      req.user.role !== 'student' ||
      req.user.account_status !== 'approved'
    ) {
      return res.status(403).json({
        error: 'Approved student access required.'
      });
    }

    const result = await pool.query(`
      SELECT id, title, description, category,
             file_name, file_size_bytes, created_at
      FROM academy_videos
      WHERE is_published = TRUE
      ORDER BY created_at DESC
    `);

    res.set('Cache-Control', 'no-store');

    res.json({
      success: true,
      videos: result.rows
    });

  } catch (error) {
    console.error('Student video listing error:', error);
    res.status(500).json({
      error: 'Could not load video lessons.'
    });
  }
});

// Generate temporary access to one published lesson
app.post('/api/videos/:id/access', auth, async (req, res) => {
  try {
    if (
      req.user.role !== 'student' ||
      req.user.account_status !== 'approved'
    ) {
      return res.status(403).json({
        error: 'Approved student access required.'
      });
    }

    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        error: 'Invalid video ID.'
      });
    }

    const result = await pool.query(`
      SELECT id, blob_pathname
      FROM academy_videos
      WHERE id = $1 AND is_published = TRUE
    `, [id]);

    if (!result.rowCount) {
      return res.status(404).json({
        error: 'Published video not found.'
      });
    }

    const pathname = result.rows[0].blob_pathname;
    const validUntil = Date.now() + 4 * 60 * 60 * 1000;

    const signedToken = await issueSignedToken({
      pathname,
      operations: ['get'],
      validUntil
    });

    const { presignedUrl } = await presignUrl(signedToken, {
      operation: 'get',
      pathname,
      access: 'private',
      validUntil
    });

    res.set('Cache-Control', 'no-store');

    res.json({
      success: true,
      videoId: id,
      videoUrl: presignedUrl,
      expiresAt: validUntil
    });

  } catch (error) {
    console.error('Student video access error:', error);
    res.status(500).json({
      error: 'Could not authorize video playback.'
    });
  }
});


// =================================
// PROFESSOR MEETING CREATION
// =================================

app.post('/api/admin/meetings', auth, adminOnly, async (req, res) => {
  let client;

  try {
    const title = String(req.body.title || '').trim();
    const description = String(req.body.description || '').trim();
    const scheduledAt = new Date(req.body.scheduledAt);
    const duration = Number(req.body.durationMinutes || 60);
    const meetingUrl = String(req.body.meetingUrl || '').trim();
    const inviteAll = req.body.inviteAll === true;
    const memberIds = Array.isArray(req.body.memberIds)
      ? [...new Set(req.body.memberIds.map(Number))]
      : [];

    if (title.length < 3 || title.length > 150) {
      return res.status(400).json({
        error: 'Meeting title must contain 3–150 characters.'
      });
    }

    if (description.length > 3000) {
      return res.status(400).json({
        error: 'Meeting description is too long.'
      });
    }

    if (
      Number.isNaN(scheduledAt.getTime()) ||
      scheduledAt.getTime() <= Date.now()
    ) {
      return res.status(400).json({
        error: 'Choose a valid future meeting date and time.'
      });
    }

    if (
      !Number.isInteger(duration) ||
      duration < 15 ||
      duration > 480
    ) {
      return res.status(400).json({
        error: 'Meeting duration must be between 15 and 480 minutes.'
      });
    }

    if (meetingUrl) {
      try {
        const parsedUrl = new URL(meetingUrl);

        if (parsedUrl.protocol !== 'https:') {
          throw new Error('HTTPS required');
        }
      } catch {
        return res.status(400).json({
          error: 'Enter a valid HTTPS meeting link.'
        });
      }
    }

    if (
      !inviteAll &&
      (
        memberIds.length === 0 ||
        memberIds.some(id => !Number.isSafeInteger(id) || id <= 0)
      )
    ) {
      return res.status(400).json({
        error: 'Select at least one valid approved member.'
      });
    }

    client = await pool.connect();
    await client.query('BEGIN');

    // Only approved student accounts may receive invitations.
    const members = inviteAll
      ? await client.query(`
          SELECT id, name, email
          FROM users
          WHERE role = 'student'
            AND account_status = 'approved'
          ORDER BY name
          FOR SHARE
        `)
      : await client.query(`
          SELECT id, name, email
          FROM users
          WHERE role = 'student'
            AND account_status = 'approved'
            AND id = ANY($1::int[])
          ORDER BY name
          FOR SHARE
        `, [memberIds]);

    if (!members.rowCount) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'No approved students were found to invite.'
      });
    }

    if (!inviteAll && members.rowCount !== memberIds.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'One or more selected members are not approved students.'
      });
    }

    const meetingResult = await client.query(`
      INSERT INTO academy_meetings
        (title, description, scheduled_at,
         duration_minutes, meeting_url, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [
      title,
      description,
      scheduledAt,
      duration,
      meetingUrl || null,
      req.user.id
    ]);

    const meeting = meetingResult.rows[0];

    const formattedTime = scheduledAt.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    // Create in-app invitation and notification for every member.
    for (const member of members.rows) {
      await client.query(`
        INSERT INTO academy_meeting_invites
          (meeting_id, user_id, status, email_status)
        VALUES ($1, $2, 'pending', 'pending')
      `, [meeting.id, member.id]);

      await client.query(`
        INSERT INTO academy_notifications
          (user_id, type, title, message, meeting_id)
        VALUES ($1, 'meeting_invitation', $2, $3, $4)
      `, [
        member.id,
        `Meeting invitation: ${title}`,
        `You are invited to "${title}" on ${formattedTime}.`,
        meeting.id
      ]);
    }

    await client.query('COMMIT');

// =================================
// SEND MEETING INVITATION EMAILS
// =================================

let emailsSent = 0;
let emailsFailed = 0;

for (const member of members.rows) {
  try {
    await sendMeetingInvitationEmail({
      to: member.email,
      name: member.name,
      title: meeting.title,
      description: meeting.description,
      scheduledAt: meeting.scheduled_at,
      durationMinutes: meeting.duration_minutes,
      meetingUrl: meeting.meeting_url
    });

    await pool.query(`
      UPDATE academy_meeting_invites
      SET email_status = 'sent'
      WHERE meeting_id = $1 AND user_id = $2
    `, [meeting.id, member.id]);

    emailsSent++;

  } catch (mailError) {
    console.error(
      `Meeting email failed for ${member.email}:`,
      mailError.message
    );

    await pool.query(`
      UPDATE academy_meeting_invites
      SET email_status = 'failed'
      WHERE meeting_id = $1 AND user_id = $2
    `, [meeting.id, member.id]).catch(dbError => {
      console.error('Email status update failed:', dbError.message);
    });

    emailsFailed++;
  }
}

  res.status(201).json({
  success: true,
  message: 'Meeting created and in-app invitations delivered.',
  meeting,
  invitedCount: members.rowCount,
  emailsSent,
  emailsFailed,
  emailStatus: emailsFailed === 0
    ? 'sent'
    : emailsSent > 0
      ? 'partial'
      : 'failed'
});

  } catch (error) {
    if (client) {
      await client.query('ROLLBACK').catch(() => {});
    }

    console.error('Meeting creation error:', error);

    res.status(500).json({
      error: 'Could not create meeting.'
    });

  } finally {
    client?.release();
  }
});


// =================================
// PROFESSOR: VIEW ALL MEETINGS
// =================================

app.get('/api/admin/meetings', auth, adminOnly, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        m.id,
        m.title,
        m.description,
        m.scheduled_at,
        m.duration_minutes,
        m.meeting_url,
        m.status,
        m.created_at,
        COUNT(i.id)::int AS invited_count,
        COUNT(i.id) FILTER (
          WHERE i.status = 'accepted'
        )::int AS accepted_count,
        COUNT(i.id) FILTER (
          WHERE i.status = 'declined'
        )::int AS declined_count,
        COUNT(i.id) FILTER (
          WHERE i.status = 'pending'
        )::int AS pending_count
      FROM academy_meetings m
      LEFT JOIN academy_meeting_invites i
        ON i.meeting_id = m.id
      GROUP BY m.id
      ORDER BY m.scheduled_at DESC
    `);

    res.set('Cache-Control', 'no-store');

    res.json({
      success: true,
      meetings: result.rows
    });

  } catch (error) {
    console.error('Meeting listing error:', error);

    res.status(500).json({
      error: 'Could not load meetings.'
    });
  }
});


// =================================
// PROFESSOR: VIEW INVITATION RESPONSES
// =================================

app.get('/api/admin/meetings/:id/invitations', auth, adminOnly, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid meeting ID.' });
    }

    const meeting = await pool.query(
      'SELECT id, title, status FROM academy_meetings WHERE id = $1',
      [id]
    );

    if (!meeting.rowCount) {
      return res.status(404).json({ error: 'Meeting not found.' });
    }

    const result = await pool.query(`
      SELECT
        i.id,
        u.name,
        u.email,
        i.status,
        i.email_status,
        i.invited_at,
        i.responded_at
      FROM academy_meeting_invites i
      JOIN users u ON u.id = i.user_id
      WHERE i.meeting_id = $1
      ORDER BY u.name
    `, [id]);

    res.set('Cache-Control', 'no-store');

    res.json({
      success: true,
      meeting: meeting.rows[0],
      invitations: result.rows
    });

  } catch (error) {
    console.error('Invitation listing error:', error);
    res.status(500).json({
      error: 'Could not load meeting invitations.'
    });
  }
});


// =================================
// PROFESSOR: CANCEL A MEETING
// =================================

app.patch('/api/admin/meetings/:id/cancel', auth, adminOnly, async (req, res) => {
  const client = await pool.connect();

  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid meeting ID.' });
    }

    await client.query('BEGIN');

    const meeting = await client.query(`
      UPDATE academy_meetings
      SET status = 'cancelled', updated_at = NOW()
      WHERE id = $1 AND status = 'scheduled'
      RETURNING id, title
    `, [id]);

    if (!meeting.rowCount) {
      await client.query('ROLLBACK');

      const existing = await pool.query(
        'SELECT id, status FROM academy_meetings WHERE id = $1',
        [id]
      );

      if (!existing.rowCount) {
        return res.status(404).json({ error: 'Meeting not found.' });
      }

      return res.status(409).json({
        error: `Meeting cannot be cancelled because its status is ${existing.rows[0].status}.`
      });
    }

    const title = meeting.rows[0].title;

    await client.query(`
      INSERT INTO academy_notifications
        (user_id, type, title, message, meeting_id)
      SELECT
        user_id,
        'meeting_cancelled',
        $2,
        $3,
        $1
      FROM academy_meeting_invites
      WHERE meeting_id = $1
    `, [
      id,
      `Meeting cancelled: ${title}`,
      `The professor has cancelled "${title}".`
    ]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Meeting cancelled and in-app notifications created.'
    });

  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Meeting cancellation error:', error);

    res.status(500).json({
      error: 'Could not cancel meeting.'
    });

  } finally {
    client.release();
  }
});


// =================================
// STUDENT MEETING INVITATIONS
// =================================

// View meetings invited to this student
app.get('/api/student/meetings', auth, studentOnly, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        m.id,
        m.title,
        m.description,
        m.scheduled_at,
        m.duration_minutes,
        m.meeting_url,
        m.status AS meeting_status,
        i.status AS invitation_status,
        i.invited_at,
        i.responded_at
      FROM academy_meeting_invites i
      JOIN academy_meetings m ON m.id = i.meeting_id
      WHERE i.user_id = $1
      ORDER BY m.scheduled_at DESC
    `, [req.user.id]);

    res.set('Cache-Control', 'no-store');

    res.json({
      success: true,
      meetings: result.rows
    });

  } catch (error) {
    console.error('Student meeting loading error:', error);
    res.status(500).json({
      error: 'Could not load your meeting invitations.'
    });
  }
});


// View in-app notifications
app.get('/api/student/notifications', auth, studentOnly, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        type,
        title,
        message,
        meeting_id,
        is_read,
        created_at
      FROM academy_notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 50
    `, [req.user.id]);

    res.set('Cache-Control', 'no-store');

    res.json({
      success: true,
      notifications: result.rows
    });

  } catch (error) {
    console.error('Student notification error:', error);
    res.status(500).json({
      error: 'Could not load notifications.'
    });
  }
});


// Accept or decline a meeting invitation
app.patch('/api/student/meetings/:id/respond', auth, studentOnly, async (req, res) => {
  try {
    const meetingId = Number(req.params.id);
    const response = String(req.body.status || '');

    if (!Number.isSafeInteger(meetingId) || meetingId <= 0) {
      return res.status(400).json({
        error: 'Invalid meeting ID.'
      });
    }

    if (!['accepted', 'declined'].includes(response)) {
      return res.status(400).json({
        error: 'Choose accepted or declined.'
      });
    }

    const result = await pool.query(`
      UPDATE academy_meeting_invites i
      SET
        status = $1,
        responded_at = NOW()
      FROM academy_meetings m
      WHERE i.meeting_id = m.id
        AND i.meeting_id = $2
        AND i.user_id = $3
        AND m.status = 'scheduled'
      RETURNING i.meeting_id, i.status, i.responded_at
    `, [response, meetingId, req.user.id]);

    if (!result.rowCount) {
      return res.status(404).json({
        error: 'Invitation not found or meeting is no longer scheduled.'
      });
    }

    res.json({
      success: true,
      message: `Meeting invitation ${response}.`,
      invitation: result.rows[0]
    });

  } catch (error) {
    console.error('Meeting response error:', error);
    res.status(500).json({
      error: 'Could not update your meeting response.'
    });
  }
});


// Mark an in-app notification as read
app.patch('/api/student/notifications/:id/read', auth, studentOnly, async (req, res) => {
  try {
    const notificationId = Number(req.params.id);

    if (!Number.isSafeInteger(notificationId) || notificationId <= 0) {
      return res.status(400).json({
        error: 'Invalid notification ID.'
      });
    }

    const result = await pool.query(`
      UPDATE academy_notifications
      SET is_read = TRUE
      WHERE id = $1 AND user_id = $2
      RETURNING id, is_read
    `, [notificationId, req.user.id]);

    if (!result.rowCount) {
      return res.status(404).json({
        error: 'Notification not found.'
      });
    }

    res.json({
      success: true,
      notification: result.rows[0]
    });

  } catch (error) {
    console.error('Notification update error:', error);
    res.status(500).json({
      error: 'Could not update notification.'
    });
  }
});

app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
const PORT = process.env.PORT || 10000;

init().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CYBER//QUEST online on 0.0.0.0:${PORT}`);
  });
}).catch(e => {
  console.error(e);
  process.exit(1);
});
