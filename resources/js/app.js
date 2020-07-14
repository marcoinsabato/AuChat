require('./bootstrap');

window.Vue = require('vue');


Vue.component('example-component', require('./components/ExampleComponent.vue').default);


require('./bootstrap');

Vue.component('chat-messages', require('./components/ChatMessages.vue').default);
Vue.component('chat-form', require('./components/ChatForm.vue').default);

const app = new Vue({
    el: '#app',

    data: {
        messages: []
    },

    created() {
        this.fetchMessages();
        Echo.private('chat').listen('MessageDeleted', (e) => {
            this.fetchMessages();
            this.scrolldown();
        });
        Echo.private('chat')
            .listen('MessageSent', (e) => {     
                this.messages.push({
                message: e.message.message,
                user: e.user,
                id: e.message.id
            });
            this.scrolldown();
        });

    },

    methods: {
        fetchMessages() {
            axios.get('/messages').then(response => {
                this.messages = response.data;
            });
        },

        scrolldown(){
            setTimeout(() => {
                let container = document.getElementById("chat-window");
                container.scrollTop = container.scrollHeight;
            }, 100);
        },

        addMessage(message) {

            axios.post('/messages', message).then(response => {
                this.messages.push({
                    message: message.message ,
                    user : message.user,
                    id : response.data
                });
                this.scrolldown();
            });
        },

        deleteMessage(e){
            axios.delete('/message/delete', {
                data : e
            }).then(response => {
                this.fetchMessages();
                this.scrolldown();
            });
        }
    }
});

