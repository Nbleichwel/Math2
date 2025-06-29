document.addEventListener('DOMContentLoaded', () => {
  // --- ELEMENTOS DA UI ---
  const canvasContainer = document.getElementById('canvas-container');
  const canvas = document.createElement('canvas');
  canvas.width = canvasContainer.offsetWidth || 800;
  canvas.height = canvasContainer.offsetHeight || 450;
  canvasContainer.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const infoContent = document.getElementById('info-content');
  const clearButton = document.getElementById('clearButton');
  const trajBtn = document.getElementById('trajBtn');
  const eventDescription = document.getElementById('event-description');
  const forceSlider = document.getElementById('forceSlider');
  const forceValueDisplay = document.getElementById('forceValue');
  const bodyPartSelect = document.getElementById('bodyPartSelect');
  const distanceSlider = document.getElementById('distanceSlider');
  const distanceValue = document.getElementById('distanceValue');
  let tooltip = document.getElementById('tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = 'tooltip';
    document.body.appendChild(tooltip);
  }

  // --- EFEITO LANTERNA ---
  let lanternX = canvas.width / 2;
  let lanternY = canvas.height / 2;
  let isLanternActive = false; // Começa DESLIGADO

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    lanternX = (e.clientX - rect.left) * (canvas.width / rect.width);
    lanternY = (e.clientY - rect.top) * (canvas.height / rect.height);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'f' || e.key === 'F') {
      isLanternActive = !isLanternActive;
    }
    // SET SECRETO: Alt+J
    if (e.altKey && (e.key === 'j' || e.key === 'J')) {
      if (!ARMAS_SETS.some(set => set.key === 'jojo')) {
        ARMAS_SETS.push(JOJO_SET);
        setAtualIdx = ARMAS_SETS.length - 1;
        setAtual = ARMAS_SETS[setAtualIdx];
        ferramentaAtual = setAtual.armas[0].key;
        regiaoAtual = (REGIOES[ferramentaAtual] && REGIOES[ferramentaAtual][0]) ? REGIOES[ferramentaAtual][0].key : '';
        renderSetsToolbar();
        renderToolbar();
        renderBodyParts();
        handleUserInteraction();
      } else {
        setAtualIdx = ARMAS_SETS.findIndex(set => set.key === 'jojo');
        setAtual = ARMAS_SETS[setAtualIdx];
        ferramentaAtual = setAtual.armas[0].key;
        regiaoAtual = (REGIOES[ferramentaAtual] && REGIOES[ferramentaAtual][0]) ? REGIOES[ferramentaAtual][0].key : '';
        renderSetsToolbar();
        renderToolbar();
        renderBodyParts();
        handleUserInteraction();
      }
    }
  });

  // --- CONFIGURAÇÃO DE ESCALA ---
  const METERS_TO_PX = 100;
  const PX_TO_METERS = 1 / METERS_TO_PX;
  function metersToPx(m) { return m * METERS_TO_PX; }
  function pxToMeters(px) { return px * PX_TO_METERS; }

  // --- SISTEMA DE SETS DE ARMAS ---
  const ARMAS_SETS = [
    {
      nome: "Clássicas",
      key: "classicas",
      armas: [
        { key: "martelo", nome: "Martelo" },
        { key: "soco", nome: "Soco" },
        { key: "faca", nome: "Faca" },
        { key: "pistola", nome: "Pistola" }
      ]
    },
    {
      nome: "Improvisadas",
      key: "improvisadas",
      armas: [
        { key: "garrafa", nome: "Garrafa de Vidro Quebrada" },
        { key: "pedcabra", nome: "Pé de Cabra" },
        { key: "pa", nome: "Pá" },
        { key: "boliche", nome: "Bola de Boliche" },
        { key: "skate", nome: "Skate" }
      ]
    }
  ];

  // --- SET SECRETO JOJO ---
  const JOJO_SET = {
    nome: "Stand/Spin/Hamon",
    key: "jojo",
    armas: [
      { key: "steelball", nome: "Steel Ball (Spin)" },
      { key: "starplatinum", nome: "Star Platinum Punch" },
      { key: "hamon", nome: "Soco com Hamon" }
    ]
  };

  // --- REGIÕES POR ARMA ---
  const REGIOES_PADRAO = [
    { key: "CABECA", nome: "Cabeça" }, { key: "ROSTO", nome: "Rosto" }, { key: "PESCOCO", nome: "Pescoço" }, { key: "TORAX", nome: "Tórax" }, { key: "ABDOMEN", nome: "Abdômen" }, { key: "COSTAS", nome: "Costas" }, { key: "BRACOS", nome: "Braços" }, { key: "PERNAS", nome: "Pernas" }, { key: "MAOS", nome: "Mãos" }, { key: "PES", nome: "Pés" }
  ];
  const REGIOES = {
    martelo: REGIOES_PADRAO,
    soco: REGIOES_PADRAO,
    faca: REGIOES_PADRAO,
    pistola: REGIOES_PADRAO,
    garrafa: REGIOES_PADRAO,
    pedcabra: REGIOES_PADRAO,
    pa: REGIOES_PADRAO,
    boliche: REGIOES_PADRAO,
    skate: REGIOES_PADRAO,
    steelball: REGIOES_PADRAO,
    starplatinum: REGIOES_PADRAO,
    hamon: REGIOES_PADRAO
  };

  // --- ESTADO DE SET E ARMA ATUAL ---
  let setAtualIdx = 0;
  let setAtual = ARMAS_SETS[setAtualIdx];
  let ferramentaAtual = setAtual.armas[0].key;
  let regiaoAtual = (REGIOES[ferramentaAtual] && REGIOES[ferramentaAtual][0]) ? REGIOES[ferramentaAtual][0].key : '';

  // --- RENDERIZAÇÃO E UI ---
  function renderSetsToolbar() {
    let setPanel = document.querySelector('.sets-toolbar');
    setPanel.innerHTML = '';
    ARMAS_SETS.forEach((set, idx) => {
      const btn = document.createElement('button');
      btn.className = 'set-button' + (setAtualIdx === idx ? ' active' : '');
      btn.textContent = set.nome;
      btn.onclick = () => {
        setAtualIdx = idx;
        setAtual = ARMAS_SETS[setAtualIdx];
        ferramentaAtual = setAtual.armas[0].key;
        regiaoAtual = (REGIOES[ferramentaAtual] && REGIOES[ferramentaAtual][0]) ? REGIOES[ferramentaAtual][0].key : '';
        renderSetsToolbar();
        renderToolbar();
        renderBodyParts();
        handleUserInteraction();
      };
      setPanel.appendChild(btn);
    });
    renderToolbar();
    renderBodyParts();
  }

  function renderToolbar() {
    const toolbar = document.querySelector('.toolbar');
    toolbar.innerHTML = "";
    setAtual.armas.forEach(arma => {
      const btn = document.createElement('button');
      btn.className = 'tool-button' + (ferramentaAtual === arma.key ? ' active' : '');
      btn.dataset.tool = arma.key;
      btn.textContent = arma.nome;
      btn.onclick = () => {
        document.querySelectorAll('.tool-button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        ferramentaAtual = arma.key;
        regiaoAtual = (REGIOES[ferramentaAtual] && REGIOES[ferramentaAtual][0]) ? REGIOES[ferramentaAtual][0].key : '';
        renderBodyParts();
        document.getElementById('force-control-group').style.visibility = (ferramentaAtual === 'pistola') ? 'hidden' : 'visible';
        handleUserInteraction();
      };
      toolbar.appendChild(btn);
    });
  }

  function renderBodyParts() {
    bodyPartSelect.innerHTML = "";
    (REGIOES[ferramentaAtual] || []).forEach(reg => {
      const opt = document.createElement('option');
      opt.value = reg.key;
      opt.textContent = reg.nome;
      bodyPartSelect.appendChild(opt);
    });
    regiaoAtual = (REGIOES[ferramentaAtual] && REGIOES[ferramentaAtual][0]) ? REGIOES[ferramentaAtual][0].key : '';
  }

  // --- ESTADO RESTANTE ---
  let forceLevel = 2;
  let manchas = [];
  let mostrarTrajetorias = false;
  let origem = { x: pxToMeters(canvas.width / 2), y: pxToMeters(canvas.height * 0.4), z: 1.20 };
  let draggingOrigin = false;

  trajBtn.addEventListener('click', () => {
    mostrarTrajetorias = !mostrarTrajetorias;
    trajBtn.textContent = mostrarTrajetorias ? 'Ocultar Trajetórias' : 'Mostrar Trajetórias';
  });

  // --- IMAGEM CENTRAL ---
  const pessoaImg = new Image();
  pessoaImg.src = 'https://i.ibb.co/xqznzY51/Design-sem-nome.png';
  let pessoaImgCarregada = false;
  pessoaImg.onload = () => { pessoaImgCarregada = true; };

  // --- Secret
  const tiposJoJo = {
      IMPACTO_ROTACIONAL:    { tipo: 'nevoa_media', volume: 500, dispersao: 5, nome: "Impacto Espiralado" },
      VORTEX_DESTRUTIVO:     { tipo: 'nevoa_densa', volume: 1800, dispersao: 8, nome: "Vórtex de Obliteração" },
      COLAPSO_INFINITO:      { tipo: 'nevoa_densa', volume: 4000, dispersao: 10, nome: "Rotação Infinita Destrutiva" },
      TORCAO_MUSCULAR:       { tipo: 'impacto_forte', volume: 300, dispersao: 4, nome: "Onda de Choque Rotacional" },
      RUPTURA_ORGANICA_ROTACIONAL: { tipo: 'nevoa_densa', volume: 1500, dispersao: 7, nome: "Ruptura Orgânica em Espiral" },
      DESINTEGRACAO_ESPIRAL: { tipo: 'nevoa_densa', volume: 4500, dispersao: 10, nome: "Desintegração por Rotação" },
      IMPACTO_EXPLOSIVO:     { tipo: 'nevoa_media', volume: 800, dispersao: 7, nome: "Impacto de Stand (ORA!)" },
      PULVERIZACAO_FACIAL:   { tipo: 'nevoa_densa', volume: 3000, dispersao: 9, nome: "Barragem Pulverizante (ORA ORA!)" },
      OBLITERACAO_TOTAL:     { tipo: 'nevoa_densa', volume: 8000, dispersao: 10, nome: "Barragem de Obliteração (ORA ORA ORA!!!)" },
      FRATURA_EXPLOSIVA:     { tipo: 'impacto_forte', volume: 600, dispersao: 6, nome: "Quebra de Membro (ORA!)" },
      DESTRUICAO_MEMBRO:     { tipo: 'nevoa_densa', volume: 2500, dispersao: 8, nome: "Aniquilação de Membro (ORA ORA!)" },
      CHOQUE_DE_HAMON:       { tipo: 'gotejamento', volume: 20, dispersao: 1, nome: "Choque de Hamon" },
      EBULICAO_INTERNA:      { tipo: 'jato_arterial', volume: 800, dispersao: 6, nome: "Overdrive da Ebulição" },
      DECOMPOSICAO_ACELERADA: { tipo: 'nevoa_media', volume: 1200, dispersao: 5, nome: "Overdrive da Decomposição" },
      SOBRECARGA_NEURAL:     { tipo: 'impacto', volume: 150, dispersao: 2, nome: "Sobrecarga de Hamon" },
      FRATURA_INTERNA_EXPLOSIVA:{ tipo: 'impacto_forte', volume: 500, dispersao: 5, nome: "Overdrive da Fratura Interna" },
      VAPORIZACAO_HAMONICA:  { tipo: 'nevoa_media', volume: 900, dispersao: 4, nome: "Overdrive da Vaporização" }
  };
  
  // --- PERFIS DE SANGRAMENTO ---
  const perfilMartelo = {
    CABECA: [2, 3, 4], ROSTO: [2, 3, 3], PESCOCO: [2, 3, 3], TORAX: [1, 2, 3], ABDOMEN: [1, 1, 2], COSTAS: [1, 1, 2], BRACOS: [1, 2, 2], PERNAS: [1, 2, 2], MAOS: [1, 1, 2], PES: [1, 1, 2]
  };

  const perfisDeSangramento = {
    SOCO:      { CABECA: [1, 2, 3], ROSTO: [2, 2, 3], PESCOCO: [1, 2, 2], TORAX: [0, 1, 1], ABDOMEN: [0, 0, 0], COSTAS: [0, 0, 0], BRACOS: [0, 1, 1], PERNAS: [0, 1, 1], MAOS: [0, 1, 1], PES: [0, 1, 1] },
    MARTELO: perfilMartelo,
    FACA:      { CABECA: [2, 2, 3], ROSTO: [2, 2, 2], PESCOCO: [2, 3, 5], TORAX: [3, 3, 4], ABDOMEN: [2, 2, 2], COSTAS: [2, 2, 2], BRACOS: [2, 3, 4], PERNAS: [2, 3, 4], MAOS: [2, 2, 2], PES: [2, 2, 2] },
    PISTOLA: { CABECA: [7], ROSTO: [6], PESCOCO: [7], TORAX: [7], ABDOMEN: [3, 4], COSTAS: [3, 4], BRACOS: [2, 5], PERNAS: [2, 5], MAOS: [1, 2], PES: [1, 2] },
    GARRAFA: perfilMartelo,
    PEDCABRA: perfilMartelo,
    PA: perfilMartelo,
    BOLICHE: perfilMartelo,
    SKATE: perfilMartelo,
    STEELBALL: {
      CABECA: [ {tipo:'IMPACTO_ROTACIONAL'}, {tipo:'VORTEX_DESTRUTIVO'}, {tipo:'COLAPSO_INFINITO'} ],
      ROSTO: [ {tipo:'IMPACTO_ROTACIONAL'}, {tipo:'VORTEX_DESTRUTIVO'}, {tipo:'COLAPSO_INFINITO'} ],
      PESCOCO: [ {tipo:'IMPACTO_ROTACIONAL'}, {tipo:'VORTEX_DESTRUTIVO'}, {tipo:'COLAPSO_INFINITO'} ],
      TORAX: [ {tipo:'TORCAO_MUSCULAR'}, {tipo:'RUPTURA_ORGANICA_ROTACIONAL'}, {tipo:'DESINTEGRACAO_ESPIRAL'} ],
      ABDOMEN: [ {tipo:'TORCAO_MUSCULAR'}, {tipo:'RUPTURA_ORGANICA_ROTACIONAL'}, {tipo:'DESINTEGRACAO_ESPIRAL'} ],
      COSTAS: [ {tipo:'TORCAO_MUSCULAR'}, {tipo:'RUPTURA_ORGANICA_ROTACIONAL'}, {tipo:'DESINTEGRACAO_ESPIRAL'} ],
      BRACOS: [ {tipo:'FRATURA_EXPLOSIVA'}, {tipo:'DESTRUICAO_MEMBRO'}, {tipo:'OBLITERACAO_TOTAL'} ],
      PERNAS: [ {tipo:'FRATURA_EXPLOSIVA'}, {tipo:'DESTRUICAO_MEMBRO'}, {tipo:'OBLITERACAO_TOTAL'} ],
      MAOS: [ {tipo:'FRATURA_EXPLOSIVA'}, {tipo:'DESTRUICAO_MEMBRO'}, {tipo:'OBLITERACAO_TOTAL'} ],
      PES: [ {tipo:'FRATURA_EXPLOSIVA'}, {tipo:'DESTRUICAO_MEMBRO'}, {tipo:'OBLITERACAO_TOTAL'} ]
    },
    STARPLATINUM: {
      CABECA: [ {tipo:'IMPACTO_EXPLOSIVO'}, {tipo:'PULVERIZACAO_FACIAL'}, {tipo:'OBLITERACAO_TOTAL'} ],
      ROSTO: [ {tipo:'IMPACTO_EXPLOSIVO'}, {tipo:'PULVERIZACAO_FACIAL'}, {tipo:'OBLITERACAO_TOTAL'} ],
      PESCOCO: [ {tipo:'IMPACTO_EXPLOSIVO'}, {tipo:'PULVERIZACAO_FACIAL'}, {tipo:'OBLITERACAO_TOTAL'} ],
      TORAX: [ {tipo:'IMPACTO_EXPLOSIVO'}, {tipo:'PULVERIZACAO_FACIAL'}, {tipo:'OBLITERACAO_TOTAL'} ],
      ABDOMEN: [ {tipo:'IMPACTO_EXPLOSIVO'}, {tipo:'PULVERIZACAO_FACIAL'}, {tipo:'OBLITERACAO_TOTAL'} ],
      COSTAS: [ {tipo:'IMPACTO_EXPLOSIVO'}, {tipo:'PULVERIZACAO_FACIAL'}, {tipo:'OBLITERACAO_TOTAL'} ],
      BRACOS: [ {tipo:'FRATURA_EXPLOSIVA'}, {tipo:'DESTRUICAO_MEMBRO'}, {tipo:'OBLITERACAO_TOTAL'} ],
      PERNAS: [ {tipo:'FRATURA_EXPLOSIVA'}, {tipo:'DESTRUICAO_MEMBRO'}, {tipo:'OBLITERACAO_TOTAL'} ],
      MAOS: [ {tipo:'FRATURA_EXPLOSIVA'}, {tipo:'DESTRUICAO_MEMBRO'}, {tipo:'OBLITERACAO_TOTAL'} ],
      PES: [ {tipo:'FRATURA_EXPLOSIVA'}, {tipo:'DESTRUICAO_MEMBRO'}, {tipo:'OBLITERACAO_TOTAL'} ]
    },
    HAMON: {
      CABECA: [ {tipo:'CHOQUE_DE_HAMON'}, {tipo:'EBULICAO_INTERNA'}, {tipo:'DECOMPOSICAO_ACELERADA'} ],
      ROSTO: [ {tipo:'CHOQUE_DE_HAMON'}, {tipo:'EBULICAO_INTERNA'}, {tipo:'DECOMPOSICAO_ACELERADA'} ],
      PESCOCO: [ {tipo:'CHOQUE_DE_HAMON'}, {tipo:'EBULICAO_INTERNA'}, {tipo:'DECOMPOSICAO_ACELERADA'} ],
      TORAX: [ {tipo:'CHOQUE_DE_HAMON'}, {tipo:'EBULICAO_INTERNA'}, {tipo:'DECOMPOSICAO_ACELERADA'} ],
      ABDOMEN: [ {tipo:'CHOQUE_DE_HAMON'}, {tipo:'EBULICAO_INTERNA'}, {tipo:'DECOMPOSICAO_ACELERADA'} ],
      COSTAS: [ {tipo:'CHOQUE_DE_HAMON'}, {tipo:'EBULICAO_INTERNA'}, {tipo:'DECOMPOSICAO_ACELERADA'} ],
      BRACOS: [ {tipo:'SOBRECARGA_NEURAL'}, {tipo:'FRATURA_INTERNA_EXPLOSIVA'}, {tipo:'VAPORIZACAO_HAMONICA'} ],
      PERNAS: [ {tipo:'SOBRECARGA_NEURAL'}, {tipo:'FRATURA_INTERNA_EXPLOSIVA'}, {tipo:'VAPORIZACAO_HAMONICA'} ],
      MAOS: [ {tipo:'SOBRECARGA_NEURAL'}, {tipo:'FRATURA_INTERNA_EXPLOSIVA'}, {tipo:'VAPORIZACAO_HAMONICA'} ],
      PES: [ {tipo:'SOBRECARGA_NEURAL'}, {tipo:'FRATURA_INTERNA_EXPLOSIVA'}, {tipo:'VAPORIZACAO_HAMONICA'} ]
    }
  };

  const tiposDePadrao = {
    0: { tipo: 'nenhum', nome: 'Sem Sangramento Visível', volume: 0, dispersao: 0 },
    1: { tipo: 'gotejamento', volume: 5, dispersao: 0.10, nome: 'Gotejamento Leve (Localizado)' },
    2: { tipo: 'gotejamento_medio', volume: 15, dispersao: 0.30, nome: 'Gotejamento Moderado (Localizado)' },
    3: { tipo: 'impacto', volume: 25, dispersao: 0.60, nome: 'Impacto de Média Velocidade' },
    4: { tipo: 'impacto_forte', volume: 40, dispersao: 1.20, nome: 'Impacto Forte' },
    5: { tipo: 'jato_arterial', volume: 40, dispersao: 1.50, nome: 'Jato Arterial (Spurting)' },
    6: { tipo: 'nevoa_media', volume: 150, dispersao: 2.00, nome: 'Névoa de Alta Velocidade' },
    7: { tipo: 'nevoa_densa', volume: 250, dispersao: 2.50, nome: 'Névoa Densa de Alta Velocidade' }
  };

  function obterParametros() {
    const perfilArma = perfisDeSangramento[ferramentaAtual.toUpperCase()];
    if (!perfilArma) return tiposDePadrao[0];

    const niveis = perfilArma[regiaoAtual];
    if (!niveis) return tiposDePadrao[0];

    if (Array.isArray(niveis) && typeof niveis[0] === "object" && niveis[0].tipo) {
      const jojoTipo = niveis[forceLevel - 1] || niveis[0];
      return tiposJoJo[jojoTipo.tipo] || tiposDePadrao[0];
    }

    let nivelDeSangramento;
    if (ferramentaAtual === 'pistola' || (ferramentaAtual === 'faca' && ['BRACOS', 'PERNAS', 'PESCOCO'].includes(regiaoAtual))) {
      nivelDeSangramento = niveis[Math.floor(Math.random() * niveis.length)];
    } else {
      nivelDeSangramento = niveis[forceLevel - 1];
    }
    return tiposDePadrao[nivelDeSangramento] || tiposDePadrao[0];
  }

  function quantidadeAleatoria(volumeBase) {
    const min = Math.floor(volumeBase * 0.8);
    const max = Math.ceil(volumeBase * 1.2);
    if (max < 1) return 0;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function calcularAnaliseMancha(width, length, origem, x, y) {
    const angleRad = Math.asin(width / length);
    const angleDeg = angleRad * (180 / Math.PI);
    const dx = x - origem.x;
    const dy = y - origem.y;
    const directionRad = Math.atan2(dy, dx);
    const directionDeg = directionRad * (180 / Math.PI);
    const area = Math.PI * (width/2) * (length/2);
    return {
      angleDeg: isNaN(angleDeg) ? null : angleDeg,
      directionDeg,
      area
    };
  }
  function calcularPontoOrigem(anguloImpactoRad, distancia) {
    return distancia * Math.tan(anguloImpactoRad);
  }
  
  function simularPadrao(clickX, clickY, parametros) {
    if (parametros.tipo === 'nenhum') return { n: 0, analises: [] };
    let numeroDeGotas = quantidadeAleatoria(parametros.volume);
    if (numeroDeGotas < 1) numeroDeGotas = 1;
    let analises = [];

    for (let i = 0; i < numeroDeGotas; i++) {
        let mancha;
        const origemMancha = { x: origem.x, y: origem.y, z: origem.z };
        const { mancha: manchaBase } = calcularPropriedadesImpacto(clickX, clickY, origemMancha);
        
        const isJojo = ['steelball', 'starplatinum', 'hamon'].includes(ferramentaAtual);

        if (isJojo) {
            // Lógica para o Estilo Anime: partículas maiores e mais dramáticas
            const anguloDispersao = Math.random() * 2 * Math.PI;
            const raioDispersao = Math.pow(Math.random(), 0.5) * parametros.dispersao;
            const x = clickX + Math.cos(anguloDispersao) * raioDispersao;
            const y = clickY + Math.sin(anguloDispersao) * raioDispersao;
            
            const comprimento = 0.04 + Math.random() * 0.15;
            const largura = comprimento * (0.4 + Math.random() * 0.5);
            
            mancha = { ...manchaBase, x, y, comprimento, largura, tipo: 'gota', opacity: 0.85 + Math.random() * 0.15, origem: origemMancha };

        } else if (parametros.tipo === 'jato_arterial') {
            const progress = i / numeroDeGotas;
            const arcX = clickX + progress * parametros.dispersao - (parametros.dispersao / 2);
            const arcY = clickY - Math.sin(progress * Math.PI) * (parametros.dispersao * 0.4);
            mancha = { ...manchaBase, x: arcX, y: arcY, comprimento: 0.15 + Math.random() * 0.05, largura: 0.10 + Math.random() * 0.05, tipo: 'gota', origem: origemMancha };
        } else if (parametros.tipo.includes('nevoa')) {
            const anguloDispersao = Math.random() * 2 * Math.PI;
            const raioDispersao = Math.random() * parametros.dispersao;
            mancha = { ...manchaBase, x: clickX + Math.cos(anguloDispersao) * raioDispersao, y: clickY + Math.sin(anguloDispersao) * raioDispersao, comprimento: 0.01 + Math.random() * 0.02, largura: 0.01 + Math.random() * 0.02, tipo: 'nevoa', highlight: 0, opacity: 0.7, origem: origemMancha };
        } else if (parametros.tipo.includes('gotejamento')) {
            mancha = { ...manchaBase, x: clickX + (Math.random() - 0.5) * parametros.dispersao, y: clickY + (Math.random() - 0.5) * parametros.dispersao, comprimento: 0.2 + Math.random() * 0.1, largura: 0.18 + Math.random() * 0.08, tipo: 'gota', origem: origemMancha };
        } else { // Padrão de impacto default
            const dispersao = parametros.dispersao || 0.6;
            const clusterX = clickX + (Math.random() - 0.5) * dispersao;
            const clusterY = clickY + (Math.random() - 0.5) * dispersao;
            const { mancha: manchaCalculada } = calcularPropriedadesImpacto(clusterX, clusterY, origemMancha);
            mancha = { ...manchaCalculada, origem: origemMancha };
        }

      
        if (!mancha.corBase) mancha.corBase = [130 + Math.random() * 30, 0, 0];
        mancha.timestamp = Date.now();
        
        let width = mancha.largura;
        let length = mancha.comprimento;
        if (width > length) [width, length] = [length, width];

        const analise = calcularAnaliseMancha(width, length, origemMancha, mancha.x, mancha.y);
        analise.distancia = Math.sqrt(Math.pow(mancha.x - origemMancha.x, 2) + Math.pow(mancha.y - origemMancha.y, 2));
        analise.alturaOrigem = calcularPontoOrigem((analise.angleDeg || 0) * (Math.PI/180), analise.distancia);
        mancha.analise = analise;
        
        analises.push(analise);
        manchas.push(mancha); 
    }
    return { n: numeroDeGotas, analises };
}

  function calcularPropriedadesImpacto(x, y, origemRef) {
    const origemUsar = origemRef || origem;
    const dx = x - origemUsar.x;
    const dy = y - origemUsar.y;
    const distanciaNoPlano = Math.sqrt(dx * dx + dy * dy) || 1;
    const alfa = Math.atan(origemUsar.z / distanciaNoPlano);
    const comprimentoBase = pxToMeters(canvas.width) * 0.035;
    const comprimento = comprimentoBase + Math.random() * (comprimentoBase * 0.4);
    const largura = Math.max(0.05, comprimento * Math.sin(alfa));
    const offsets = Array.from({length: 3}, () => ({ x: (Math.random() - 0.5) * 0.04, y: (Math.random() - 0.5) * 0.04 }));
    const espiculas = [];
    const numeroDeEspiculas = 5 + Math.floor(Math.random() * 10);
    for (let i = 0; i < numeroDeEspiculas; i++) {
      const angulo = (Math.random() - 0.5) * Math.PI * 0.8;
      const startX = Math.cos(angulo) * (comprimento / 2);
      const startY = Math.sin(angulo) * (largura / 2);
      espiculas.push({ startX, startY, endX: startX * (1 + Math.random() * 0.3), endY: startY * (1 + Math.random() * 0.3), lineWidth: Math.random() * 0.015 + 0.005 });
    }
    const mancha = { x, y, comprimento, largura, offsets, espiculas, tipo: 'impacto', highlight: 1.0, opacity: 1.0 };
    return { mancha, distanciaNoPlano, alfa, comprimento, largura };
  }

  // --- ANIMAÇÃO E DESENHO ---
  function loopDeAnimacao() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (mostrarTrajetorias) {
      ctx.save();
      ctx.strokeStyle = 'rgba(35,199,237,0.65)';
      ctx.setLineDash([7, 7]);
      ctx.lineWidth = 2;
      manchas.forEach(m => {
        if (!m.origem) return;
        ctx.beginPath();
        ctx.moveTo(metersToPx(m.x), metersToPx(m.y));
        ctx.lineTo(metersToPx(m.origem.x), metersToPx(m.origem.y));
        ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.restore();
    }

    drawPersonAtOrigin();
    drawOriginPoint();
    for (let i = manchas.length - 1; i >= 0; i--) {
      const mancha = manchas[i];
      const age = Math.min((Date.now() - mancha.timestamp) / 5000, 1);
      if (age > 0) {
        let [r, g, b] = mancha.corBase;
        r = Math.max(80, r - 80 * age);
        g = 0;
        b = 0;
        mancha.corBaseAged = [r, g, b];
      } else {
        mancha.corBaseAged = mancha.corBase;
      }
      let dx = metersToPx(mancha.x) - lanternX;
      let dy = metersToPx(mancha.y) - lanternY;
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (isLanternActive && dist < 140) {
        ctx.shadowColor = "rgba(255,255,200,0.57)";
        ctx.shadowBlur = 30 - dist * 0.18;
      } else {
        ctx.shadowBlur = 0;
      }
      if (mancha.highlight > 0) mancha.highlight -= 0.016;
      desenharMancha(mancha);
      ctx.shadowBlur = 0;
    }

    if (isLanternActive) {
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "lighter";
      let radius = Math.max(canvas.width, canvas.height) * 0.15;
      let grad = ctx.createRadialGradient(
        lanternX, lanternY, radius * 0.2,
        lanternX, lanternY, radius
      );
      grad.addColorStop(0, "rgba(255,255,255,0.11)");
      grad.addColorStop(0.35, "rgba(255,255,220,0.085)");
      grad.addColorStop(1, "rgba(255,255,240,0.01)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(lanternX, lanternY, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      ctx.restore();
    }

    requestAnimationFrame(loopDeAnimacao);
  }

  function drawOriginPoint() {
    ctx.save();
    ctx.beginPath();
    ctx.arc(metersToPx(origem.x), metersToPx(origem.y), 10, 0, 2 * Math.PI, false);
    ctx.fillStyle = draggingOrigin ? "#e63946" : '#fff';
    ctx.strokeStyle = '#e63946';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 0;
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawPersonAtOrigin() {
    if (!pessoaImgCarregada) return;
    const altura = canvas.height * 0.55;
    const largura = altura * (pessoaImg.width / pessoaImg.height);
    const x = metersToPx(origem.x) - largura / 2;
    const y = metersToPx(origem.y) - altura * 0.45;
    ctx.save();
    ctx.globalAlpha = 0.98;
    ctx.drawImage(pessoaImg, x, y, largura, altura);
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function desenharMancha(mancha) {
    ctx.save();
    ctx.fillStyle = `rgba(${mancha.corBaseAged?.[0] || mancha.corBase[0]}, ${mancha.corBaseAged?.[1] || mancha.corBase[1]}, ${mancha.corBaseAged?.[2] || mancha.corBase[2]}, ${mancha.opacity})`;
    if (mancha.highlight > 0) {
      ctx.shadowColor = `rgba(255, 80, 80, ${mancha.highlight})`;
      ctx.shadowBlur = 25;
    }
    let origemDestaMancha = mancha.origem || origem;
    // Para o estilo 'anime', usamos a rotação para simular jatos
    if (mancha.tipo === 'impacto' || mancha.tipo === 'gota') {
      const anguloCorreto = Math.atan2(mancha.y - origemDestaMancha.y, mancha.x - origemDestaMancha.x);
      ctx.save();
      ctx.translate(metersToPx(mancha.x), metersToPx(mancha.y));
      ctx.rotate(anguloCorreto);
      
      // DElipse principal da gota/mancha
      ctx.beginPath();
      ctx.ellipse(0, 0, metersToPx(mancha.comprimento / 2), metersToPx(mancha.largura / 2), 0, 0, 2 * Math.PI);
      ctx.fill();

      if (mancha.espiculas) {
          mancha.offsets.forEach(offset => {
              ctx.beginPath();
              ctx.ellipse(metersToPx(offset.x), metersToPx(offset.y), metersToPx(mancha.comprimento / 2), metersToPx(mancha.largura / 2), 0, 0, 2 * Math.PI);
              ctx.fill();
          });
          ctx.strokeStyle = ctx.fillStyle;
          mancha.espiculas.forEach(espicula => {
              ctx.beginPath();
              ctx.moveTo(metersToPx(espicula.startX), metersToPx(espicula.startY));
              ctx.lineTo(metersToPx(espicula.endX), metersToPx(espicula.endY));
              ctx.lineWidth = metersToPx(espicula.lineWidth);
              ctx.stroke();
          });
      }
      ctx.restore();
    } else { // Desenho névoa
      ctx.beginPath();
      ctx.ellipse(metersToPx(mancha.x), metersToPx(mancha.y), metersToPx(mancha.comprimento / 2), metersToPx(mancha.largura / 2), 0, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.restore();
  }

  // --- TOOLTIP DE MANCHAS ---
  let hoveredMancha = null;
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = pxToMeters((e.clientX - rect.left) * scaleX);
    const my = pxToMeters((e.clientY - rect.top) * scaleY);
    hoveredMancha = null;
    for (let i = manchas.length - 1; i >= 0; i--) {
      const mancha = manchas[i];
      const dx = mx - mancha.x;
      const dy = my - mancha.y;
      if ((dx * dx) / ((mancha.comprimento/2) ** 2) + (dy * dy) / ((mancha.largura/2) ** 2) <= 1) {
        hoveredMancha = mancha;
        break;
      }
    }
    if (hoveredMancha) {
      tooltip.style.display = 'block';
      const a = hoveredMancha.analise;
      tooltip.innerHTML = `
        <b>Mancha Individual</b><br>
        Ângulo: <b>${a.angleDeg ? a.angleDeg.toFixed(2) : '—'}°</b> <br>
        Direção: <b>${a.directionDeg ? a.directionDeg.toFixed(1) : '—'}°</b><br>
        Área: <b>${a.area ? a.area.toFixed(4) : '—'} m²</b><br>
        Distância: <b>${a.distancia ? a.distancia.toFixed(3) : '—'} m</b><br>
        <small>Clique para fixar detalhes dessa mancha no painel.</small>
      `;
      tooltip.style.left = (e.clientX + 12) + 'px';
      tooltip.style.top = (e.clientY + 12) + 'px';
      canvas.style.cursor = "pointer";
    } else {
      tooltip.style.display = 'none';
      canvas.style.cursor = draggingOrigin ? "grabbing" : "default";
    }
  });
  canvas.addEventListener('mouseleave', () => {
    tooltip.style.display = 'none';
    hoveredMancha = null;
  });
  canvas.addEventListener('click', (e) => {
    if (hoveredMancha) {
      atualizarPaineis(null, 0, 0, { n: 1, analises: [hoveredMancha.analise] }, hoveredMancha);
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = pxToMeters((e.clientX - rect.left) * scaleX);
    const y = pxToMeters((e.clientY - rect.top) * scaleY);

    if (draggingOrigin) {
      origem.x = x;
      origem.y = y;
      draggingOrigin = false;
      canvas.style.cursor = "default";
      return;
    }
    const parametros = obterParametros();
    const analiseBatch = simularPadrao(x, y, parametros);
    atualizarPaineis(parametros, x, y, analiseBatch);
  });

  // --- DRAG E CLICK ---
  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = pxToMeters((e.clientX - rect.left) * scaleX);
    const y = pxToMeters((e.clientY - rect.top) * scaleY);
    if (!draggingOrigin && Math.sqrt((x - origem.x) ** 2 + (y - origem.y) ** 2) < pxToMeters(18)) {
      draggingOrigin = true;
      canvas.style.cursor = "grabbing";
    }
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!draggingOrigin) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = pxToMeters((e.clientX - rect.left) * scaleX);
    const y = pxToMeters((e.clientY - rect.top) * scaleY);
    origem.x = x;
    origem.y = y;
  });

  // --- SLIDERS GRADIENTES E VALORES ---
  function updateSliderBG(slider) {
    const min = Number(slider.min);
    const max = Number(slider.max);
    const val = Number(slider.value);
    const percent = ((val - min) * 100) / (max - min);
    slider.style.backgroundSize = `${percent}% 100%`;
  }
  if (forceSlider) {
    forceSlider.addEventListener('input', () => updateSliderBG(forceSlider));
    updateSliderBG(forceSlider);
  }
  if (distanceSlider && distanceValue) {
    distanceSlider.addEventListener('input', (e) => {
      origem.z = parseFloat(e.target.value);
      distanceValue.textContent = origem.z.toFixed(2).replace('.', ',');
      updateSliderBG(distanceSlider);
      handleUserInteraction();
    });
    distanceValue.textContent = origem.z.toFixed(2).replace('.', ',');
    updateSliderBG(distanceSlider);
  }

  // --- RESTANTE DA UI E INICIALIZAÇÃO ---
  function atualizarPaineis(parametros, clickX, clickY, analiseBatch, manchaIndiv) {
    let arma = ferramentaAtual.charAt(0).toUpperCase() + ferramentaAtual.slice(1);
    let regiao = bodyPartSelect.options[bodyPartSelect.selectedIndex].text;
    let forca = forceValueDisplay.textContent;
    let textoForca = ferramentaAtual !== 'pistola' ? ` com força ${forca.toLowerCase()}` : '';
    if (!manchaIndiv) {
      eventDescription.innerHTML = `
        <p><strong>Cenário Simulado:</strong> ${arma} na região da(o) ${regiao.toLowerCase()}${textoForca}.</p>
        <p><strong>Resultado Esperado:</strong> ${parametros ? parametros.nome : ''}</p>
      `;
    } else {
      eventDescription.innerHTML = `<p><strong>Análise Fixada:</strong> Mancha individual selecionada.</p>`;
    }
    let analise = analiseBatch && analiseBatch.analises && analiseBatch.analises.length ? analiseBatch.analises[0] : null;
    let angle = analise && analise.angleDeg ? analise.angleDeg.toFixed(2) : '—';
    let direction = analise && analise.directionDeg ? analise.directionDeg.toFixed(1) : '—';
    let area = analise && analise.area ? analise.area.toFixed(4) : '—';
    let alturaOrigem = analise && analise.alturaOrigem ? analise.alturaOrigem.toFixed(3) : '—';
    let interpretacao = '';
    if (analise && analise.angleDeg !== undefined && analise.angleDeg !== null) {
      if (analise.angleDeg < 35) interpretacao = 'Ângulo agudo: fonte distante e baixa, sangue veio "raspando" a superfície.';
      else if (analise.angleDeg > 65) interpretacao = 'Ângulo obtuso: fonte próxima e alta, sangue veio quase perpendicular à superfície.';
      else interpretacao = 'Ângulo intermediário: fonte a uma distância e altura moderada.';
    }
    infoContent.innerHTML = `
      <div class="info-group">
        <p><strong>Análise do Padrão</strong></p>
        <code class="calculation">↳ Quantidade Aproximada Gerada: <span class="result">${analiseBatch ? analiseBatch.n : '-'}</span></code>
      </div>
      <div class="info-group">
        <p><strong>Ângulo de Impacto</strong></p>
        <code class="calculation">↳ θ = arcsin (width / length) = <span class="result">${angle}°</span></code>
        <span style="color:#aaa">${interpretacao}</span>
      </div>
      <div class="info-group">
        <p><strong>Direção da Mancha</strong></p>
        <code class="calculation">↳ Direção = <span class="result">${direction}°</span> em relação ao eixo X</code>
      </div>
      <div class="info-group">
        <p><strong>Área da Mancha</strong></p>
        <code class="calculation">↳ Área ≈ <span class="result">${area} m²</span></code>
      </div>
      <div class="info-group">
        <p><strong>Altura do Ponto de Origem</strong></p>
        <code class="calculation">↳ altura = distância * tan(θ) ≈ <span class="result">${alturaOrigem} m</span></code>
      </div>
    `;
  }

  forceSlider.addEventListener('input', (e) => {
    forceLevel = parseInt(e.target.value);
    const levels = { 1: 'Baixa', 2: 'Média', 3: 'Alta' };
    forceValueDisplay.textContent = levels[forceLevel];
    handleUserInteraction();
  });
  bodyPartSelect.addEventListener('input', (e) => {
    regiaoAtual = e.target.value.toUpperCase();
    handleUserInteraction();
  });
  clearButton.addEventListener('click', () => {
    manchas = [];
    infoContent.innerHTML = '';
    eventDescription.innerHTML = '<p class="placeholder">Selecione as opções e clique na parede para simular.</p>';
  });
  function handleUserInteraction() {
      const parametros = obterParametros();
      let volumeExibido = parametros.volume;
      atualizarPaineis(parametros, 0, 0, { n: volumeExibido, analises: [] });
      infoContent.innerHTML = '<p class="placeholder">Clique no canvas para simular o impacto.</p>';
  }
  function inicializar() {
    renderSetsToolbar();
    forceSlider.dispatchEvent(new Event('input'));
    if (distanceSlider) distanceSlider.dispatchEvent(new Event('input'));
    handleUserInteraction();
    loopDeAnimacao();
  }
  inicializar();
});
