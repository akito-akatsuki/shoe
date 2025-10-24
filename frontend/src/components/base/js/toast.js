(function () {
    // Inject CSS vào <head>
    if (!document.getElementById('toast-style')) {
        const style = document.createElement('style');
        style.id = 'toast-style';
        style.textContent = `
            #toast-container {
                position: fixed;
                top: 5rem;
                right: 2rem;
                z-index: 99999999999999;
            }

            .toast {
                position: relative;
                max-width: 300px;
                padding: 10px;
                margin-bottom: 20px;
                border-left: 3px solid;
                border-radius: 4px;
                background-color: #fff1;
                backdrop-filter: blur(6px);
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 10px;
                transition: all linear 0.4s;
            }

            @keyframes slideInLeft {
                from {
                    transform: translateX(calc(100% + 32px));
                    opacity: 0.1;
                }

                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes fadeOut {
                to {
                    opacity: 0;
                }
            }

            .toast--success {
                border-color: #00e181;
            }

            .toast--success .toast__icon--success {
                fill: #00e181;
            }

            .toast--info {
                border-color: #00bfea;
            }

            .toast--info .toast__icon--info {
                fill: #00bfea;
            }

            .toast--warning {
                border-color: #ffc84c;
            }

            .toast--warning .toast__icon--warning {
                fill: #ffc84c;
            }

            .toast--error {
                border-color: #fa3a4a;
            }

            .toast--error .toast__icon--error {
                fill: #fa3a4a;
            }

            .toast + .toast {
                margin-bottom: 20px;
            }

            .toast__icon {
                font-size: 1.5em;
            }

            .toast__icon,
            .toast__close {
                padding: 0 5px;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            /* .toast__body {

            } */

            .toast__title {
                font-size: 1.2em;
                font-weight: 600;
                color: #111;
            }

            .toast__msg {
                font-size: 0.8em;
                margin-top: 0.2em;
                color: #555;
            }

            .toast__close {
                font-size: 1.5em;
                color: #777;
                cursor: pointer;
            }

            .toast__close svg {
                fill: #777;
            }

            .toast__close:hover svg {
                fill: #222;
            }
      `;
        document.head.appendChild(style);
    }

    // Inject #toast-container vào **đầu body**
    if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        document.body.insertBefore(container, document.body.firstChild);
    }

    // Định nghĩa toast object
    window.toast = {
        show(title = '', msg = '', type = "success", duration = 5000) {
            const container = document.getElementById('toast-container');
            const toast = document.createElement("div");
            toast.classList.add("toast", `toast--${type}`);
            toast.style.animation = `slideInLeft ease 0.3s, fadeOut linear 1s ${duration / 1000 - 1}s forwards`;

            const removeID = setTimeout(() => {
                container.removeChild(toast);
            }, duration + 100);

            toast.onclick = (e) => {
                if (e.target.closest(".toast__close")) {
                    container.removeChild(toast);
                    clearTimeout(removeID);
                }
            };

            const icons = {
                success: `  <path
                                d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z">
                            </path>
                            <path d="M9.999 13.587 7.7 11.292l-1.412 1.416 3.713 3.705 6.706-6.706-1.414-1.414z"></path>`,
                info: ` <path
                            d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z">
                        </path>
                        <path d="M11 11h2v6h-2zm0-4h2v2h-2z"></path>`,
                warning: `  <path
                                d="M11.953 2C6.465 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.493 2 11.953 2zM12 20c-4.411 0-8-3.589-8-8s3.567-8 7.953-8C16.391 4 20 7.589 20 12s-3.589 8-8 8z">
                            </path>
                            <path d="M11 7h2v7h-2zm0 8h2v2h-2z"></path>`,
                error: `<path d="M11 7h2v7h-2zm0 8h2v2h-2z"></path>
                        <path
                            d="m21.707 7.293-5-5A.996.996 0 0 0 16 2H8a.996.996 0 0 0-.707.293l-5 5A.996.996 0 0 0 2 8v8c0 .266.105.52.293.707l5 5A.996.996 0 0 0 8 22h8c.266 0 .52-.105.707-.293l5-5A.996.996 0 0 0 22 16V8a.996.996 0 0 0-.293-.707zM20 15.586 15.586 20H8.414L4 15.586V8.414L8.414 4h7.172L20 8.414v7.172z">
                        </path>`,
            };

            const icon = icons[type];

            toast.innerHTML = `
                <div class="toast__icon">
                    <svg class="toast__icon--${type}" width="24" height="24" viewBox="0 0 24 24">
                        ${icon}
                    </svg>
                </div>
                <div class="toast__body">
                    <div class="toast__title">${title}</div>
                    <div class="toast__msg">${msg}</div>
                </div>
                <div class="toast__close">
                    <svg width="24" height="24" viewBox="0 0 24 24">
                        <path
                            d="M9.172 16.242 12 13.414l2.828 2.828 1.414-1.414L13.414 12l2.828-2.828-1.414-1.414L12 10.586 9.172 7.758 7.758 9.172 10.586 12l-2.828 2.828z">
                        </path>
                        <path
                            d="M12 22c5.514 0 10-4.486 10-10S17.514 2 12 2 2 6.486 2 12s4.486 10 10 10zm0-18c4.411 0 8 3.589 8 8s-3.589 8-8 8-8-3.589-8-8 3.589-8 8-8z">
                        </path>
                    </svg>
                </div>
            `;

            container.appendChild(toast);
        },

        success(msg) {
            this.show('Success.', msg, 'success');
        },

        error(msg) {
            this.show('Error.', msg, 'error');
        },

        info(msg) {
            this.show('Info.', msg, 'info');
        },

        warning(msg) {
            this.show('Warning.', msg, 'warning');
        }
    };
})();
