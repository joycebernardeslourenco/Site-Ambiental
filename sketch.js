let lucro = 100, tremor = 0, status = "OK", danoTimer = 0, uAcao = "Equilíbrio mantido";
let f = ["flora", "agua", "fauna", "solo"], e = { flora: 0, agua: 0, fauna: 0, solo: 0 }, prot = { flora: false, agua: false, fauna: false, solo: false };
let sDano, sCura, sAmb, arv = [], ani = [], part = [], btn;
let jogoIniciado = false;
let metaLucro = 500; // META ADICIONADA

function setup() {
  createCanvas(600, 400);
  textAlign(CENTER);

  btn = createButton('INICIAR SIMULAÇÃO');
  btn.position(width / 2 - 80, height / 2);
  btn.style('padding', '15px 25px');
  btn.style('background-color', '#27ae60');
  btn.style('color', 'white');
  btn.style('border', 'none');
  btn.style('border-radius', '8px');
  btn.style('cursor', 'pointer');
  btn.style('font-weight', 'bold');
  
  btn.mousePressed(() => {
    jogoIniciado = true;
    btn.hide();
    userStartAudio();
    sAmb.start();
    loop();
  });

  for (let i = 0; i < 8; i++) arv.push({ x: random(50, 550), y: random(255, 275), t: random(0.8, 1.2) });

  let tentativas = 0;
  while (ani.length < 6 && tentativas < 200) {
    let nx = random(80, 520), ny = random(275, 305);
    if (!ani.some(a => dist(nx, ny, a.x, a.y) < 55)) {
      ani.push({ x: nx, y: ny, tipo: floor(random(3)), vx: 0, fugindo: false, visivel: true });
    }
    tentativas++;
  }

  sDano = new p5.Oscillator('sawtooth'); 
  sCura = new p5.Oscillator('sine'); 
  sAmb = new p5.Oscillator('triangle'); 
  sAmb.freq(220); sAmb.amp(0.05);

  noLoop();
}

function draw() {
  if (!jogoIniciado) {
    background(15);
    fill(255);
    text("SISTEMA DE GESTÃO AMBIENTAL", width/2, height/2 - 40);
    return;
  }

  if (status !== "OK") {
    background(20); 
    fill(status === "VITÓRIA" ? [0,255,100] : [255,50,50]); 
    textSize(30);
    text(status === "VITÓRIA" ? "VITÓRIA SUSTENTÁVEL!" : "COLAPSO AMBIENTAL", 300, 200); 
    return;
  }

  let totalDano = e.flora + e.agua + e.fauna + e.solo;
  background(135 - totalDano * 12, 206 - totalDano * 18, 235 - totalDano * 22); // Cores mais dramáticas
  
  push();
  if (tremor > 0) { translate(random(-tremor, tremor), random(-tremor, tremor)); tremor *= 0.9; }

  // Solo e Água
  fill(80 - e.solo * 15, 60 - e.solo * 15, 30); rect(0, 250, 600, 150);
  let hAgua = map(e.agua, 0, 3, 70, 10);
  fill(0, 120, 255, 180); rect(0, 400 - hAgua, 600, hAgua);

  // Árvores
  arv.forEach((a, i) => {
    if (i < 8 - floor(e.flora * 2.5)) {
      fill(101, 67, 33); rect(a.x - 5 * a.t, a.y, 10 * a.t, 30 * a.t);
      fill(34, 139, 34); ellipse(a.x, a.y, 40 * a.t);
    } else {
      fill(80, 50, 20); ellipse(a.x, a.y + 30 * a.t, 15 * a.t, 8 * a.t);
    }
  });

  // Animais detalhados
  ani.forEach((an, i) => {
    if (an.fugindo) { 
      an.x += an.vx; if (frameCount % 3 == 0) part.push({ x: an.x, y: an.y + 8, life: 20 });
      if (an.x < -50 || an.x > 650) an.visivel = false;
    }
    if (an.visivel && i < (6 - floor(e.fauna * 2))) {
      push(); translate(an.x, an.y); noStroke();
      if (an.tipo === 0) { // Coelho
        fill(160, 120, 80); ellipse(0, 0, 20, 15); ellipse(8, -8, 12, 10);
        fill(255, 200, 200); ellipse(6, -15, 4, 10); ellipse(10, -15, 4, 10);
      } else if (an.tipo === 1) { // Pássaro
        fill(100, 150, 255); triangle(0, 0, -10, 5, 10, 5);
        fill(255, 200, 0); triangle(8, 2, 15, 0, 8, -2);
      } else { // Ovelha
        fill(255); ellipse(0, 0, 22, 18); fill(50); ellipse(10, -5, 10, 10);
        ellipse(8, -10, 3, 6); ellipse(12, -10, 3, 6);
      }
      pop();
    }
  });

  // Interface Status
  f.forEach((n, i) => {
    let x = 100 + i * 130, d = e[n] >= 3, s = danoTimer > 0 && uAcao.toLowerCase().includes(n);
    let cor = d ? 50 : s ? [255,0,0] : n=="flora" ? [0,255,0] : n=="agua" ? [0,200,255] : n=="fauna" ? [255,200,0] : [160,82,45];
    fill(cor); ellipse(x, 100, 40 - e[n] * 10);
    fill(0); textSize(11); textStyle(BOLD); text(n.toUpperCase() + ":" + floor(100 - (e[n]*33.3)) + "%", x, 160);
    textSize(9); fill(50); text("Cura: " + (i+1), x, 175);
  });
  pop();

  // Partículas e HUD
  for (let i = part.length - 1; i >= 0; i--) {
    fill(139, 115, 85, part[i].life * 10); ellipse(part[i].x, part[i].y, 6);
    if (--part[i].life <= 0) part.splice(i, 1);
  }
  
  fill(255); stroke(0); strokeWeight(2); textSize(16); textAlign(LEFT);
  text("LUCRO: R$ " + floor(lucro), 30, 35); 
  fill(255, 255, 0); text("META: R$ " + metaLucro, 30, 60);
  
  textAlign(CENTER);
  fill(255, 200, 0); text("Ação: " + uAcao, 300, 35);
  
  if (danoTimer > 0) danoTimer--;
  
  // Imposto Climático mais pesado (Dificuldade)
  if (frameCount % 60 == 0) {
    let imp = (floor(e.flora) + floor(e.agua) + floor(e.fauna) + floor(e.solo)) * 15;
    lucro -= imp; if (imp > 0) uAcao = "Imposto Climático: -R$" + imp;
  }
  
  if (lucro >= metaLucro) status = "VITÓRIA"; 
  else if (lucro < -150 || totalDano >= 11) status = "FIM";
}

function keyPressed() {
  if (!jogoIniciado) return;
  let k = key.toLowerCase();
  
  // EXTRAIR (F, A, G, S)
  let ac = { f: "flora", a: "agua", g: "fauna", s: "solo" };
  if (ac[k] && e[ac[k]] < 3) {
    let n = ac[k];
    e[n] = min(3, e[n] + 1); 
    lucro += 40; tremor = 10; danoTimer = 25; 
    uAcao = "Extraindo " + n.toUpperCase();
    if (n == "fauna") {
      let fuge = ani.find(a => !a.fugindo);
      if(fuge) { fuge.fugindo = true; fuge.vx = random([-5, 5]); }
    }
    sDano.start(); sDano.amp(0.3, 0.05); setTimeout(() => sDano.amp(0, 0.1), 150);
  }

  // PRESERVAR (1, 2, 3, 4) - Custa R$ 100
  let rec = { "1": "flora", "2": "agua", "3": "fauna", "4": "solo" };
  if (rec[k]) {
    let n = rec[k];
    if (lucro >= 100 && e[n] > 0) {
      lucro -= 100;
      e[n] = max(0, e[n] - 1);
      uAcao = "Recuperando " + n.toUpperCase();
      danoTimer = 25;
      if (n == "fauna") {
        let volta = ani.find(a => !a.visivel || a.fugindo);
        if(volta) { volta.visivel = true; volta.fugindo = false; volta.x = random(100, 500); }
      }
      sCura.start(); sCura.amp(0.3, 0.05); setTimeout(() => sCura.amp(0, 0.1), 150);
    } else if (lucro < 100) {
      uAcao = "DINHEIRO INSUFICIENTE!";
      danoTimer = 25;
    }
  }
}