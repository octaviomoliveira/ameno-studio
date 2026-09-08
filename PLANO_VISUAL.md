# Plano visual e narrativo v3 — ameno.studio

Status: execução iniciada em 2026-09-08.

Referências principais:

- Elephant Skin: impacto, capítulos visuais e scroll cinematográfico.
- Lircle: proposta explícita, leitura simples, alternância entre texto e imagem e percurso comercial claro.
- Ameno: cotas, símbolo `O`, vermelho, arquitetura, visualização e ferramentas.

## 1. Tese

**Espetáculo na entrada. Clareza no conteúdo.**

A home deixa de apresentar todos os recursos gráficos ao mesmo tempo. Cada tela responde a uma pergunta:

`o que é → por que importa → o que já fez → o que vende → como conversar`

## 2. Percurso definitivo da home

### 00 — Entrada / Da ideia à forma

- Parede escura, cotas técnicas e `O` grafitado pelo cursor.
- Partículas vermelhas como vapor de tinta.
- No celular, pintura automática.
- Função: experiência de marca, não explicação comercial.

### 01 — Promessa / Imaginamos o que ainda não existe

- Imagem ou vídeo fullbleed.
- Cotas técnicas transparentes atrás da manchete e spray vermelho reagindo ao cursor.
- Uma manchete central e dois caminhos: projetos e ferramentas.
- O efeito permanece ambiental e não atravessa a legibilidade da manchete.
- Resposta: o ameno torna visível aquilo que ainda será construído.

### Transição — Disciplinas

- Marquee fina: arquitetura, visualização, interiores, BIM, CGI e ferramentas.
- Baixo contraste; não funciona como nova seção.

### 02 — Princípio / Clareza antes do ruído

- Uma tela editorial clara, sem cards.
- Frase principal: uma imagem só funciona quando torna uma decisão mais clara.
- Contraponto: forma sem intenção é só ruído.
- Resposta: por que o trabalho do estúdio importa.

### 03 — Prova / Projetos que tornam ideias visíveis

- Cabeçalho de capítulo curto, seguido imediatamente pelas imagens.
- Projetos fullbleed e conduzidos pelo scroll.
- Apenas nome, categoria, local, ano e contador sobre a base da imagem.
- Sem índice ou lista de projetos antes das imagens.

### 04 — Produto / Ferramentas que devolvem tempo

- Ameno Cotas com o mesmo peso visual de um projeto.
- Nome, benefício e CTA; sem diagrama na home.
- A captura real do plugin entra quando estiver disponível.
- Resposta: o que o visitante pode comprar agora.

### 05 — Conversa

- Footer expandido com `Tem algo em mente? Vamos conversar →`.
- Email, autoria, localização e links confirmados.
- Substitui integralmente a antiga seção `ContactBand`.

## 3. Estrutura técnica

```text
SiteIntro
HeroSection
Marquee
ApproachStatement
ProjectScroll
PluginsTeaser
Footer
```

O conteúdo detalhado de método sai da home e passa para `/sobre`.

## 4. Regras de hierarquia

1. Uma mensagem dominante por viewport.
2. No máximo um sistema gráfico por seção.
3. Vermelho reservado a palavra-chave, CTA, índice ou status.
4. Texto corrido com no máximo 48rem e mínimo de 16px.
5. Movimento aplicado à imagem e às transições; textos permanecem estáveis e legíveis.
6. Metadados ficam nas bordas e nunca atravessam a manchete.
7. Se uma informação não ajuda a entender, confiar ou agir, ela sai da home.
8. No celular, o percurso é linear e não depende de hover.

## 5. Material visual

| Material | Especificação | Estado |
| --- | --- | --- |
| Entrada interativa | Canvas responsivo | Concluído |
| Hero | Render 2400 px ou WebM mudo de 8–12 s | Conceitual provisório |
| Projetos | 1 hero horizontal + 2 detalhes por projeto | Conceituais provisórios |
| Ameno Cotas | Screenshot 1600×1000 + vídeo/GIF curto | Pendente |
| Sobre | Retrato ou ambiente de trabalho real | Pendente |

Todo material conceitual permanece identificado como provisório até a substituição pelos trabalhos oficiais.

## 6. Fases de execução

### Fase A — Estrutura e ritmo

- [x] Criar entrada interativa.
- [x] Reescrever o hero como promessa visual.
- [x] Substituir `StudioMethod` por princípio editorial curto.
- [x] Remover índice e transformar projetos em painéis fullbleed.
- [x] Simplificar o teaser de ferramentas.
- [x] Absorver contato no footer.
- [x] Mover método para `/sobre`.

### Fase B — Direção de arte

- [x] Refinar enquadramentos desktop e mobile.
- [x] Ajustar ritmo e duração dos painéis sticky.
- [x] Harmonizar navegação com fundos claros e escuros.
- [x] Substituir render repetido no hero por material exclusivo.

### Fase C — Conteúdo real

- [ ] Inserir renders, nomes, locais e anos oficiais.
- [ ] Inserir captura e demonstração do Ameno Cotas.
- [ ] Finalizar apresentação profissional e fotografia do estúdio.
- [ ] Confirmar redes sociais e canal de suporte.

### Fase D — Validação

- [x] Conferir a experiência móvel em 429 e 573 px.
- [ ] Conferir 390, 768 e 1440 px como matriz final.
- [ ] Validar teclado, contraste e movimento reduzido.
- [x] Verificar ausência de sobreposição, imagens quebradas e erro ativo na prévia mobile.
- [x] Rodar lint e build.
- [ ] Validar o fluxo de compra com Stripe e webhook configurados.

## 7. Critérios de aceite

- Em cinco segundos após a entrada, entende-se o que o ameno faz.
- Em 30 segundos, entende-se que o site oferece projetos e ferramentas.
- Cada scroll apresenta uma ideia nova, sem repetir o mesmo recurso visual.
- Projetos e Ameno Cotas têm peso comercial equilibrado.
- A home funciona sem os efeitos decorativos e permanece clara no celular.
