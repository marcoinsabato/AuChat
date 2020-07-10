@extends('layouts.app')

@section('content')

<div class="container">
    <div class="row justify-content-center">
        <div class="col-12 col-md-8 p-0">
            <div class="panel panel-default">
                <div class="panel-body" id="chat-window">
                    <chat-messages v-on:messagedeleted="deleteMessage" :messages="messages" :user="{{ Auth::user() }}"></chat-messages>
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
