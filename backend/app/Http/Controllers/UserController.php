<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAgencyRequest;
use App\Http\Requests\StoreLoginRequest;
use App\Http\Requests\StoreUserRequest;
use App\Http\Resources\AgencyResource;
use App\Http\Resources\UserResource;
use App\Mail\WelcomeMail;
use App\Models\Agency;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        
        return UserResource::collection(User::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request )
    {
        $data = $request->validated();
        $data['password'] = bcrypt($data['password']);
    
        $user = User::create($data);

        $user->sendEmailVerificationNotification();


        return response()->json([
            'message'=> 'inscription reussie, un mail d activation vous a ete envoyé',
            'user' => new UserResource($user)
        ],200);
    }

    public function verify(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return response()->json(['message' => 'Hash invalide'], 400);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email déjà vérifié'], 200);
        }

        $user->markEmailAsVerified();
        
        Mail::to($user->getEmailForVerification())->send(new WelcomeMail($user->name, $user->email));
        
        return response()->json([
            'message'=> 'email verifié avec succes',
            'user'=> new UserResource($user)
            
        ],200);
    }

    public function resend(Request $request)
    {
        $request->user()->sendEmailVerificationNotification();

        return response()->json([
            'message'=> 'un nouveau mail d activation vous a ete envoyé'
        ],200);
    }

   



    public function login(StoreLoginRequest $request)
    {
        $credentials = $request->validated();
        
        $user = User::where('email', $credentials['email'])->first();
        
        if (!$user || !Hash::check($credentials['password'], $user['password'])) {
            return response()->json(['message' => 'Invalid login credentials'], 401);
        }

        $token = $user->createToken(env('TOKEN_SECRET'))->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        return new UserResource($user);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
       // update simple user info not agency so check if !agency
         $data = $request->only(['name', 'email', 'password', 'role']);     
            if (isset($data['password'])) {
                $data['password'] = bcrypt($data['password']);
            }
            $user->update($data);
            return new UserResource($user);
    
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();
        return response()->json([
            'message' => 'User deleted successfully.'
        ], 200);
    }

    public function me(Request $request)
    {
        return new UserResource($request->user());
    }

    public function logout(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $token = $user->currentAccessToken();

        if ($token) {
            $token->delete();

             return response()->json([
            'message' => 'Logged out successfully.'
        ], 200);
        }

        return response()->json(['message' => 'No active token found.'], 400);

       
    }
}