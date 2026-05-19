export class FormComponent {
    private container: HTMLElement | null = null;

    constructor(containerId: string) {
        this.container = document.getElementById(containerId);
    }

    public init(): void {
        if (!this.container) {
            console.error(`Container with id or selector not found`);
            return;
        }

        this.container.innerHTML = this.render();

        const form = this.container.querySelector('form');
        if (form) {
            // 1. Привязываем события отправки и валидации формы
            this.bindFormEvents(form);

            const inputPhone = form.querySelector('#phone') as HTMLInputElement | null;
            if (inputPhone) {
                this.initPhoneMask(inputPhone)
            }

            // 2. Ищем кнопку ИИ безопасно внутри существующей формы
            const aiBtn = form.querySelector('#aiImproveBtn') as HTMLButtonElement | null;

            if (aiBtn) {
                // 3. Передаем управление в твой отдельный метод
                this.bindAiBtnEvents(form, aiBtn);
            }
        }
    }

    private render(): string {
        return `
      <div class="contact__form-wrapper">
        <form id="contactForm" class="form" novalidate>
          <div class="form__group">
            <label for="name" class="form__label">Имя *</label>
            <input type="text" id="name" name="name" class="form__input" placeholder="Иван" required>
            <span class="form__error-msg">Пожалуйста, введите имя</span>
          </div>

          <div class="form__group">
            <label for="phone" class="form__label">Телефон</label>
            <input type="tel" id="phone" name="phone" class="form__input" placeholder="+7 (999) 999-99-99">
          </div>

          <div class="form__group">
            <label for="email" class="form__label">Email *</label>
            <input type="email" id="email" name="email" class="form__input" placeholder="ivan@example.com" required>
            <span class="form__error-msg">Введите корректный email адрес</span>
          </div>

          <div class="form__group">
            <label for="comment" class="form__label">Комментарий *</label>
            <textarea id="comment" name="comment" class="form__input form__textarea" placeholder="Опишите вашу задачу..." required></textarea>
            <span class="form__error-msg">Напишите пару слов о задаче</span>
            
            <button type="button" id="aiImproveBtn" class="form__ai-btn">
              <i class="fa-solid fa-sparkles"></i> Улучшить текст с помощью AI
            </button>
          </div>

          <button type="submit" class="form__submit-btn">
            <span class="btn-text">Отправить сообщение</span>
            <span class="btn-loader"></span>
          </button>

          <div class="form__status form__status--success">
            <i class="fa-solid fa-circle-check"></i>
            <div>
              <h4>Успешно отправлено!</h4>
              <p>Письмо улетело владельцу, а копия отправлена вам.</p>
            </div>
          </div>

          <div class="form__status form__status--error">
            <i class="fa-solid fa-circle-exclamation"></i>
            <div>
              <h4>Ошибка отправки</h4>
              <p id="serverErrorText">Не удалось связаться с сервером. Попробуйте позже.</p>
            </div>
          </div>
        </form>
      </div>
    `;
    }

    private bindFormEvents(form: HTMLFormElement): void {
        form.addEventListener('submit', (e) => this.handleSubmit(e, form));
    }

    private async handleSubmit(e: Event, form: HTMLFormElement): Promise<void> {
        e.preventDefault();

        form.classList.remove('form--error', 'form--success');
        form.querySelectorAll('.form__group--invalid').forEach(g => g.classList.remove('form__group--invalid'));
        const inputs = form.querySelectorAll('.form__input, textarea');
        let isFormValid = true;
        inputs.forEach((input) => {
            const element = input as HTMLInputElement | HTMLTextAreaElement;
            let isCurrentFieldValid = true;
            if (!element.validity.valid) {
                isCurrentFieldValid = false;
            }
            if (element.id === 'phone') {
                const isPhoneRegexOk = this.validatePhone(element.value.trim());
                if (!isPhoneRegexOk) {
                    isCurrentFieldValid = false;
                }
            }
            if (!isCurrentFieldValid) {
                element.closest('.form__group')?.classList.add('form__group--invalid');
                isFormValid = false;
            }
        });
        if (!isFormValid) {
            return;
        }

        /*if (!form.checkValidity()) {
            form.querySelectorAll('input[required], textarea[required]').forEach((input) => {
                const element = input as HTMLInputElement | HTMLTextAreaElement;
                if (!element.validity.valid) {
                    element.closest('.form__group')?.classList.add('form__group--invalid');
                }
            });
            return;
        }

        const phoneInput = form.querySelector('#phone') as HTMLInputElement;
        if (phoneInput) {
            const isPhoneValid = this.validatePhone(phoneInput.value.trim());
            if (!isPhoneValid) {
                this.toggleFieldError(phoneInput, true);
                return;
            } else {
                this.toggleFieldError(phoneInput, false);
            }
        }*/

        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());

        try {
            form.classList.add('form--loading');

            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Ошибка сервера');

            form.classList.add('form--success');
            form.reset();
        } catch (error: any) {
            form.classList.add('form--error');
            const errorTextEl = form.querySelector('#serverErrorText');
            if (errorTextEl) {
                errorTextEl.textContent = error.message || 'Ошибка соединения.';
            }
        } finally {
            form.classList.remove('form--loading');
        }
    }


    private bindAiBtnEvents(form: HTMLFormElement, aiBtn: HTMLButtonElement): void {
        const commentTextarea = form.querySelector('#comment') as HTMLTextAreaElement | null;

        if (commentTextarea) {
            aiBtn.addEventListener('click', () => this.handleAIImprove(aiBtn, commentTextarea));
        }
    }

    private async handleAIImprove(btn: HTMLButtonElement, textarea: HTMLTextAreaElement): Promise<void> {
        const originalText = textarea.value.trim();
        const group = textarea.closest('.form__group');
        if (group) {
            const errorLabel = group.querySelector('.form__error-ai');
            if (errorLabel) {
                errorLabel.remove();
            }
        }
        if (!originalText) {
            this.toggleFieldError(textarea, true);
            textarea.focus();
            return;
        }

        const originalHtml = btn.innerHTML;

        try {
            this.setButtonLoading(btn, true, `<i class="fa-solid fa-spinner fa-spin"></i> Магия ИИ...`);

            const response = await fetch('/api/contact/improve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: originalText }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Не удалось улучшить текст.');
            }

            if (result.improvedText) {
                textarea.value = result.improvedText;
                this.toggleFieldError(textarea, false);
                this.flashSuccessBorder(textarea);
            }

        } catch (error: any) {

            if (group) {
                let errorLabel = group.querySelector('.form__error-message') as HTMLElement | null;
                if (!errorLabel) {
                    errorLabel = document.createElement('span');
                    errorLabel.className = 'form__error-ai';
                    group.appendChild(errorLabel);
                }
                errorLabel.textContent = `Робот споткнулся: ${error.message}`;
            }
        } finally {
            this.setButtonLoading(btn, false, originalHtml);
        }
    }

    // --- ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ-ХЕЛПЕРЫ (UI утилиты) ---

    /**
     * Управляет состоянием загрузки кнопки
     */
    private setButtonLoading(btn: HTMLButtonElement, isLoading: boolean, content: string): void {
        btn.disabled = isLoading;
        btn.innerHTML = content;
    }

    /**
     * Переключает класс ошибки у родительского контейнера поля
     */
    private toggleFieldError(field: HTMLElement, hasError: boolean): void {
        const group = field.closest('.form__group');
        if (hasError) {
            group?.classList.add('form__group--invalid');
        } else {
            group?.classList.remove('form__group--invalid');
        }
    }

    /**
     * Временная зеленая подсветка поля при успешном обновлении
     */
    private flashSuccessBorder(field: HTMLTextAreaElement): void {
        field.style.borderColor = '#22c55e';
        setTimeout(() => field.style.borderColor = '', 1000);
    }

    private validatePhone(phone: string): boolean {
        // Регулярка проверяет строго формат: +7 (999) 999-99-99
        const phoneRegex = /^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/;
        return phoneRegex.test(phone);
    }

    private initPhoneMask(input: HTMLInputElement): void {
        input.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            // Оставляем только цифры
            let matrix = '+7 (___) ___-__-__';
            let i = 0;
            let def = matrix.replace(/\D/g, '');
            let val = target.value.replace(/\D/g, '');

            // Если пользователь стирает всё до +7, не даем удалить префикс
            if (def.length >= val.length) val = def;

            target.value = matrix.replace(/./g, (a) => {
                return /[_\d]/.test(a) && i < val.length
                    ? val.charAt(i++)
                    : i >= val.length
                        ? ''
                        : a;
            });
        });

        // Дополнительно: если пользователь кликает в пустое поле, сразу подставляем "+7 ("
        input.addEventListener('focus', () => {
            if (input.value === '') {
                input.value = '+7 (';
            }
        });
    }
}