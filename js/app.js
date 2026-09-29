/**
 * SOLARI • SUELLEN BAILON
 * Motor de Seleção Rápida e Geração de Mensagem WhatsApp
 */

document.addEventListener('DOMContentLoaded', () => {
  const WHATSAPP_PHONE = '5514998063662';

  // Estado da aplicação
  const state = {
    selectedServices: new Map(), // id -> { id, name, category }
    wantsOrientation: false,
    client: {
      name: '',
      length: '',
      colorCurrent: '',
      colorGoal: '',
      history: '',
      notes: ''
    }
  };

  const CHECK_ICON_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

  // Elementos do DOM
  const catalogRoot = document.getElementById('services-catalog-root');
  const orientationToggle = document.getElementById('orientation-toggle');
  const orientationIndicator = document.getElementById('orientation-indicator');

  const inputName = document.getElementById('input-name');
  const selectLength = document.getElementById('select-length');
  const selectColorCurrent = document.getElementById('select-color-current');
  const selectColorGoal = document.getElementById('select-color-goal');
  const selectHistory = document.getElementById('select-history');
  const textareaNotes = document.getElementById('textarea-notes');

  const previewText = document.getElementById('whatsapp-preview-text');
  const btnSendWhatsApp = document.getElementById('btn-send-whatsapp');
  const btnCopyText = document.getElementById('btn-copy-text');

  const mobileFloatingBar = document.getElementById('mobile-floating-bar');
  const floatingItemsCount = document.getElementById('floating-items-count');
  const btnFloatingSend = document.getElementById('btn-floating-send');
  const toastElement = document.getElementById('toast-element');
  let validationAttempted = false;

  function requiresColorGoal() {
    return Array.from(state.selectedServices.values()).some(service =>
      ['Mechas & Iluminação', 'Coloração & Tonalização'].includes(service.category));
  }

  function validateFields() {
    syncClientFromForm();
    const name = state.client.name;
    const validName = name.length <= 80 && (name.match(/\p{L}/gu) || []).length >= 2 &&
      /^[\p{L}\p{M} .’'&-]+$/u.test(name);
    const rules = [
      [inputName, 'name-error', validName],
      [selectLength, 'length-error', Boolean(state.client.length)],
      [selectColorCurrent, 'color-current-error', Boolean(state.client.colorCurrent)],
      [selectHistory, 'history-error', Boolean(state.client.history)],
      [selectColorGoal, 'color-goal-error', !requiresColorGoal() || Boolean(state.client.colorGoal)]
    ];
    let firstInvalid = null;
    rules.forEach(([field, errorId, valid]) => {
      field.classList.toggle('input-error', !valid);
      field.setAttribute('aria-invalid', String(!valid));
      document.getElementById(errorId).classList.toggle('visible', !valid);
      if (!valid && !firstInvalid) firstInvalid = field;
    });
    const selectionValid = state.selectedServices.size > 0 || state.wantsOrientation;
    document.getElementById('selection-error').classList.toggle('visible', !selectionValid);
    return firstInvalid || (selectionValid ? null : orientationToggle);
  }

  /**
   * 1. Renderiza o catálogo de serviços de forma limpa e direta
   */
  function renderCatalog() {
    if (!catalogRoot || typeof SERVICES_DATA === 'undefined') return;

    let html = '';

    SERVICES_DATA.forEach(category => {
      html += `
        <div class="category-block">
          <div class="category-block-title">${category.category}</div>
          <div class="services-grid">
            ${category.items.map(item => `
              <div class="service-card" data-id="${item.id}" data-name="${item.name}" data-category="${category.category}">
                <div class="check-box-indicator"></div>
                <div class="service-text">
                  <div class="service-title">${item.name}</div>
                  <div class="service-description">${item.desc}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    catalogRoot.innerHTML = html;

    // Adiciona cliques aos cards de serviços
    catalogRoot.querySelectorAll('.service-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const name = card.getAttribute('data-name');
        const category = card.getAttribute('data-category');

        toggleService(id, name, category, card);
      });
    });
  }

  /**
   * 2. Alterna seleção de um serviço
   */
  function toggleService(id, name, category, cardElement) {
    if (state.selectedServices.has(id)) {
      state.selectedServices.delete(id);
      cardElement.classList.remove('checked');
      cardElement.querySelector('.check-box-indicator').innerHTML = '';
    } else {
      state.selectedServices.set(id, { id, name, category });
      cardElement.classList.add('checked');
      cardElement.querySelector('.check-box-indicator').innerHTML = CHECK_ICON_SVG;
    }

    updateUI();
  }

  /**
   * 3. Alterna opção de orientação
   */
  if (orientationToggle) {
    orientationToggle.addEventListener('click', () => {
      state.wantsOrientation = !state.wantsOrientation;
      orientationToggle.classList.toggle('checked', state.wantsOrientation);
      orientationToggle.setAttribute('aria-checked', String(state.wantsOrientation));
      orientationIndicator.innerHTML = state.wantsOrientation ? CHECK_ICON_SVG : '';
      updateUI();
    });
    orientationToggle.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        orientationToggle.click();
      }
    });
  }

  /**
   * 4. Listeners para os campos de texto e selects
   */
  function setupFormListeners() {
    const fields = [
      { el: inputName, key: 'name' },
      { el: selectLength, key: 'length' },
      { el: selectColorCurrent, key: 'colorCurrent' },
      { el: selectColorGoal, key: 'colorGoal' },
      { el: selectHistory, key: 'history' },
      { el: textareaNotes, key: 'notes' }
    ];

    fields.forEach(({ el, key }) => {
      if (!el) return;
      const updateField = () => {
        state.client[key] = el.value.trim();

        if (validationAttempted) validateFields();

        updateWhatsAppMessage();
      };

      el.addEventListener('input', updateField);
      el.addEventListener('change', updateField);
    });
  }

  function syncClientFromForm() {
    state.client.name = inputName.value.trim();
    state.client.length = selectLength.value.trim();
    state.client.colorCurrent = selectColorCurrent.value.trim();
    state.client.colorGoal = selectColorGoal.value.trim();
    state.client.history = selectHistory.value.trim();
    state.client.notes = textareaNotes.value.trim();
  }

  /**
   * 5. Formata a mensagem limpa para o WhatsApp
   */
  function generateWhatsAppMessageText() {
    syncClientFromForm();
    const name = state.client.name.trim() || 'Cliente';
    const totalServices = state.selectedServices.size;

    let msg = `Olá, Suellen! Meu nome é *${name}*.\n`;
    msg += `Gostaria de agendar / consultar serviços para o meu cabelo no salão:\n\n`;

    // Serviços
    msg += `*Serviços de interesse:*\n`;
    if (state.wantsOrientation) {
      msg += `• *Quero orientação / avaliação personalizada da Suellen*\n`;
    }

    if (totalServices > 0) {
      state.selectedServices.forEach(item => {
        msg += `• ${item.name}\n`;
      });
    } else if (!state.wantsOrientation) {
      msg += `• _(Nenhum serviço selecionado ainda)_\n`;
    }

    // Detalhes do Cabelo
    const hasDetails = state.client.length || state.client.colorCurrent || state.client.colorGoal || state.client.history || state.client.notes;

    if (hasDetails) {
      msg += `\n*Sobre o meu cabelo:*\n`;
      if (state.client.length) msg += `• *Tamanho atual:* ${state.client.length}\n`;
      if (state.client.colorCurrent) msg += `• *Cor atual:* ${state.client.colorCurrent}\n`;
      if (state.client.colorGoal) msg += `• *Objetivo com a cor:* ${state.client.colorGoal}\n`;
      if (state.client.history) msg += `• *Histórico de química:* ${state.client.history}\n`;
      if (state.client.notes) msg += `• *Observações:* ${state.client.notes}\n`;
    }

    msg += `\nPoderia me orientar sobre a avaliação, valores e horários disponíveis?`;

    return msg;
  }

  /**
   * 6. Atualiza o texto na caixa de prévia
   */
  function updateWhatsAppMessage() {
    if (!previewText) return;
    previewText.textContent = generateWhatsAppMessageText();
  }

  /**
   * 7. Atualiza contadores e barra flutuante
   */
  function updateUI() {
    selectColorGoal.required = requiresColorGoal();
    document.getElementById('color-goal-required').hidden = !selectColorGoal.required;
    if (validationAttempted) validateFields();
    const totalCount = state.selectedServices.size + (state.wantsOrientation ? 1 : 0);

    // Barra flutuante mobile
    if (mobileFloatingBar) {
      if (totalCount > 0) {
        mobileFloatingBar.style.display = 'flex';
        if (floatingItemsCount) {
          floatingItemsCount.textContent = `${totalCount} serviço(s) selecionado(s)`;
        }
      } else {
        mobileFloatingBar.style.display = 'none';
      }
    }

    updateWhatsAppMessage();
  }

  /**
   * 8. Ação de Enviar no WhatsApp
   */
  function handleSendWhatsApp() {
    if (!validateBeforeSend()) return;

    const message = generateWhatsAppMessageText();
    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encoded}`;

    // Navegação direta também funciona quando novas janelas são bloqueadas.
    window.location.assign(url);
  }

  function validateBeforeSend() {
    validationAttempted = true;
    const invalidField = validateFields();
    if (!invalidField) return true;
    invalidField.focus();
    invalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast('Confira os campos obrigatórios destacados antes de continuar.');
    return false;
  }

  if (btnSendWhatsApp) {
    btnSendWhatsApp.addEventListener('click', handleSendWhatsApp);
  }

  if (btnFloatingSend) {
    btnFloatingSend.addEventListener('click', handleSendWhatsApp);
  }

  /**
   * 9. Copiar Mensagem
   */
  if (btnCopyText) {
    btnCopyText.addEventListener('click', async () => {
      if (!validateBeforeSend()) return;
      const msg = generateWhatsAppMessageText();
      try {
        await navigator.clipboard.writeText(msg);
        showToast('Mensagem copiada com sucesso!');
      } catch (err) {
        const dummy = document.createElement('textarea');
        dummy.value = msg;
        document.body.appendChild(dummy);
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
        showToast('Mensagem copiada!');
      }
    });
  }

  /**
   * Toast Helper
   */
  let toastTimer = null;
  function showToast(text) {
    if (!toastElement) return;
    toastElement.textContent = text;
    toastElement.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastElement.classList.remove('show');
    }, 3000);
  }

  // Inicialização
  renderCatalog();
  setupFormListeners();
  updateUI();
});
