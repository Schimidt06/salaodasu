// Catálogo Direto de Serviços Capilares - Suellen Bailon (Solari)
const SERVICES_DATA = [
  {
    category: "Mechas & Iluminação",
    items: [
      { id: "morena-iluminada", name: "Morena Iluminada", desc: "Pontos de luz sutis e elegantes em cabelos escuros/castanhos." },
      { id: "mechas-loiras", name: "Loiras / Mechas Globais", desc: "Clareamento mais evidente e uniforme dos fios." },
      { id: "balayage", name: "Balayage / Mechas Criativas", desc: "Degradê suave e moderno com raiz esfumada." },
      { id: "babylights", name: "Babylights (Micro Mechas)", desc: "Luminosidade delicada desde a raiz." },
      { id: "contorno-iluminado", name: "Contorno Iluminado", desc: "Luzes focadas na moldura do rosto." },
      { id: "retoque-mechas", name: "Retoque de Mechas", desc: "Manutenção do crescimento da raiz." },
      { id: "correcao-cor", name: "Correção de Cor / Manchas", desc: "Harmonização de tons ou manchas indesejadas." }
    ]
  },
  {
    category: "Cortes",
    items: [
      { id: "corte-personalizado", name: "Corte Feminino / Visagismo", desc: "Definição do formato ideal para o seu rosto e estilo." },
      { id: "corte-camadas", name: "Corte em Camadas / Repicado", desc: "Mais leveza, movimento e distribuição de volume." },
      { id: "corte-pontas", name: "Corte de Pontas / Bordado", desc: "Elimina pontas duplas sem tirar o comprimento." },
      { id: "corte-bob", name: "Bob / Long Bob / Chanel", desc: "Corte estruturado, reto ou assimétrico." },
      { id: "corte-franja", name: "Corte ou Design de Franja", desc: "Criação ou manutenção de franja." },
      { id: "corte-cachos", name: "Corte para Cabelo Cacheado / Crespo", desc: "Corte a seco respeitando a curvatura natural." },
      { id: "corte-curto", name: "Corte Curto / Pixie", desc: "Visual moderno e prático em comprimento curto." }
    ]
  },
  {
    category: "Tratamentos & Recuperação",
    items: [
      { id: "cronograma", name: "Cronograma Capilar Completo", desc: "Hidratação + Nutrição + Reconstrução." },
      { id: "reconstrucao", name: "Reconstrução / Cauterização", desc: "Recuperação de fios quebradiços, finos ou elásticos." },
      { id: "nutricao", name: "Nutrição Lipídica (Anti-Ressecamento)", desc: "Reposição de óleos para dar emoliência e tirar frizz." },
      { id: "hidratacao", name: "Hidratação Profunda", desc: "Devolve água, brilho e maciez imediata." },
      { id: "pos-quimica", name: "Tratamento Pós-Química / SOS Loiro", desc: "Restauração do pH e força após descoloração." },
      { id: "detox", name: "Detox Capilar / Couro Cabeludo", desc: "Limpeza profunda e controle de oleosidade." }
    ]
  },
  {
    category: "Alinhamento & Alisamento",
    items: [
      { id: "progressiva", name: "Progressiva / Alinhamento Orgânico", desc: "Liso duradouro com balanço e brilho." },
      { id: "botox", name: "Botox Capilar / Blindagem", desc: "Redução de volume e controle do frizz sem alisar 100%." },
      { id: "selagem", name: "Selagem Térmica", desc: "Fechamento de cutículas e disciplina dos fios." },
      { id: "retoque-liso", name: "Retoque de Raiz (Alinhamento)", desc: "Alinhamento apenas no crescimento novo." }
    ]
  },
  {
    category: "Coloração & Tonalização",
    items: [
      { id: "coloracao-global", name: "Coloração Global (Cabelo Todo)", desc: "Mudança ou uniformização da cor em todo o comprimento." },
      { id: "retoque-raiz", name: "Retoque de Raiz", desc: "Manutenção da cor e cobertura de crescimento." },
      { id: "cobertura-brancos", name: "Cobertura de Fios Brancos", desc: "Pigmentação uniforme para cobrir 100% dos brancos." },
      { id: "tonalizacao", name: "Tonalização / Banho de Brilho", desc: "Realça o brilho e renova a cor sem amônia." },
      { id: "matizacao", name: "Matização de Loiros", desc: "Neutraliza o tom amarelado ou alaranjado." }
    ]
  },
  {
    category: "Alongamento (Mega Hair)",
    items: [
      { id: "mega-avaliacao", name: "Avaliação para Mega Hair", desc: "Análise de quantidade de mechas, cor e método." },
      { id: "mega-queratina", name: "Aplicação (Cápsulas de Queratina)", desc: "Alongamento mecha a mecha com acabamento natural." },
      { id: "mega-manutencao", name: "Manutenção de Mega Hair", desc: "Retirada, limpeza e recolocação das mechas." },
      { id: "mega-remocao", name: "Remoção Segura de Mega Hair", desc: "Retirada cuidadosa sem danificar os fios naturais." }
    ]
  },
  {
    category: "Escova & Penteados",
    items: [
      { id: "escova-modelada", name: "Escova Modelada / Lisa", desc: "Secagem e finalização com movimento e brilho." },
      { id: "ondas-babyliss", name: "Ondas Babyliss", desc: "Modelagem temporária em ondas ou cachos." },
      { id: "penteado-festa", name: "Penteado Social / Festa", desc: "Preso, semipreso, coque ou trança para eventos." },
      { id: "penteado-noiva", name: "Penteado Noiva / Madrinha", desc: "Produção exclusiva (somente cabelo, sem maquiagem)." },
      { id: "lavagem-especial", name: "Lavagem com Massagem Capilar", desc: "Higienização no lavatório com relaxamento." }
    ]
  }
];
