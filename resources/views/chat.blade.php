@extends('layouts.app')

@section('content')

<div class="container">
    <div class="row justify-content-center">
        <div class="col-8">
            <div class="panel panel-default">
                <div class="panel-heading h3 font-weight-bold">AuChat</div>

                <div class="panel-body" id="chat-window">
                    <chat-messages :messages="messages"></chat-messages>
                </div>
                <div class="panel-footer">
                    <chat-form
                        v-on:messagesent="addMessage"
                        :user="{{ Auth::user() }}"
                    ></chat-form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
@push('lowscript')
    <script>
        document.addEventListener('DOMContentLoaded', function(){
            var chat = document.getElementById("chat-window");
            var msgs = document.getElementById("msgs");
            var int = chat.scrollHeight
            // console.log(chat.scrollHeight)
            console.log(document)
            msgs.scrollTop = 1000
            console.log(msgs.scrollTop)

        })
    </script>
@endpush