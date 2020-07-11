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
