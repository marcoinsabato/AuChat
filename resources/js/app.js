/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

require('./bootstrap');

window.Vue = require('vue');

/**
 * The following block of code may be used to automatically register your
 * Vue components. It will recursively scan this directory for the Vue
 * components and automatically register them with their "basename".
 *
 * Eg. ./components/ExampleComponent.vue -> <example-component></example-component>
 */

// const files = require.context('./', true, /\.vue$/i)
// files.keys().map(key => Vue.component(key.split('/').pop().split('.')[0], files(key).default))

Vue.component('example-component', require('./components/ExampleComponent.vue').default);

/**
 * Next, we will create a fresh Vue application instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

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

