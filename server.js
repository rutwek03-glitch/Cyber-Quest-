require('dotenv').config();
const express=require('express'),path=require('path'),bcrypt=require('bcryptjs'),session=require('express-session'),{Pool}=require('pg');
const app=express(),pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:false});
app.use(express.json());app.use(session({secret:process.env.SESSION_SECRET||'dev-change-this',resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:604800000}}));app.use(express.static(path.join(__dirname,'public')));
const pub=r=>({id:r.id,name:r.name,email:r.email,xp:r.xp,streak:r.streak||1,completed:r.completed||[]});
async function init(){
  await pool.query(`CREATE TABLE IF NOT EXISTS users(id SERIAL PRIMARY KEY,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,xp INT NOT NULL DEFAULT 0,streak INT NOT NULL DEFAULT 1,last_active DATE,completed JSONB NOT NULL DEFAULT '[]'::jsonb,created_at TIMESTAMPTZ DEFAULT NOW())`);
  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS certificate_issued_at TIMESTAMPTZ');
  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS certificate_code TEXT UNIQUE');
  await pool.query(`CREATE TABLE IF NOT EXISTS xp_events(user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,event_key TEXT NOT NULL,amount INT NOT NULL,created_at TIMESTAMPTZ DEFAULT NOW(),PRIMARY KEY(user_id,event_key))`);
  let e=await pool.query('SELECT id FROM users WHERE email=$1',['student@cyberquest.demo']);
  if(!e.rowCount){let h=await bcrypt.hash('CyberQuest123',12);await pool.query('INSERT INTO users(name,email,password_hash,last_active) VALUES($1,$2,$3,CURRENT_DATE)',['Demo Student','student@cyberquest.demo',h])}
}
async function auth(req,res,next){if(!req.session.userId)return res.status(401).json({error:'Not signed in'});let r=await pool.query('SELECT * FROM users WHERE id=$1',[req.session.userId]);if(!r.rowCount)return res.status(401).json({error:'Session expired'});req.user=r.rows[0];next()}
app.post('/api/register',async(req,res)=>{try{let name=String(req.body.name||'').trim(),email=String(req.body.email||'').trim().toLowerCase(),password=String(req.body.password||'');if(name.length<2)return res.status(400).json({error:'Enter your name.'});if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))return res.status(400).json({error:'Enter a valid email.'});if(password.length<6)return res.status(400).json({error:'Password must be at least 6 characters.'});let h=await bcrypt.hash(password,12),r=await pool.query('INSERT INTO users(name,email,password_hash,last_active) VALUES($1,$2,$3,CURRENT_DATE) RETURNING *',[name,email,h]);req.session.userId=r.rows[0].id;res.json({user:pub(r.rows[0]),progress:pub(r.rows[0])})}catch(e){res.status(e.code==='23505'?409:500).json({error:e.code==='23505'?'An account with that email already exists.':'Could not create account.'})}});
app.post('/api/login',async(req,res)=>{try{let email=String(req.body.email||'').trim().toLowerCase(),password=String(req.body.password||''),r=await pool.query('SELECT * FROM users WHERE email=$1',[email]);if(!r.rowCount||!(await bcrypt.compare(password,r.rows[0].password_hash)))return res.status(401).json({error:'Incorrect email or password.'});let u=r.rows[0],today=new Date(),last=u.last_active?new Date(u.last_active):null;if(last){let d=Math.floor((Date.UTC(today.getFullYear(),today.getMonth(),today.getDate())-Date.UTC(last.getFullYear(),last.getMonth(),last.getDate()))/86400000);u.streak=d===1?u.streak+1:d>1?1:u.streak}else u.streak=1;await pool.query('UPDATE users SET streak=$1,last_active=CURRENT_DATE WHERE id=$2',[u.streak,u.id]);req.session.userId=u.id;res.json({user:pub(u),progress:pub(u)})}catch(e){res.status(500).json({error:'Login failed.'})}});
app.post('/api/logout',(req,res)=>req.session.destroy(()=>res.json({ok:true})));
app.get('/api/me',async(req,res)=>{if(!req.session.userId)return res.status(401).json({error:'Not signed in'});let r=await pool.query('SELECT * FROM users WHERE id=$1',[req.session.userId]);if(!r.rowCount)return res.status(401).json({error:'Not signed in'});res.json({user:pub(r.rows[0]),progress:pub(r.rows[0])})});
app.post('/api/progress',auth,async(req,res)=>{
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
app.get('/api/certificate',auth,async(req,res)=>{try{let completed=Array.isArray(req.user.completed)?req.user.completed:[],completedZones=Array.from({length:12},(_,i)=>completed.includes('lesson-'+i)).filter(Boolean).length,r=await pool.query('SELECT certificate_issued_at,certificate_code FROM users WHERE id=$1',[req.user.id]),row=r.rows[0];res.json({eligible:completedZones===12,completedZones,issuedAt:row.certificate_issued_at,code:row.certificate_code})}catch(e){res.status(500).json({error:'Could not load certificate.'})}});
app.post('/api/certificate',auth,async(req,res)=>{try{let completed=Array.isArray(req.user.completed)?req.user.completed:[],completedZones=Array.from({length:12},(_,i)=>completed.includes('lesson-'+i)).filter(Boolean).length;if(completedZones<12)return res.status(403).json({error:`Complete all 12 learning zones first. You have completed ${completedZones}/12.`});let existing=await pool.query('SELECT certificate_issued_at,certificate_code FROM users WHERE id=$1',[req.user.id]);if(existing.rows[0].certificate_issued_at)return res.json({issuedAt:existing.rows[0].certificate_issued_at,code:existing.rows[0].certificate_code});let code='CQ-'+Math.random().toString(36).slice(2,8).toUpperCase()+'-'+Math.random().toString(36).slice(2,6).toUpperCase(),r=await pool.query('UPDATE users SET certificate_issued_at=NOW(),certificate_code=$1 WHERE id=$2 RETURNING certificate_issued_at,certificate_code',[code,req.user.id]);res.json({issuedAt:r.rows[0].certificate_issued_at,code:r.rows[0].certificate_code})}catch(e){res.status(500).json({error:'Could not issue certificate.'})}});
app.get('/api/leaderboard',async(req,res)=>{let r=await pool.query('SELECT id,name,xp FROM users ORDER BY xp DESC,created_at ASC LIMIT 20');res.json({students:r.rows})});
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
init().then(()=>app.listen(process.env.PORT||3000,()=>console.log('CYBER//QUEST online'))).catch(e=>{console.error(e);process.exit(1)});
