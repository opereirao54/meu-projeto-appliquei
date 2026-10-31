---
name: posts-tiktok-pagina-flavio
description: Criar posts virais (foto, carrossel, vídeo curto) para a página de apoiadores de Flávio Bolsonaro no TikTok, a partir das notícias mais recentes e no padrão visual que deu certo.
---

# Posts para a página de apoiadores do Flávio no TikTok

Página de apoiadores (não oficial) de Flávio Bolsonaro no TikTok. O objetivo é engajar a base e ganhar seguidores com posts baseados em fatos verificáveis, sem dar brecha para a página ser derrubada.

Esta skill vive no repositório `opereirao54/meu-projeto-appliquei`, em `.claude/skills/posts-tiktok-pagina-flavio/SKILL.md`. Quando o usuário pedir "atualiza a skill" ou surgir um aprendizado concreto (resultado de post, formato novo, regra nova), edite este arquivo, faça commit no `main` e push. Os scripts de geração ficam em `scripts/` e os posts já feitos em `posts/`.

## 1. Buscar a notícia

- Sempre pesquise antes de criar. O assunto muda de hora em hora, e o usuário pede "algo atualizado".
- Use WebSearch (modo extended para notícias do dia) e abra as matérias com WebFetch para pegar datas, horários e citações exatas.
- Confirme em pelo menos 2 veículos antes de tratar algo como fato. Se só um site publicou, com fontes anônimas, avise e não use como fato.
- Fique atento a boatos já desmentidos (ex.: vídeo antigo de Flávio nos EUA, operação da PF negada pelo STF). Não use.
- Ao trazer notícias, mostre o resumo com datas, o que ainda não está confirmado e a lista de fontes.
- Notícia tem que ser recente: priorize as do dia (ou últimas 24 h) e mostre a data/hora de cada uma. Não apresente como novidade algo de 2–3 dias atrás; se usar, marque como "contexto".
- Quando o usuário pedir só as notícias, não crie a arte: traga as notícias, diga quais são fortes para a página (e por quê) e espere ele pedir o post.
- Responda sempre em português.

## 2. O que performa (dados da própria página)

Métricas completas dos dois melhores posts (29/10, 7h30):

| | Interpol (notícia) | Carta (fala dele) |
|---|---|---|
| Views | 11,4 mil | 4,1 mil |
| Curtidas | 89 (0,8%) | 376 (9,3%) |
| Comentários | 24 | 61 |
| Compartilhamentos | 12 | 4 |
| Salvamentos | 4 | 19 |
| Novos seguidores | 15 (1,3 a cada mil views) | 58 (14 a cada mil views) |
| Tempo médio por view | ~9 s | ~11 s |

- A notícia alcança quase 3× mais e é mais compartilhada; a fala dele converte ~11× mais em seguidores, curtidas e salvamentos.
- Nos dois, o pico durou só algumas horas e depois zerou: cada post vive pouco, por isso o ritmo diário e o timing importam.

Visualizações no perfil em 29/10 de manhã:

| Post | Formato | Capa | Views |
|---|---|---|---|
| Carta "Saí do Brasil…" | foto única | rosto do Flávio grande + frase dele | 4.051 |
| Interpol | foto única | rosto do Flávio + card + "59,8 milhões" | 11.500 |
| Trump "boas pessoas" | foto única | desembarque (pessoas pequenas) | 1.413 |
| 7 minutos | foto única | rosto do Flávio + número gigante | 971 |
| "O discurso é democracia" (1º post) | foto única | rosto + print + passaporte | 961 |
| Carrossel "Não é fuga. É exílio." | carrossel 7 fotos | desembarque, sem rosto | 45 |
| Vídeo do debate | vídeo 64 s | frame largo do debate | ~30 |

- **Capa com o rosto do Flávio grande é o que mais segura o scroll.** As capas sem rosto (desembarque visto de longe) foram as mais fracas.
- **Foto única > carrossel longo > vídeo com trecho de TV**, até agora. Carrossel só com capa forte (rosto + frase) e no máximo 3–4 fotos. Vídeo com imagem da Band provavelmente foi limitado por direitos autorais; preferir vídeo só com cartões e narração.
- Ritmo: 3–5 posts por dia nos picos (7h–9h, 12h–14h, 19h–22h), sem dois no mesmo horário; notícia grande fura o calendário (postar em até 1 h). Não repostar a mesma imagem. Não apagar os que não pegaram.
- Medir a primeira hora: >500 views → responder comentários e fixar um; <200 → anotar o que era diferente.

- **Notícia urgente traz alcance.** Card com "URGENTE", data e fonte; um número forte (ex.: "59,8 milhões de votos"); contraste em uma linha; pergunta de uma palavra no fim ("PERSEGUIÇÃO?").
- **Fala do Flávio em primeira pessoa traz seguidores.** Frase emocional dele em destaque + pergunta de lado ("VOCÊ ESTÁ COM ELE?").
- Alterne os dois tipos (um de cada por dia é um bom ritmo).
- Poste no pico: até 1–2 horas depois de a notícia ou a fala sair.
- Carrossel com 2+ fotos faz o TikTok medir retenção; bom para "resumo do caso". 99% do tráfego vem do "Para você", então repetir um fato forte num carrossel não é problema.
- Responder comentários nas primeiras horas reativa o post.

### Referências de outras páginas que bombaram (29/10)

| Post | Curtidas | Formato | Verdadeiro? |
|---|---|---|---|
| Goiás News: "a caneta de Moraes não alcançou os EUA… Flávio chegou em segurança" | 122,6 mil | print estilo tweet + foto do Flávio sorrindo/acenando | Baseado em fala de Simón Levy; "proteção americana" não confirmada |
| Mendonça ganha 1,3 mi de seguidores e "supera Messi" | 74,5 mil | foto + manchete amarela/branca grande | Crescimento real; parte inflada por perfis reciclados (Aos Fatos) |
| GT News: "EUA preparam proteção para Flávio" | 52,3 mil | print estilo tweet + Trump/bandeira/Flávio | Não confirmado |
| Mensagens "não confio no Mendonça… só fala de Deus" | 28,7 mil | print de "vazamento" | **Falso** (Aos Fatos) |
| "7 países não aceitam mais pedidos do STF" | 10,4 mil | texto longo + foto | Sem confirmação; tem cara de boato |

Lições:
- **Clima de vitória engaja mais que lamento.** Os maiores ("chegou em segurança", "a caneta não alcançou") vendem a sensação de que o lado deles está ganhando. Use fatos verdadeiros nesse tom (ex.: "Em segurança em Miami, com visto dos EUA").
- **Foto do Flávio sorrindo/acenando** (positiva) em vez de séria/tensa.
- **Formato "print de tweet"** (logo, nome, "🚨 AGORA:" + uma frase) parece notícia quente. Use com o nome da própria página, nunca imitando perfil de terceiros ou veículo.
- **Curiosidade/comparação inesperada** ("supera Messi") puxa clique.
- Boa parte dos virais é falsa ou exagerada. A vantagem da página é usar o mesmo formato com fato verdadeiro e fonte — posts falsos sobre Flávio já foram removidos por ordem judicial.

### Plano diário e ações de alcance

- Viral depende de notícia grande: nos dias fracos, garantir constância (3 posts) e guardar energia para o pico.
- Horários: 7h–9h (notícia da manhã), 12h–13h (fala/frase dele), 19h–21h (post mais forte do dia, de preferência carrossel curto com rosto na capa). Notícia grande fura o horário: postar em até 30–60 min.
- Ser o primeiro: alertas/notificações ligadas nos perfis de Flávio, Eduardo e de repórteres de política; Google Alerts para "Flávio Bolsonaro".
- Som em alta nos posts de foto (o modo foto aceita música e ganha alcance).
- Legenda com termos que o público pesquisa ("Flávio Bolsonaro Miami", "onde está Flávio", "passaporte Flávio").
- Responder comentários na 1ª hora, inclusive com "responder com vídeo"/foto; fixar o melhor comentário.
- Comentar cedo e com conteúdo nos posts virais de páginas grandes do mesmo nicho (leva gente ao perfil).
- Séries ("Dia 3 em Miami", "O que mudou desde domingo") criam hábito de voltar ao perfil.
- Não fazer: comprar seguidores, follow/unfollow em massa, repostar a mesma imagem, mais de ~6 posts/dia, conteúdo falso.

## 3. Padrão visual

- Formato vertical 1080×1920 (PNG para foto/carrossel; MP4 H.264 30 fps para vídeo).
- Fundo escuro (#0C0C0C) com brilho difuso verde/amarelo no topo e granulado leve.
- Fonte: DejaVu Sans Condensed Bold para títulos, Condensed regular para texto de apoio.
- Cores: amarelo #F5C400 (faixa com texto preto), vermelho #B21218 (faixa com texto branco), azul-marinho #14285F no cabeçalho de cards de notícia "neutros"/EUA.
- Faixas com bordas "pinceladas" atrás das palavras-chave.
- Estrutura de foto única:
  1. Foto no topo (~864 px) com degradê para o fundo.
  2. Selo opcional no topo (ex.: "URGENTE · MIAMI").
  3. Card de notícia claro (#F6F4EE), cabeçalho colorido com rótulo + data, manchete em 3 linhas, linha de apoio, "Fonte: ...".
  4. Frase forte em branco + faixa amarela.
  5. Pergunta curta em faixa vermelha.
  6. Crédito da imagem no rodapé ("Imagem: TV Band", "Imagem: reprodução g1").
- **Logo da página:** `assets/logo_pagina.jpg` (selo redondo "USA & Brazil Visit · Flavio Bolsonaro"). Usar sempre como avatar no formato "print de tweet" (recortado em círculo), ao lado de "FlavioBolsonaroUSA" / "Página de apoiadores". Sem selo de verificado. Script de referência: `scripts/posts_estilo_tweet.py`.
- Carrossel: numeração "n/N" no canto, capa com "Arrasta pro lado →", último slide com a pergunta e o rodapé de ressalvas.
- Sempre gere uma prévia reduzida e confira se algum texto vaza da largura; reduza a fonte se vazar.
- Os helpers de desenho (`bar`, `big`, `small`, fundo) estão em `scripts/video_debate.py`; os cards de notícia em `scripts/carrossel_quem_julga.py`.

## 4. Imagens

- Fotos do Flávio: frames do vídeo do debate da Band enviado pelo usuário, ou prints de notícia que ele mandar (recortar só a foto, creditar o veículo).
- Não baixar fotos de figuras públicas da internet. Se o usuário quiser foto de outra pessoa (ex.: Trump, Moraes), sugerir sobrepor uma imagem oficial no editor do TikTok.
- Não usar imagens geradas por IA de pessoas reais (ex.: Flávio com Trump em cena que não aconteceu), nem quando o usuário mandar. Se uma foto parecer IA, perguntar a origem antes de usar. Fotos antigas reais podem ser usadas com a data no rodapé.
- Não imitar o visual de portais (g1, CNN etc.). O card é design próprio, com a fonte escrita.

## 5. Legenda e hashtags

- Legenda no estilo das páginas virais (Goiás News, Helbert Dias), mais completa, como matéria curta:
  1. Linha de selo: "🔴 URGENTE | POLÍTICA" (ou "INTERNACIONAL", "STF"…).
  2. Manchete em CAIXA ALTA com a frase/fato principal.
  3. 1º parágrafo: quem, o quê, quando e onde, citando o veículo ("Segundo o Metrópoles, …").
  4. 2º parágrafo: contexto (o que aconteceu antes) em 2–3 frases.
  5. 3º parágrafo (opcional): o que vem depois / o que está em jogo.
  6. Pergunta + chamada ("Comenta 👇 e compartilha").
  7. Hashtags.
  Escrever com os termos que o público pesquisa ("Flávio Bolsonaro Miami", "Rogério Marinho Senado"). Nada de afirmar o que não está confirmado.
- 5–8 hashtags: assunto específico primeiro (#FlávioBolsonaro, #Moraes, #Exílio…), depois nicho (#Oposição, #Bolsonaro) e amplo (#PolíticaBrasileira). No máximo um #fyp.
- Sugerir um comentário fixado (pergunta para puxar debate, ou "tudo aqui tem fonte").

## 6. Vídeo curto

- Cartões com cortes secos, zoom leve e um flash na transição; 2–5 s por cartão conforme a quantidade de texto (a fala precisa ser lida sem pausar).
- Trechos de vídeo de terceiros: recortar só a área do vídeo, manter a frase inteira com contexto, nada de corte que mude o sentido. Forçar 30 fps em todas as partes antes de juntar (evita imagem travada com áudio correndo).
- Trilha sintetizada (grave, batida tipo coração, impactos, sons que sobem) só nos cartões; deixar o áudio original limpo nas falas. Ver `scripts/trilha.py`.
- Entregar o roteiro de narração com os tempos de cada parte.

## 7. Limites que protegem a página

- Tudo que é apresentado como fato precisa ter fonte. Opinião vira pergunta ("Coincidência?", "Dois pesos, duas medidas?") ou conclusão da página ("Não é fuga. É exílio.").
- Não fazer conteúdo que afirme fraude eleitoral, negue o resultado de 2026 ou trate Flávio como "presidente eleito". O TSE proclamou o resultado e o TikTok derruba esse tipo de conteúdo. Ao usar a carta ou falas dele, escolher os trechos sobre oposição, exílio e perseguição.
- Acusações a terceiros (ex.: Moraes no caso Vorcaro) sempre com a ressalva do outro lado no próprio post ("PF não apontou crime; ele nega").
- Não afirmar rota, asilo, prisão ou paradeiro sem confirmação oficial. Se a situação mudar (ex.: prisão decretada), avisar que o post antigo ficou desatualizado.
- Perfil: nome e bio devem deixar claro que é página de apoiadores, não oficial, para evitar derrubada por falsa identidade.
- No fim de cada entrega, dizer em 1–2 frases o contra-argumento que vai aparecer nos comentários, para a página estar preparada.
