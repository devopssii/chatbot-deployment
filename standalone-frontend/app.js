class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button')
        }

        this.state = false;
        this.messages = [];
        this.sessionId = null; // Идентификатор сессии пользователя
    }

    async createSession() {
        // В этой функции вы можете создать сессию на вашем сервере и получить идентификатор сессии
        // Отправьте запрос на сервер, чтобы создать сессию и получить sessionId
        try {
            const response = await fetch('https://api.synlabs.pro/create_session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                this.sessionId = data.sessionId; // Сохраните полученный идентификатор сессии
            } else {
                console.error('Failed to create session');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    display() {
        const {openButton, chatBox, sendButton} = this.args;

        openButton.addEventListener('click', async () => {
            if (!this.sessionId) {
                await this.createSession();
            }
            this.toggleState(chatBox);
        });

        sendButton.addEventListener('click', () => this.onSendButton(chatBox));

        const node = chatBox.querySelector('input');
        node.addEventListener("keyup", ({key}) => {
            if (key === "Enter") {
                this.onSendButton(chatBox);
            }
        });
    }

    toggleState(chatbox) {
        this.state = !this.state;

        // show or hides the box
        if(this.state) {
            chatbox.classList.add('chatbox--active');
        } else {
            chatbox.classList.remove('chatbox--active');
        }
    }

    onSendButton(chatbox) {
        if (!this.sessionId) {
            console.error('Session not created');
            return;
        }

        var textField = chatbox.querySelector('input');
        let text1 = textField.value
        if (text1 === "") {
            return;
        }

        let msg1 = { name: "User", message: text1 }
        this.messages.push(msg1);

        // Отправьте сообщение и идентификатор сессии на сервер
        fetch('https://api.synlabs.pro/send_message', {
            method: 'POST',
            body: JSON.stringify({ user_id: this.sessionId, message: text1 }),
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(r => r.json())
        .then(r => {
            let msg2 = { name: "Sam", message: r.response };
            this.messages.push(msg2);
            this.updateChatText(chatbox);
            textField.value = '';
        })
        .catch((error) => {
            console.error('Error:', error);
            this.updateChatText(chatbox);
            textField.value = '';
        });
    }

    updateChatText(chatbox) {
        var html = '';
        this.messages.slice().reverse().forEach(function(item, index) {
            if (item.name === "Sam") {
                html += '<div class="messages__item messages__item--visitor">' + item.message + '</div>';
            } else {
                html += '<div class="messages__item messages__item--operator">' + item.message + '</div>';
            }
        });

        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html;
    }
}

const chatbox = new Chatbox();
chatbox.display();
