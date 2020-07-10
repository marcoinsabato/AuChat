<template>
    <ul class="chat" id="msgs">
        <li v-for="message in messages" @messagesent="lastMessage" :key="message.id">
            <template v-if="message.user.id === user.id">
                <div  class="chat-body px-3 text-right">
                    <button type="button" @click="deleteMessage(message.id)" class="close" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    <div class="header">
                        <strong class="primary-font">
                            {{ message.user.name }}
                        </strong>
                    </div>
                    <p>
                        {{ message.message }}
                    </p>
                    
                </div>
            </template>
            <template v-else>
                <div  class="chat-body px-3 text-left">

                    <div class="header">
                        <strong class="primary-font">
                            {{ message.user.name }}
                        </strong>
                    </div>
                    <p>
                        {{ message.message }}
                    </p>
                    
                </div>
            </template>

        </li>
        <div id="last"></div>
    </ul>
</template>

<script>
  export default {
    props: [
        'messages',
        'user'
    ],
    mounted() {
        setTimeout(() => {
            this.lastMessage()
        }, 500);
    },

    methods: {
        lastMessage: function () {
            let self = this;
            let element = document.getElementById("last");
            element.scrollIntoView();
        },
        deleteMessage(id){
            console.log(id)
            this.$emit('messagedeleted', {
                message_id: id
            });
        }
    },

  };
</script>