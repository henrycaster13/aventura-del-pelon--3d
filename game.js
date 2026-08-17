const canvas=document.getElementById("game"),ctx=canvas.getContext("2d");
const W=1280,H=720;
const keys={left:false,right:false,jump:false};
let running=false, last=0, coins=0, stars=0, lives=3, levelIndex=0, level, player, particles=[], sandals=[];
let boss=null, bossProjectiles=[], bossDefeated=false, bossHits=0;
const villainImg=new Image(); villainImg.src="assets/villano_pupusa.png";
let companion={x:0,y:0,vx:0,vy:0,w:54,h:42,onGround:false,inv:0};
const bunnyImg=new Image(); bunnyImg.src="assets/companero_conejo.png";

const levels=[
 {name:"1-1 BOSQUE", sky:"#58bdf2", ground:"#4f9b35", far:"#79c96b", finish:4400,
  platforms:[[0,620,760,100],[900,560,430,160],[1450,620,620,100],[2200,535,430,185],[2750,620,650,100],[3600,550,800,170]],
  coins:[[220,550],[340,500],[1030,490],[1160,490],[1580,550],[1760,500],[2320,465],[2450,465],[2890,550],[3050,500],[3750,490],[4020,450]],
  stars:[[590,510],[1900,450],[3300,510]],
  enemies:[[610,570],[1080,510],[1810,570],[3000,570],[3820,500]],
  clouds:[120,130,560,210,930,110,1450,170,2100,100,2750,150,3450,90]},
 {name:"2-1 NIEVE", sky:"#a9d9ef", ground:"#dfeaf0", far:"#8db5cf", finish:4700,
  platforms:[[0,620,700,100],[840,555,380,165],[1350,620,650,100],[2160,520,430,200],[2700,620,620,100],[3450,545,500,175],[4140,620,650,100]],
  coins:[[250,550],[370,500],[940,485],[1060,485],[1480,550],[1660,500],[2280,445],[2420,445],[2830,550],[3000,500],[3550,485],[3710,485],[4260,550],[4440,500]],
  stars:[[560,500],[1900,520],[3180,520],[3990,485]],
  enemies:[[550,570],[1080,505],[1770,570],[2920,570],[3650,490],[4330,570]],
  clouds:[150,110,620,180,1220,90,1700,150,2500,100,3250,150,4050,90]},
 {name:"3-1 DESIERTO", sky:"#f2b66d", ground:"#b87535", far:"#d99a57", finish:5000,
  platforms:[[0,620,820,100],[970,550,390,170],[1490,620,700,100],[2320,530,390,190],[2790,620,680,100],[3590,545,430,175],[4160,620,840,100]],
  coins:[[230,550],[350,500],[1050,480],[1180,480],[1600,550],[1770,500],[2400,450],[2520,450],[2920,550],[3070,500],[3670,480],[3800,480],[4300,550],[4480,500],[4700,450]],
  stars:[[650,500],[2010,520],[3250,510],[3940,480],[4810,500]],
  enemies:[[620,570],[1120,500],[1900,570],[2990,570],[3730,490],[4440,570],[4780,570]],
  clouds:[180,100,700,170,1300,90,2000,130,2800,100,3500,150,4300,90]},
 {name:"4-1 CALLE", sky:"#647b96", ground:"#343b43", far:"#4c5663", finish:5300,
  platforms:[[0,620,760,100],[900,565,450,155],[1550,620,650,100],[2300,545,420,175],[2840,620,700,100],[3650,555,480,165],[4260,620,1040,100]],
  coins:[[220,550],[340,500],[1000,500],[1150,500],[1650,550],[1800,500],[2380,475],[2500,475],[3000,550],[3180,500],[3740,495],[3880,495],[4380,550],[4540,500],[4760,450],[5010,500]],
  stars:[[610,500],[1980,520],[3200,520],[4050,500],[4880,450]],
  enemies:[[600,570],[1120,515],[1850,570],[2500,500],[3050,570],[3800,505],[4450,570],[4800,570],[5100,570]],
  clouds:[120,100,650,160,1280,90,2050,140,2850,100,3500,150,4250,90]}
];

function resetPlayer(){
 player={x:90,y:540,w:52,h:78,vx:0,vy:0,onGround:false,face:1,inv:0,run:0};
 companion={x:20,y:560,w:54,h:42,vx:0,vy:0,onGround:false,inv:0};
}
function loadLevel(i){levelIndex=i;level=levels[i];resetPlayer();particles=[];showMsg(`Mundo ${level.name}`);}
function start(){coins=0;stars=0;lives=3;loadLevel(0);running=true;document.getElementById("startScreen").classList.add("hidden");}
document.getElementById("startBtn").onclick=start;

function showMsg(t){const m=document.getElementById("message");m.textContent=t;m.classList.remove("hidden");clearTimeout(showMsg.t);showMsg.t=setTimeout(()=>m.classList.add("hidden"),1400)}
function keySet(k,v){if(k==="left")keys.left=v;if(k==="right")keys.right=v;if(k==="jump")keys.jump=v}
window.addEventListener("keydown",e=>{if(["ArrowLeft","ArrowRight","ArrowUp"," ","a","d","w","A","D","W"].includes(e.key))e.preventDefault();
 if(e.key==="ArrowLeft"||e.key==="a"||e.key==="A")keySet("left",true);
 if(e.key==="ArrowRight"||e.key==="d"||e.key==="D")keySet("right",true);
 if(e.key==="ArrowUp"||e.key==="w"||e.key==="W"||e.key===" ")keySet("jump",true);
});
window.addEventListener("keyup",e=>{
 if(e.key==="ArrowLeft"||e.key==="a"||e.key==="A")keySet("left",false);
 if(e.key==="ArrowRight"||e.key==="d"||e.key==="D")keySet("right",false);
 if(e.key==="ArrowUp"||e.key==="w"||e.key==="W"||e.key===" ")keySet("jump",false);
});
document.querySelectorAll("#touch button").forEach(b=>{
 const k=b.dataset.key;
 b.addEventListener("pointerdown",e=>{e.preventDefault();keySet(k,true)});
 b.addEventListener("pointerup",e=>{e.preventDefault();keySet(k,false)});
 b.addEventListener("pointercancel",()=>keySet(k,false));
 b.addEventListener("pointerleave",()=>keySet(k,false));
});

function rectHit(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function spawn(x,y,type){particles.push({x,y,vx:(Math.random()-.5)*4,vy:-Math.random()*4-1,life:1,type})}
function update(dt){
 if(!running)return;
 const accel=0.85, max=7.5;
 if(keys.left){player.vx-=accel;player.face=-1}
 if(keys.right){player.vx+=accel;player.face=1}
 if(!keys.left&&!keys.right)player.vx*=.82;
 player.vx=Math.max(-max,Math.min(max,player.vx));
 if(keys.jump&&player.onGround){player.vy=-16;player.onGround=false}
 player.vy+=.72;
 player.x+=player.vx; player.y+=player.vy;
 player.onGround=false;
 for(const p of level.platforms){
   const r={x:p[0],y:p[1],w:p[2],h:p[3]};
   if(player.vy>=0 && player.x+player.w>r.x && player.x<r.x+r.w && player.y+player.h>=r.y && player.y+player.h<=r.y+30){
     player.y=r.y-player.h;player.vy=0;player.onGround=true;
   }
 }
 player.x=Math.max(0,player.x);
 player.inv=Math.max(0,player.inv-dt);
 for(let i=level.coins.length-1;i>=0;i--){
   const c=level.coins[i], r={x:c[0]-14,y:c[1]-14,w:28,h:28};
   if(rectHit(player,r)){coins++;spawn(c[0],c[1],"coin");level.coins.splice(i,1)}
 }
 for(let i=level.stars.length-1;i>=0;i--){
   const s=level.stars[i],r={x:s[0]-18,y:s[1]-18,w:36,h:36};
   if(rectHit(player,r)){stars++;spawn(s[0],s[1],"star");level.stars.splice(i,1);showMsg("⭐ ¡Estrella!")}
 }
 for(const e of level.enemies){
   if(!e.dead){
     e.dir=e.dir||1;e.x=e.x||e[0];e.y=e.y||e[1];e.w=48;e.h=42;
     e.x+=e.dir*1.1;
     if(Math.random()<.002)e.dir*=-1;
     const er={x:e.x,y:e.y,w:e.w,h:e.h};
     if(rectHit(player,er)&&player.inv<=0){
       if(player.vy>2&&player.y+player.h<e.y+22){e.dead=true;player.vy=-10;spawn(e.x+20,e.y,"enemy");showMsg("¡Bien!")}
       else hitPlayer();
     }
   }
 }

 for(const s of sandals){
   if(s.dead) continue;
   s.phase += dt*3;
   s.x += s.dir*(2.0 + levelIndex*.35);
   s.y = s.baseY + Math.sin(s.phase)*42;
   if(s.x < 250 || s.x > level.finish-180) s.dir *= -1;
   const sr={x:s.x-31,y:s.y-13,w:62,h:26};
   if(rectHit(player,sr)&&player.inv<=0){
     if(player.vy>1 && player.y+player.h < s.y+10){
       s.dead=true; player.vy=-11; spawn(s.x,s.y,"enemy"); showMsg("¡Chancla derrotada!");
     } else {
       hitPlayer();
     }
   }
 }

 particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.15;p.life-=dt*2});
 particles=particles.filter(p=>p.life>0);
 if(player.y>820)hitPlayer();

 // Conejito compañero: sigue al Tío Pelón, salta pequeños desniveles y recoge objetos cercanos.
 const targetX=player.x-70;
 const dx=targetX-companion.x;
 companion.vx += Math.max(-0.45,Math.min(0.45,dx*0.035));
 companion.vx *= 0.88;
 companion.vx=Math.max(-4.8,Math.min(4.8,companion.vx));
 if(Math.abs(dx)>160) companion.vx += dx>0 ? 0.8 : -0.8;
 companion.x += companion.vx;
 companion.vy += 0.72;
 companion.y += companion.vy;
 companion.onGround=false;
 for(const p of level.platforms){
   const r={x:p[0],y:p[1],w:p[2],h:p[3]};
   if(companion.vy>=0 && companion.x+companion.w>r.x && companion.x<r.x+r.w &&
      companion.y+companion.h>=r.y && companion.y+companion.h<=r.y+28){
     companion.y=r.y-companion.h; companion.vy=0; companion.onGround=true;
   }
 }
 if(companion.onGround && Math.abs(dx)>100 && Math.random()<0.08) companion.vy=-10;
 companion.inv=Math.max(0,companion.inv-dt);
 for(let i=level.coins.length-1;i>=0;i--){
   const c=level.coins[i],r={x:c[0]-18,y:c[1]-18,w:36,h:36};
   if(rectHit(companion,r)){coins++;spawn(c[0],c[1],"coin");level.coins.splice(i,1);showMsg("🐰 ¡El conejito encontró una moneda!")}
 }
 for(let i=level.stars.length-1;i>=0;i--){
   const s=level.stars[i],r={x:s[0]-22,y:s[1]-22,w:44,h:44};
   if(rectHit(companion,r)){stars++;spawn(s[0],s[1],"star");level.stars.splice(i,1);showMsg("🐰 ¡El conejito encontró una estrella!")}
 }
 if(companion.y>820){companion.x=player.x-70;companion.y=player.y-10;companion.vy=0}


 // Jefe final: aparece al acercarte a la meta y exige varios saltos sobre él.
 if(boss && !bossDefeated && player.x > level.finish-700){
   boss.active=true;
   boss.x += boss.dir*(1.0+levelIndex*.35);
   if(boss.x < level.finish-520 || boss.x > level.finish-130) boss.dir*=-1;
   boss.y=470+Math.sin(performance.now()/260)*18;
   boss.cooldown-=dt;
   if(boss.cooldown<=0){
     boss.cooldown=Math.max(.65,1.25-levelIndex*.15);
     bossProjectiles.push({x:boss.x+40,y:boss.y+60,vx:-5.2-levelIndex*.7,vy:-2.2});
     bossProjectiles.push({x:boss.x+100,y:boss.y+60,vx:-4.2-levelIndex*.7,vy:1.0});
   }
   const br={x:boss.x,y:boss.y,w:boss.w,h:boss.h};
   if(rectHit(player,br)&&player.inv<=0){
     if(player.vy>2 && player.y+player.h<boss.y+45){
       boss.hp--; bossHits++; player.vy=-13; spawn(boss.x+70,boss.y,"enemy");
       showMsg(`¡Golpe al villano! ${boss.hp} ❤️`);
       if(boss.hp<=0){bossDefeated=true;boss.active=false;bossProjectiles=[];showMsg("🏆 ¡VILLANO DERROTADO!")}
     } else hitPlayer();
   }
 }
 for(let i=bossProjectiles.length-1;i>=0;i--){
   const q=bossProjectiles[i]; q.x+=q.vx; q.y+=q.vy; q.vy+=.08;
   if(rectHit(player,{x:q.x-9,y:q.y-9,w:18,h:18})&&player.inv<=0){bossProjectiles.splice(i,1);hitPlayer();continue}
   if(q.x<player.x-900){bossProjectiles.splice(i,1)}
 }

 if(player.x>level.finish){ if(!boss || bossDefeated) nextLevel(); else {player.x=level.finish-40;showMsg('⚔️ ¡Primero derrota al villano!')} }
 document.getElementById("lives").textContent=lives;
 document.getElementById("coins").textContent=coins;
 document.getElementById("stars").textContent=String(stars).padStart(2,"0");
 document.getElementById("level").textContent=level.name;
}
function hitPlayer(){
 if(player.inv>0)return;
 lives--;
 if(lives<=0){running=false;showMsg("Fin de la partida");setTimeout(()=>document.getElementById("startScreen").classList.remove("hidden"),1200)}
 else{showMsg("¡Cuidado!");resetPlayer();player.inv=2}
}
function nextLevel(){
 if(levelIndex<levels.length-1){loadLevel(levelIndex+1)}
 else{running=false;showMsg(`🏆 ¡Completaste el juego!  🪙 ${coins}  ⭐ ${stars}`);setTimeout(()=>document.getElementById("startScreen").classList.remove("hidden"),1800)}
}

function draw(){
 const cam=Math.max(0,Math.min(level.finish-W,player.x-360));
 ctx.clearRect(0,0,W,H);
 ctx.fillStyle=level.sky;ctx.fillRect(0,0,W,H);
 // distant landscape
 ctx.fillStyle=level.far;
 for(let x=-((cam*.18)%520)-520;x<W+520;x+=520){ctx.beginPath();ctx.moveTo(x,430);ctx.quadraticCurveTo(x+130,300,x+260,430);ctx.quadraticCurveTo(x+390,270,x+520,430);ctx.lineTo(x+520,620);ctx.lineTo(x,620);ctx.fill()}
 // clouds
 for(const cx of level.clouds){const x=cx-cam*.12;const y=level.clouds[level.clouds.indexOf(cx)+1]||120;drawCloud(x,y)}
 // themed scenery
 if(levelIndex===0){
   for(let x=-200-(cam*.25)%500;x<W+500;x+=500) drawTree(x,430);
 } else if(levelIndex===1){
   for(let x=-100-(cam*.2)%360;x<W+400;x+=360) drawPine(x,455);
 } else if(levelIndex===2){
   for(let x=-100-(cam*.18)%430;x<W+500;x+=430) drawCactus(x,515);
 } else {
   for(let x=-100-(cam*.18)%360;x<W+400;x+=360) drawStreetBuilding(x,350);
 }
 // platforms
 for(const p of level.platforms)drawPlatform(p[0]-cam,p[1],p[2],p[3],levelIndex===2);
 // coins
 for(const c of level.coins)drawCoin(c[0]-cam,c[1]);
 for(const s of level.stars)drawStar(s[0]-cam,s[1]);
 // enemies
 for(const e of level.enemies)if(!e.dead)drawEnemy((e.x??e[0])-cam,(e.y??e[1]));
 for(const s of sandals)if(!s.dead)drawSandal(s.x-cam,s.y);
 if(boss && boss.active && !bossDefeated) drawBoss(boss.x-cam,boss.y,boss.hp,boss.maxHp); for(const q of bossProjectiles) drawPupusaProjectile(q.x-cam,q.y); drawFlag(level.finish-cam,480);
 drawCompanion(companion.x-cam,companion.y); drawPlayer(player.x-cam,player.y);
 for(const p of particles){ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.type==="coin"?"#ffd43b":"#fff06a";ctx.beginPath();ctx.arc(p.x-cam,p.y,5,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
}

function drawTree(x,y){
 ctx.fillStyle="#65442b";ctx.fillRect(x+25,y,22,120);
 ctx.fillStyle="#2f8a43";ctx.beginPath();ctx.arc(x+35,y-10,55,0,Math.PI*2);ctx.arc(x+5,y+20,38,0,Math.PI*2);ctx.arc(x+65,y+22,40,0,Math.PI*2);ctx.fill();
}
function drawPine(x,y){
 ctx.fillStyle="#6b7880";ctx.fillRect(x+30,y+30,12,100);
 ctx.fillStyle="#f8fdff";ctx.beginPath();ctx.moveTo(x+36,y-65);ctx.lineTo(x-5,y+25);ctx.lineTo(x+77,y+25);ctx.closePath();ctx.fill();
 ctx.fillStyle="#d6e7ef";ctx.beginPath();ctx.moveTo(x+36,y-25);ctx.lineTo(x+5,y+55);ctx.lineTo(x+67,y+55);ctx.closePath();ctx.fill();
}
function drawCactus(x,y){
 ctx.fillStyle="#3c8d43";ctx.fillRect(x+30,y,25,110);ctx.fillRect(x+8,y+30,25,20);ctx.fillRect(x+8,y+10,20,45);ctx.fillRect(x+55,y+50,25,20);ctx.fillRect(x+60,y+30,20,45);
}
function drawStreetBuilding(x,y){
 ctx.fillStyle="#4d5662";ctx.fillRect(x,y,120,270);
 ctx.fillStyle="#8b98a6";ctx.fillRect(x+15,y+25,28,35);ctx.fillRect(x+65,y+25,28,35);ctx.fillRect(x+15,y+85,28,35);ctx.fillRect(x+65,y+85,28,35);ctx.fillRect(x+15,y+145,28,35);ctx.fillRect(x+65,y+145,28,35);
 ctx.fillStyle="#e4b94d";ctx.fillRect(x+48,y+215,28,55);
}

function drawCloud(x,y){ctx.fillStyle="#ffffffb8";ctx.beginPath();ctx.arc(x,y,34,0,Math.PI*2);ctx.arc(x+38,y-18,45,0,Math.PI*2);ctx.arc(x+82,y,30,0,Math.PI*2);ctx.fill()}
function drawPlatform(x,y,w,h,dark=false){
 let base=dark?"#48515a":"#8a552f";
 if(levelIndex===1) base="#d5e1e6";
 if(levelIndex===2) base="#b87333";
 if(levelIndex===3) base="#343b43";
 ctx.fillStyle=base;ctx.fillRect(x,y,w,h);
 ctx.fillStyle=dark?"#69737d":"#a96c38";for(let xx=x;xx<x+w;xx+=48){ctx.fillRect(xx,y+28,42,25);ctx.fillRect(xx+8,y+60,38,22)}
 let top=dark?"#55606b":"#56a83b", hi=dark?"#75818d":"#7bc64b";
 if(levelIndex===1){top="#ffffff";hi="#f4fbff"}
 if(levelIndex===2){top="#d99a45";hi="#efbd70"}
 if(levelIndex===3){top="#555e69";hi="#7b8794"}
 ctx.fillStyle=top;ctx.fillRect(x,y,w,18);ctx.fillStyle=hi;ctx.fillRect(x,y,w,5)
}
function drawCoin(x,y){ctx.fillStyle="#e39b00";ctx.beginPath();ctx.arc(x,y,17,0,Math.PI*2);ctx.fill();ctx.fillStyle="#ffd84a";ctx.beginPath();ctx.arc(x,y,12,0,Math.PI*2);ctx.fill();ctx.fillStyle="#a86a00";ctx.font="bold 16px Arial";ctx.textAlign="center";ctx.fillText("1",x,y+6)}
function drawStar(x,y){ctx.fillStyle="#ffd82f";ctx.beginPath();for(let i=0;i<10;i++){let a=-Math.PI/2+i*Math.PI/5,r=i%2?9:20;ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}ctx.closePath();ctx.fill();ctx.strokeStyle="#b77b00";ctx.stroke()}
function drawEnemy(x,y){
 ctx.fillStyle="#75452c";ctx.beginPath();ctx.ellipse(x+24,y+23,25,21,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(x+14,y+12,9,0,Math.PI*2);ctx.arc(x+34,y+12,9,0,Math.PI*2);ctx.fill();
 ctx.fillStyle="#111";ctx.beginPath();ctx.arc(x+14,y+14,4,0,Math.PI*2);ctx.arc(x+34,y+14,4,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle="#351d14";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x+8,y+6);ctx.lineTo(x+18,y+10);ctx.moveTo(x+40,y+6);ctx.lineTo(x+30,y+10);ctx.stroke()
}

function drawCompanion(x,y){
 if(!bunnyImg.complete || !bunnyImg.naturalWidth){
   ctx.fillStyle="#3b3028";ctx.beginPath();ctx.ellipse(x+27,y+23,25,17,0,0,Math.PI*2);ctx.fill();
   ctx.fillStyle="#fff";ctx.font="bold 13px Arial";ctx.textAlign="center";ctx.fillText("🐰",x+27,y+28);
   return;
 }
 ctx.save();
 // soft shadow
 ctx.globalAlpha=.28;ctx.fillStyle="#000";ctx.beginPath();ctx.ellipse(x+27,y+40,24,6,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
 ctx.drawImage(bunnyImg,x,y,54,42);
 ctx.restore();
}

function drawPlayer(x,y){
 if(player.inv>0&&Math.floor(performance.now()/90)%2===0)return;
 ctx.save();ctx.translate(x+player.w/2,y+player.h/2);ctx.scale(player.face,1);
 // shadow
 ctx.restore();ctx.fillStyle="#0005";ctx.beginPath();ctx.ellipse(x+26,y+77,28,7,0,0,Math.PI*2);ctx.fill();
 ctx.save();ctx.translate(x+26,y+38);
 // legs
 ctx.fillStyle="#171a20";ctx.fillRect(-19,18,15,27);ctx.fillRect(5,18,15,27);
 ctx.fillStyle="#e5e5e5";ctx.fillRect(-24,39,22,10);ctx.fillRect(3,39,24,10);
 ctx.fillStyle="#b51f22";ctx.fillRect(-23,35,22,10);ctx.fillRect(4,35,23,10);
 // shirt
 ctx.fillStyle="#c72a2e";ctx.beginPath();ctx.roundRect(-28,-22,56,49,14);ctx.fill();
 ctx.fillStyle="#fff";ctx.font="bold 24px Arial";ctx.textAlign="center";ctx.fillText("T",0,8);
 // head
 ctx.fillStyle="#8e5636";ctx.beginPath();ctx.arc(0,-38,28,0,Math.PI*2);ctx.fill();
 // ears
 ctx.beginPath();ctx.arc(-27,-36,7,0,Math.PI*2);ctx.arc(27,-36,7,0,Math.PI*2);ctx.fill();
 // beard
 ctx.fillStyle="#252525";ctx.beginPath();ctx.arc(0,-25,16,0,Math.PI);ctx.fill();
 // eyes
 ctx.fillStyle="#111";ctx.beginPath();ctx.arc(-9,-42,3,0,Math.PI*2);ctx.arc(9,-42,3,0,Math.PI*2);ctx.fill();
 // brows
 ctx.strokeStyle="#33231d";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-17,-50);ctx.lineTo(-4,-53);ctx.moveTo(4,-53);ctx.lineTo(17,-50);ctx.stroke();
 ctx.restore();
}


function drawBoss(x,y,hp,maxHp){
 ctx.save();
 ctx.fillStyle="#0006";ctx.beginPath();ctx.ellipse(x+75,y+122,76,10,0,0,Math.PI*2);ctx.fill();
 if(villainImg.complete && villainImg.naturalWidth) ctx.drawImage(villainImg,x,y-35,150,150);
 else {
   ctx.fillStyle="#e8b55c";ctx.beginPath();ctx.arc(x+75,y+45,55,0,Math.PI*2);ctx.fill();
   ctx.fillStyle="#d22";ctx.fillRect(x+35,y+75,80,20);
 }
 // boss health
 ctx.fillStyle="#1b1111";ctx.fillRect(x,y-24,150,12);
 ctx.fillStyle="#ef3434";ctx.fillRect(x,y-24,150*(hp/maxHp),12);
 ctx.strokeStyle="#fff";ctx.strokeRect(x,y-24,150,12);
 ctx.fillStyle="#fff";ctx.font="bold 16px Arial";ctx.textAlign="center";ctx.fillText("VILLANO",x+75,y-30);
 ctx.restore();
}
function drawPupusaProjectile(x,y){
 ctx.save();ctx.translate(x,y);ctx.rotate(performance.now()/300);
 ctx.fillStyle="#e5ae54";ctx.beginPath();ctx.arc(0,0,13,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle="#a76c2d";ctx.lineWidth=3;ctx.stroke();
 ctx.restore();
}

function drawSandal(x,y){
 ctx.save();
 ctx.translate(x,y);
 ctx.rotate(-0.22);
 // motion trail
 ctx.fillStyle="#ffffff22";ctx.beginPath();ctx.ellipse(-38,6,28,7,0,0,Math.PI*2);ctx.fill();
 // sole
 ctx.fillStyle="#4a2b1d";ctx.beginPath();ctx.ellipse(0,5,34,13,0,0,Math.PI*2);ctx.fill();
 // sandal body
 ctx.fillStyle="#8f5a32";ctx.beginPath();
 ctx.moveTo(-30,2);ctx.quadraticCurveTo(-25,-18,2,-18);
 ctx.quadraticCurveTo(29,-17,34,2);
 ctx.quadraticCurveTo(10,12,-30,2);ctx.fill();
 // straps
 ctx.strokeStyle="#d99a57";ctx.lineWidth=7;ctx.lineCap="round";
 ctx.beginPath();ctx.moveTo(-16,-12);ctx.quadraticCurveTo(0,2,17,-12);ctx.stroke();
 ctx.restore();
}

function drawFlag(x,y){ctx.fillStyle="#65442b";ctx.fillRect(x,y,8,140);ctx.fillStyle="#e83c32";ctx.beginPath();ctx.moveTo(x+8,y);ctx.lineTo(x+70,y+22);ctx.lineTo(x+8,y+44);ctx.closePath();ctx.fill();ctx.fillStyle="#ffd84a";ctx.beginPath();ctx.arc(x+4,y,10,0,Math.PI*2);ctx.fill()}

function loop(t){const dt=Math.min(.033,(t-last)/1000||.016);last=t;update(dt);draw();requestAnimationFrame(loop)}
requestAnimationFrame(loop);
