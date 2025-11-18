# 🎬 Novas Funcionalidades de Animação Scroll-Driven

## Visão Geral

Baseado na [documentação oficial de Scroll-Driven Animations do Chrome](https://developer.chrome.com/docs/css-ui/scroll-driven-animations), foram implementadas três novas funcionalidades avançadas ao plugin My Scroll Block:

### ✨ 1. Animações In-and-Out (Entrada e Saída)

Inspiradas no exemplo "Contact List" da documentação, estas animações permitem que os elementos animem tanto ao **entrar** quanto ao **sair** do viewport, criando efeitos mais dinâmicos e profissionais.

**Novos tipos de animação disponíveis:**

- **🔄 Fade In & Out** - Elementos fazem fade in ao entrar e fade out ao sair
- **🔄 Slide Up In & Out** - Elementos deslizam para cima ao entrar e ao sair
- **🔄 Scale In & Out** - Elementos aumentam ao entrar e diminuem ao sair
- **🔄 Rotate In & Out** - Elementos rotacionam ao entrar e ao sair

#### Como funcionam?

Estas animações usam a sintaxe avançada de keyframes com `entry` e `exit` ranges:

```css
@keyframes scrollFadeInOut {
  entry 0% {
    opacity: 0;
    transform: translateY(5vh);
  }
  entry 100% {
    opacity: 1;
    transform: translateY(0);
  }
  exit 0% {
    opacity: 1;
    transform: translateY(0);
  }
  exit 100% {
    opacity: 0;
    transform: translateY(-5vh);
  }
}
```

### ⏱️ 2. Controle de Animation Timing (Range Personalizado)

Agora é possível controlar **quando** as animações começam e terminam em relação ao viewport, oferecendo controle total sobre o timing.

**Presets disponíveis:**

- **Default (20% - 100%)** - Timing padrão, animação suave
- **Quick (0% - 50%)** - Animação rápida que completa na primeira metade da entrada
- **Slow (10% - 100%)** - Animação mais gradual e lenta
- **Late Start (50% - 100%)** - Animação só começa quando o elemento está 50% visível
- **Custom** - Controle total com sliders de 0-100%

#### Controles Custom

Quando "Custom" é selecionado, aparecem controles adicionais:

- **Entry Start (%)** - Quando iniciar a animação de entrada
- **Entry End (%)** - Quando completar a animação de entrada
- **Exit Start (%)** - Quando iniciar a animação de saída (apenas para In-and-Out)
- **Exit End (%)** - Quando completar a animação de saída (apenas para In-and-Out)

### 🌟 3. Nova Animação: Blur In

Uma nova animação de entrada que usa o efeito de desfoque (blur) para criar transições mais elegantes.

```css
@keyframes scrollBlurIn {
  from { 
    opacity: 0; 
    filter: blur(10px); 
  }
  to { 
    opacity: 1; 
    filter: blur(0); 
  }
}
```

## 🎯 Como Usar

### No Editor do WordPress

1. **Selecione um bloco suportado** (Paragraph, Image, Heading, Columns, Group)
2. **No painel lateral**, veja "Scroll Animation"
3. **Escolha o tipo de animação**:
   - Animações simples (Fade In, Slide In, etc.)
   - Animações In-and-Out marcadas com 🔄
4. **Configure o Timing** (opcional):
   - Escolha um preset ou selecione "Custom"
   - Ajuste os sliders para controle preciso
5. **Visualize no editor** - As animações aparecem em tempo real

### Exemplo de Uso: Lista de Contatos

Para recriar o efeito do exemplo "Contact List" da documentação:

1. Crie vários blocos de Paragraph
2. Aplique "🔄 Fade In & Out" em cada um
3. Use o timing "Default" ou "Quick"
4. Role a página e veja os itens aparecerem e desaparecerem suavemente

### Exemplo de Uso: Cards com Timing Custom

Para criar cards que animam com timing preciso:

1. Use blocos Group ou Column
2. Aplique "🔄 Scale In & Out"
3. Selecione timing "Custom"
4. Configure:
   - Entry Start: 25%
   - Entry End: 75%
   - Exit Start: 0%
   - Exit End: 50%

## 🔧 Implementação Técnica

### Atributos do Block

Novos atributos adicionados aos blocos:

```javascript
{
  animationType: 'string',          // Tipo de animação
  animationRange: 'string',         // Preset de timing
  animationEntryStart: 'number',    // % de início da entrada
  animationEntryEnd: 'number',      // % de fim da entrada
  animationExitStart: 'number',     // % de início da saída
  animationExitEnd: 'number',       // % de fim da saída
}
```

### Data Attributes no HTML

Os elementos renderizados incluem:

```html
<p class="scroll-anim-block scroll-anim-fade-in-out"
   data-scroll-anim="1"
   data-anim-range="custom"
   data-entry-start="20"
   data-entry-end="100"
   data-exit-start="0"
   data-exit-end="100">
  Conteúdo
</p>
```

### CSS: Animation Timeline View()

Todas as animações usam `animation-timeline: view()` conforme a especificação:

```css
@supports (animation-timeline: view()) {
  .scroll-anim-fade-in-out {
    animation-timeline: view();
  }
  
  [data-anim-range="quick"].scroll-anim-fade-in {
    animation-range: entry 0% cover 50%;
  }
}
```

## 📊 Suporte de Navegadores

As scroll-driven animations são suportadas em:

- ✅ Chrome 115+
- ✅ Edge 115+
- ✅ Opera 101+
- ⚠️ Firefox: Em desenvolvimento (experimental)
- ⚠️ Safari: Em desenvolvimento

**Graceful Degradation**: Em navegadores não suportados, o CSS usa `@supports` e os elementos aparecem normalmente sem animação.

## ♿ Acessibilidade

O plugin respeita as preferências de movimento reduzido:

```css
@media (prefers-reduced-motion: reduce) {
  [data-scroll-anim] {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
```

## 📚 Referências

- [Chrome Developers: Scroll-driven Animations](https://developer.chrome.com/docs/css-ui/scroll-driven-animations)
- [MDN: animation-timeline](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline)
- [Can I Use: Scroll Timeline](https://caniuse.com/?search=scroll-timeline)

## 🎓 Exemplos da Documentação Implementados

### ✅ Contact List (In-and-Out)
Implementado com as animações "In & Out" - elementos que animam ao entrar E sair.

### ✅ Animation Range Control
Implementado com os presets de timing e controles custom.

### ✅ Multiple Timeline Ranges
Implementado com as animações In-and-Out que usam ranges diferentes para entry e exit.

## 🚀 Próximos Passos Possíveis

Baseado na documentação, futuras funcionalidades poderiam incluir:

1. **Scroll Progress Timeline** - Barra de progresso de leitura
2. **Parallax Effects** - Efeitos de paralaxe em imagens
3. **Stacking Cards** - Efeito de cards empilhando
4. **Cover Flow** - Efeito de galeria 3D
5. **Timeline Scope** - Animações baseadas em scroll de elementos não-ancestrais

---

**Desenvolvido com base na documentação oficial do Chrome e seguindo as melhores práticas de Web Animations API.**

