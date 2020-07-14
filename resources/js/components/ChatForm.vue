<template>
    <div class="input-group input-group-lg">
        <input id="btn-input" type="text" name="message" class="form-control" placeholder="Scrivi un messaggio..." v-model="newMessage" @keyup.enter="sendMessage">

        <span class="input-group-btn">
            <button class="btn btn-success btn-block h-100 font-weight-bold btn-send" id="btn-chat" @click="sendMessage">
                Invia
            </button>
        </span>
    </div>
</template>

<script>
    export default {
        props: ['user'],

        data() {
            return {
                newMessage: ''
            }
        },

        methods: {
            sendMessage() {
                this.$emit('messagesent', {
                    user: this.user,
                    message: this.newMessage
                });

                this.newMessage = ''
            }
        }    
    }
</script>