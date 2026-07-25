<?php

namespace App\Http\Controllers;

use App\Actions\Account\ExportAccountData;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AccountController extends Controller
{
    public function export(Request $request, ExportAccountData $export): JsonResponse
    {
        return response()->json(['data' => $export->handle($request->user())]);
    }
}
