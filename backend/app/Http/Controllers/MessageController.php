<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Http\Requests\StoreMessageRequest;
use App\Http\Requests\UpdateMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        
    }

    public function MyConversation(User $user){

        $authUser = Auth::id();
        $reciever = $user->id;

        $message = Message::where(function($query) use ($authUser, $reciever){
            $query->where("sender_id", $authUser)
                  ->where("receiver", $reciever);
           
                })->orWhere(function($query) use ($authUser, $reciever){
                $query->where("sender_id", $authUser)
                ->where("receiver_id", $reciever);

            })
            ->orderBy('created_at', 'asc')
            ->get();

        return MessageResource::collection($message);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreMessageRequest $request)
    {
        $data = $request->validated();

        $data['sender_id'] = Auth::user()->id; // Set the sender_id to the authenticated user's ID
        
        $message = Message::create($data);

        return response()->json([
            'message' => 'Message sent successfully',
            'data' => new MessageResource($message)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Message $message)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Message $message)
    {
        
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateMessageRequest $request, Message $message)
    {
        $message = $request->validated();
        $message['sender_id'] = Auth::user()->id; // Ensure the sender_id is set to the authenticated user's ID
        
        $message->update($message);
        return response()->json([
            'message' => 'Message updated successfully',
            'data' => new MessageResource($message)
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Message $message)
    {
        $message->delete();
        return response()->json([
            'message' => 'Message deleted successfully'
        ], 200);
    }
}
