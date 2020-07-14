<h1>Laravel Chat</h1>

<p>Per creare una chat la cosa fondamentale che serve è un webSocket.</p>

<p>I WebSockets sono una tecnologia che rende possibile aprire una sessione di comunicazione interattiva tra il browser dell'utente e un server. Con questa API si possono mandare messaggi al server e ricevere risposte “event-driven” senza doverle richiedere al server.</p>

<p>Quindi i WebSocket sono utilizzati per implementare interfacce real time. </p>

<p>Quando alcuni dati vengono aggiornati sul server, in genere un messaggio viene inviato su una connessione WebSocket per essere gestito dal client. Ciò fornisce un'alternativa più solida ed efficiente al pulling continuo dell'applicazione per le modifiche.</p>

<p>Oltre a Pusher come webSocket per costruire l’app ho utilizzato Vue.js per il frontend, ma si può utilizzare qualsiasi framework javascript anche addirittura js puro.</p>

<p>Prima di tutto andiamo a iscriverci su <a href="https://pusher.com/signup" target="_blank">Pusher</a> e creiamo il nostro primo progetto che avrà delle credenziali. </p>

<p>Bene ora che abbiamo tutto quello che ci serve possiamo procedere con la creazione dell’app :<br>

per prima cosa creiamo il progetto laravel implementando già lo scaffolding con Vue e l’auteticazione e richiediamo pusher tramite composer.</p>
<code>
    laravel new laravel-chat
    composer require laravel/ui
    php artisan ui vue --auth
    composer require pusher/pusher-php-server
</code>

<p>Andiamo per prima cosa a impostare il nostro .env con le credenziali prima create e come vedete troveremo già di default i campi da compilare impostiamo inoltre il <b>BROADCAST_DRIVER=pusher</b></p>

<p>Adesso andiamo a configurare il nostro ambiente, per prima cosa in <b>config/app.php</b>  decommentiamo  <b>App\Providers\BroadcastServiceProvider</b> 
Andiamo ad aprire adesso config/broadcasting.php e +decommentiamo il codice che laravel ci da commentato</p>
<code>
      'pusher' => [
          'driver' => 'pusher',
          'key' => env('PUSHER_APP_KEY'),
          'secret' => env('PUSHER_APP_SECRET'),
          'app_id' => env('PUSHER_APP_ID'),
          'options' => [
              'cluster' => env('PUSHER_CLUSTER'),
              'encrypted' => true,
          ],
      ],
</code>

<p>Dobbiamo adesso creare il database che ci servirà per i nostri utenti e i messaggi. 
Col comando:</p>

<code>
    php artisan ui vue --auth
</code>

<p> abbiamo già creato il modello User e la migrazione per la tabella, quindi ci basterà cambiare il nostro file .env con le credenziali di accesso al database e lanciare le migrazioni con</p>

<code>
    php artisan migrate 
</code>

<p> Andiamo adesso a creare il modello dei messaggi con la relativa migrazione col comando </p>
<code>
    php artisan make:model Message -m
</code>
<p> la migrazione del messages avrà queste caratteristiche, avrà un campo text per i messaggi e un campo unsignedBigInteger per l’user_id</p>

<code>
    Schema::create('messages', function (Blueprint $table) {
      $table->increments('id');
      $table->unsignedBigInteger('user_id');
      $table->text('message');
      $table->timestamps();
    });
</code>
Andiamo adesso a settare la relazione one to many tra User e Message nei relativi modelli 


    // Modello User
    
    /**
     * A user can have many messages
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function messages()
    {
      return $this->hasMany(Message::class);
    }


    // Modello Message
    
    /**
     * A message belong to a user
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function user()
    {
      return $this->belongsTo(User::class);
    }

Creiamo ora un controller per gestire le funzioni della chat


    php artisan make:controller ChatsController


    <?php
    namespace App\Http\Controllers;
    use App\Message;
    use App\Events\MessageSent;
    use Illuminate\Http\Request;
    use App\Events\MessageDeleted;
    use Illuminate\Support\Facades\Auth;
    class ChatsController extends Controller
    {
        public function __construct()
        {
        $this->middleware('auth');
        }
    /**
     * Show chats
     *
     * @return \Illuminate\Http\Response
     */
        public function index()
        {
            return view('chat');
        }
        /**
         * Fetch all messages
         *
         * @return Message
         */
        public function fetchMessages()
        {
            return Message::with('user')->get();
        }
        /**
         * Persist message to database
         *
         * @param  Request $request
         * @return Response
         */
        public function sendMessage(Request $request)
        {
            $user = Auth::user();
            $message = $user->messages()->create([
                'message' => $request->input('message')
            ]);
            $id = $message->id;
            broadcast(new MessageSent($user, $message))->toOthers();
            return $id;
        }
        public function deleteMessage(Request $request){
            $user = Auth::user();
            $message = Message::where('id' , $request->message_id)->first();
            $message->delete();
            dd(broadcast(new MessageDeleted($user))->toOthers());
            broadcast(new MessageDeleted($user))->toOthers();
            return ['status' => 'Message Deleted!'];
        }
    }
    

e creiamo anche le rotte in web.php 


    <?php
    use Illuminate\Support\Facades\Route;
    /*
    |--------------------------------------------------------------------------
    | Web Routes
    |--------------------------------------------------------------------------
    |
    | Here is where you can register web routes for your application. These
    | routes are loaded by the RouteServiceProvider within a group which
    | contains the "web" middleware group. Now create something great!
    |
    */
    Auth::routes();
    Route::get('/', 'ChatsController@index');
    Route::get('messages', 'ChatsController@fetchMessages');
    Route::post('messages', 'ChatsController@sendMessage');
    Route::delete('/message/delete', 'ChatsController@deleteMessage'); 

 
Bene! Finito di configurare il BackEnd passiamo al frontend!
facciamo adesso il building degli asset con vue.js 


    npm install

Per  ascoltare eventi, Laravel fornisce Laravel Echo, una libreria JavaScript che rende semplicissimo l'ascolto di eventi trasmessi da Laravel. Dovremo installarlo insieme alla libreria JavaScript Pusher:


    npm install --save laravel-echo pusher-js

una volta installato Laravel ci fornisce già l’integrazione in bootstrap.js commentata, quindi andiamo a decommentarla e ad inserire “pusher” come broadcaster e la key corrispondente.


    import Echo from 'laravel-echo';
    window.Pusher = require('pusher-js');
    window.Echo = new Echo({
        broadcaster: 'pusher',
        key: process.env.MIX_PUSHER_APP_KEY,
        cluster: process.env.MIX_PUSHER_APP_CLUSTER,
        forceTLS: true
    });

Andiamo adesso a creare la vista chat.blade.php nella cartella views


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

andiamo adesso a creare i componenti view presenti in chat.blade.php 

ChatMessages.vue


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
                this.$emit('messagedeleted', {
                    message_id: id
                });
            }
        },
      };
    </script>


ChatForm.vue
    <template>
        <div class="input-group input-group-lg">
            <input id="btn-input" type="text" name="message" class="form-control" placeholder="Type your message here..." v-model="newMessage" @keyup.enter="sendMessage">
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

e registriamo i componenti in resources/app.js 


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
    

Passiamo adesso alla parte di interazione real time creando l’evento lato server col comando 


    php artisan make:event MessageSent


    <?php
    namespace App\Events;
    use App\User;
    use App\Message;
    use Illuminate\Broadcasting\Channel;
    use Illuminate\Queue\SerializesModels;
    use Illuminate\Broadcasting\PrivateChannel;
    use Illuminate\Broadcasting\PresenceChannel;
    use Illuminate\Foundation\Events\Dispatchable;
    use Illuminate\Broadcasting\InteractsWithSockets;
    use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
    class MessageSent implements ShouldBroadcast
    {
        use Dispatchable, InteractsWithSockets, SerializesModels;
        /**
         * User that sent the message
         *
         * @var User
         */
        public $user;
        /**
         * Message details
         *
         * @var Message
         */
        public $message;
        /**
         * Create a new event instance.
         *
         * @return void
         */
        public function __construct(User $user, Message $message)
        {
            $this->user = $user;
            $this->message = $message;
        }
        /**
         * Get the channels the event should broadcast on.
         *
         * @return Channel|array
         */
        public function broadcastOn()
        {
            return new PrivateChannel('chat');
        }
    }
    

molto importante una volta creato l’evento è che la classe implementi ShouldBroadcast e che le variabili all’interno siano public altrimenti non passerebbero al canale.

Ora non ci resta che creare il canale in routes/channels.php e che solo gli utenti autenticati possano accedervi 


    Broadcast::channel('chat', function ($user) {
      return Auth::check();
    });


Lanciamo ora 


    npm run dev

 
e la nostra app è pronta.