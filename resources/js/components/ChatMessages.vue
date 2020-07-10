<template>
    <ul class="chat" id="msgs">
        <li class="right" v-for="message in messages" :key="message.index">
            <div class="chat-body px-3">
                <div class="header">
                    <strong class="primary-font">
                        {{ message.user.name }}
                    </strong>
                </div>
                <p>
                    {{ message.message }}
                </p>
            </div>
        </li>
    </ul>
</template>

<script>
  export default {
    props: ['messages']
  };
</script>