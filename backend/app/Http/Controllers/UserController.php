<?php

namespace App\Http\Controllers;

use App\Actions\Auth\LoginUser;
use App\Actions\Auth\RegisterUser;
use App\Actions\Auth\VerifyUserEmail;
use App\Actions\User\DeleteUser;
use App\Actions\User\UpdateUser;
use App\Data\RegisterUserData;
use App\Http\Requests\StoreLoginRequest;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\AgencyResource;
use App\Http\Resources\UserResource;
use App\Models\Agency;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function store(StoreUserRequest $request, RegisterUser $registerUser): JsonResponse
    {
        $user = $registerUser->handle(RegisterUserData::fromArray($request->validated()));

        return UserResource::make($user)->response()->setStatusCode(201);
    }

    public function login(StoreLoginRequest $request, LoginUser $loginUser): JsonResponse
    {
        $credentials = $request->validated();

        $result = $loginUser->handle($credentials['email'], $credentials['password']);

        $agency = Agency::whereBelongsTo($result['user'])->first();

        return response()->json([
            'data' => [
                'user' => new UserResource($result['user']),
                'agency' => $agency ? new AgencyResource($agency) : null,
                'token' => $result['token'],
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(null, 204);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $agency = Agency::whereBelongsTo($user)->first();

        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                'agency' => $agency ? new AgencyResource($agency) : null,
            ],
        ]);
    }

    public function update(UpdateUserRequest $request, User $user, UpdateUser $updateUser): UserResource
    {
        $this->authorize('update', $user);

        return UserResource::make($updateUser->handle($user, $request->validated()));
    }

    public function destroy(User $user, DeleteUser $deleteUser): JsonResponse
    {
        $this->authorize('delete', $user);

        $deleteUser->handle($user);

        return response()->json(null, 204);
    }

    public function verify(int $id, string $hash, VerifyUserEmail $verifyUserEmail): UserResource
    {
        return UserResource::make($verifyUserEmail->handle($id, $hash));
    }
}
