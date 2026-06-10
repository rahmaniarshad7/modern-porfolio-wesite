
// ── NEURAL NETWORK BACKGROUND ──
(function(){
  const canvas=document.getElementById('neural-canvas');
  const ctx=canvas.getContext('2d');
  let W,H,particles=[];
  function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight}
  resize();window.addEventListener('resize',resize);
  function Particle(){
    this.x=Math.random()*W;this.y=Math.random()*H;
    this.vx=(Math.random()-0.5)*0.3;this.vy=(Math.random()-0.5)*0.3;
    this.r=Math.random()*1.5+0.5;
    this.color=Math.random()>0.6?'rgba(0,229,255,':'rgba(124,58,237,';
  }
  for(let i=0;i<90;i++)particles.push(new Particle());
  // Moving grid
  let gridOffset=0;
  function drawGrid(){
    ctx.strokeStyle='rgba(0,229,255,0.04)';ctx.lineWidth=0.5;
    const size=60;const off=gridOffset%size;
    for(let x=off;x<W;x+=size){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
    for(let y=off;y<H;y+=size){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
    gridOffset+=0.3;
  }
  function animate(){
    ctx.clearRect(0,0,W,H);
    drawGrid();
    // lines
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const p=particles[i],q=particles[j];
        const d=Math.hypot(p.x-q.x,p.y-q.y);
        if(d<140){
          const alpha=(1-d/140)*0.35;
          ctx.strokeStyle=`rgba(0,229,255,${alpha})`;
          ctx.lineWidth=0.6;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();
        }
      }
    }
    // dots
    particles.forEach(p=>{
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=p.color+'0.8)';ctx.fill();
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;
    });
    requestAnimationFrame(animate);
  }
  animate();
})();

// ── 3D NETWORK SPHERE ──
(function(){
  const canvas=document.getElementById('sphere-canvas');
  if(!canvas)return;
  const ctx=canvas.getContext('2d');
  const W=320,H=320,cx=W/2,cy=H/2,R=110;
  const labels=['Spring Boot','Kafka','AWS','LangChain4j','RAG','PostgreSQL','Java 17','Redis','Docker','JWT'];
  const colors=['#00E5FF','#FBBF24','#FB923C','#A855F7','#EC4899','#60A5FA','#6EE7B7','#F87171','#34D399','#C084FC'];
  let nodes=[];
  // Fibonacci sphere distribution
  const phi=Math.PI*(3-Math.sqrt(5));
  for(let i=0;i<labels.length;i++){
    const y=1-(i/(labels.length-1))*2;
    const rr=Math.sqrt(1-y*y);
    const theta=phi*i;
    nodes.push({
      ox:Math.cos(theta)*rr,oy:y,oz:Math.sin(theta)*rr,
      label:labels[i],color:colors[i],
      ax:Math.cos(theta)*rr,ay:y,az:Math.sin(theta)*rr
    });
  }
  let rotX=0.3,rotY=0,isDragging=false,lastMX=0,lastMY=0,autoRot=true;
  canvas.addEventListener('mousedown',e=>{isDragging=true;lastMX=e.clientX;lastMY=e.clientY;autoRot=false});
  window.addEventListener('mouseup',()=>{isDragging=false;setTimeout(()=>autoRot=true,2000)});
  window.addEventListener('mousemove',e=>{
    if(!isDragging)return;
    const dx=(e.clientX-lastMX)*0.008,dy=(e.clientY-lastMY)*0.008;
    rotY+=dx;rotX+=dy;lastMX=e.clientX;lastMY=e.clientY;
  });
  // touch
  canvas.addEventListener('touchstart',e=>{isDragging=true;lastMX=e.touches[0].clientX;lastMY=e.touches[0].clientY;autoRot=false});
  window.addEventListener('touchend',()=>{isDragging=false;setTimeout(()=>autoRot=true,2000)});
  window.addEventListener('touchmove',e=>{
    if(!isDragging)return;
    const dx=(e.touches[0].clientX-lastMX)*0.008,dy=(e.touches[0].clientY-lastMY)*0.008;
    rotY+=dx;rotX+=dy;lastMX=e.touches[0].clientX;lastMY=e.touches[0].clientY;
  });
  function rotatePoint(x,y,z){
    // Y rotation
    let x1=x*Math.cos(rotY)-z*Math.sin(rotY);
    let z1=x*Math.sin(rotY)+z*Math.cos(rotY);
    // X rotation
    let y2=y*Math.cos(rotX)-z1*Math.sin(rotX);
    let z2=y*Math.sin(rotX)+z1*Math.cos(rotX);
    return{x:x1,y:y2,z:z2};
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    // Sphere glow
    const g=ctx.createRadialGradient(cx,cy,0,cx,cy,R);
    g.addColorStop(0,'rgba(0,229,255,0.04)');g.addColorStop(0.5,'rgba(124,58,237,0.06)');g.addColorStop(1,'rgba(0,229,255,0.02)');
    ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();
    ctx.strokeStyle='rgba(0,229,255,0.12)';ctx.lineWidth=0.5;ctx.stroke();
    // Compute rotated positions
    const proj=nodes.map(n=>{
      const r=rotatePoint(n.ox,n.oy,n.oz);
      const scale=1/(1.8-r.z*0.4);
      const px=cx+r.x*R*scale,py=cy-r.y*R*scale;
      return{px,py,z:r.z,n,scale};
    });
    // Sort by z
    proj.sort((a,b)=>a.z-b.z);
    // Draw connections
    for(let i=0;i<proj.length;i++){
      for(let j=i+1;j<proj.length;j++){
        const a=proj[i],b=proj[j];
        const d=Math.hypot(a.n.ox-b.n.ox,a.n.oy-b.n.oy,a.n.oz-b.n.oz);
        if(d<1.1){
          const alpha=(a.z>0&&b.z>0)?0.35:0.1;
          ctx.strokeStyle=`rgba(0,229,255,${alpha})`;ctx.lineWidth=0.6;
          ctx.beginPath();ctx.moveTo(a.px,a.py);ctx.lineTo(b.px,b.py);ctx.stroke();
        }
      }
    }
    // Draw nodes
    proj.forEach(({px,py,z,n,scale})=>{
      const visible=(z+1)/2;
      const r=Math.max(3,5*scale);
      // Dot
      ctx.beginPath();ctx.arc(px,py,r,0,Math.PI*2);
      ctx.fillStyle=n.color;ctx.globalAlpha=0.4+visible*0.6;ctx.fill();
      ctx.globalAlpha=1;
      // Glow for front nodes
      if(z>0.1){
        ctx.shadowBlur=12;ctx.shadowColor=n.color;
        ctx.beginPath();ctx.arc(px,py,r*0.5,0,Math.PI*2);ctx.fillStyle=n.color;ctx.fill();
        ctx.shadowBlur=0;
      }
      // Label
      if(z>-0.3){
        ctx.font=`${Math.round(9*scale+5)}px 'JetBrains Mono',monospace`;
        ctx.fillStyle=n.color;ctx.globalAlpha=0.4+visible*0.6;
        ctx.textAlign='center';
        ctx.fillText(n.label,px,py-r-4);
        ctx.globalAlpha=1;
      }
    });
    if(autoRot)rotY+=0.004;
    requestAnimationFrame(draw);
  }
  draw();
})();

// ── SKILL BARS ANIMATION ──
(function(){
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.querySelectorAll('.skill-fill').forEach(bar=>{
          bar.classList.add('animated');
          bar.style.transform=`scaleX(${bar.dataset.width})`;
        });
        observer.unobserve(e.target);
      }
    });
  },{threshold:0.2});
  document.querySelectorAll('.skill-card').forEach(c=>observer.observe(c));
})();

// ── GITHUB HEATMAP ──
(function(){
  const grid=document.getElementById('heatmap-grid');
  const countEl=document.getElementById('hm-count');
  const weeks=52;const days=7;
  let total=0;
  const palette=['#0d1117','rgba(0,229,255,0.12)','rgba(0,229,255,0.3)','rgba(0,229,255,0.55)','rgba(0,229,255,0.85)'];
  for(let w=0;w<weeks;w++){
    const col=document.createElement('div');col.className='hm-week';
    for(let d=0;d<days;d++){
      const cell=document.createElement('div');cell.className='hm-cell';
      // Simulate realistic activity pattern
      const prob=Math.random();
      let level=0;
      if(w>10){// More activity in recent months
        if(prob>0.55)level=1;if(prob>0.72)level=2;if(prob>0.85)level=3;if(prob>0.94)level=4;
      } else {
        if(prob>0.65)level=1;if(prob>0.80)level=2;if(prob>0.92)level=3;
      }
      const commits=[0,1,3,6,10][level];total+=commits;
      cell.style.background=palette[level];
      if(commits>0)cell.title=`${commits} contribution${commits>1?'s':''}`;
      col.appendChild(cell);
    }
    grid.appendChild(col);
  }
  countEl.textContent=`${total.toLocaleString()} contributions this year`;
})();

// ── AI CHATBOT ──
const KB={
  about:`Arshad is a 24-year-old Java AI Backend Developer based in Pune, India. He works at Infosys as a Systems Engineer and is pursuing his MCA from IIIT Ranchi (2027). His goal is to join fintech product companies like Razorpay, CRED, PhonePe, or Groww as a Java Backend Developer by 2027 targeting 12–18 LPA. 🎯`,
  projects:`Arshad has built:\n\n🤖 **Lovable AI Clone** — Spring Boot + LangChain4j + RAG + Vector DB (Featured)\n🎓 **Student Management System** — Core Java + JDBC + MySQL\n💳 **Fintech Payment API** — Spring Boot + JWT + JPA + PostgreSQL\n\nAll projects are on GitHub with clean architecture and READMEs.`,
  stack:`Arshad's tech stack:\n\n☕ Java 17+, Spring Boot, Spring MVC, JPA/Hibernate\n🗄️ MySQL, PostgreSQL, Redis, Vector DB\n🤖 LangChain4j, RAG, Spring AI, LLM APIs\n⚡ Kafka (learning), Docker, Git, Maven\n🧠 DSA (C++), LLD, OOP Design Patterns`,
  experience:`Arshad's experience:\n\n💼 Systems Engineer @ Infosys, Pune (Jan 2026 – Present)\n🔧 SE Trainee @ Infosys, Mysuru (Sep 2025 – Jan 2026)\n\n🎓 MCA @ IIIT Ranchi (2025–2027)\n🎓 BCA @ Uttaranchal University (CGPA 8.13, 2024)`,
  contact:`You can reach Arshad at:\n📞 9318364519\n📧 arshadrahmani.in@gmail.com\n💼 linkedin.com/in/arshad\n🐙 github.com/arshad\n\nHe's open to Java AI Backend Developer roles at product companies!`,
  hire:`Arshad is available from mid-2027 and targeting 12–18 LPA at fintech product companies. He's building his skills in Spring Boot, AI integration (LangChain4j + RAG), and system design. Get in touch at 9318364519 or arshadrahmani.in@gmail.com! 🚀`,
  skills:`Arshad's skill levels:\n\n🏆 DSA (C++) — 85%\n🍃 Spring Boot — 78%\n☕ Java Core — 88%\n🗄️ SQL/PostgreSQL — 80%\n🤖 LangChain4j/RAG — 45% (learning)\n⚡ System Design — 68%`,
};
function getReply(q){
  q=q.toLowerCase();
  if(q.match(/about|who|arshad|yourself/))return KB.about;
  if(q.match(/project|built|portfolio|work/))return KB.projects;
  if(q.match(/stack|tech|language|tool|use/))return KB.stack;
  if(q.match(/experience|job|company|infosys|education|study/))return KB.experience;
  if(q.match(/contact|email|reach|connect|linkedin|github/))return KB.contact;
  if(q.match(/hire|salary|lpa|available|opportunity|job/))return KB.hire;
  if(q.match(/skill|level|percent|matrix|rating/))return KB.skills;
  return`Great question! Arshad is a Java AI Backend Developer specializing in Spring Boot microservices, REST APIs, and AI integration with LangChain4j. Try asking about his projects, tech stack, or experience! 😊`;
}
function addMsg(text,isUser){
  const msgs=document.getElementById('chat-msgs');
  const div=document.createElement('div');
  div.className='msg '+(isUser?'msg-user':'msg-bot');
  div.textContent=text;msgs.appendChild(div);
  msgs.scrollTop=msgs.scrollHeight;
}
function addTyping(){
  const msgs=document.getElementById('chat-msgs');
  const div=document.createElement('div');div.className='msg-typing';div.id='typing';
  div.innerHTML='<div class="typing-dots"><span></span><span></span><span></span></div>';
  msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;return div;
}
function quickAsk(q){document.getElementById('chat-input').value=q;sendMsg()}
function sendMsg(){
  const inp=document.getElementById('chat-input');
  const q=inp.value.trim();if(!q)return;
  addMsg(q,true);inp.value='';
  document.getElementById('quick-btns').style.display='none';
  const typing=addTyping();
  setTimeout(()=>{typing.remove();addMsg(getReply(q),false)},900+Math.random()*600);
}
function toggleChat(){
  const w=document.getElementById('chat-window');
  w.classList.toggle('open');
}
