<?php

namespace App\Actions\Rental;

use App\Enums\RentalApplicationStatus;
use App\Exceptions\RentalApplicationNotOpenException;
use App\Models\RentalApplication;
use App\Models\User;
use App\Notifications\RentalApplicationAccepted;
use App\Notifications\RentalApplicationDocumentsRequested;
use App\Notifications\RentalApplicationRejected;
use Illuminate\Support\Facades\DB;

/**
 * The agency's three possible answers to an application: accept, reject with a
 * reason, or ask for more documents.
 *
 * One action rather than three because the guard (is it still open?), the audit
 * trail (who decided, when) and the notify-after-commit rule are identical; only
 * the target state and the message differ. Splitting them would triplicate the
 * guard and invite the three copies to drift.
 */
class ReviewRentalApplication
{
    /**
     * @throws RentalApplicationNotOpenException
     */
    public function accept(RentalApplication $application, User $reviewer): RentalApplication
    {
        return $this->decide($application, $reviewer, RentalApplicationStatus::Accepted, [], function ($app) {
            $app->applicant?->notify(new RentalApplicationAccepted($app));
        });
    }

    /**
     * RG-L07: the reason is mandatory, and is validated upstream by the request.
     *
     * @throws RentalApplicationNotOpenException
     */
    public function reject(RentalApplication $application, User $reviewer, string $reason): RentalApplication
    {
        return $this->decide(
            $application,
            $reviewer,
            RentalApplicationStatus::Rejected,
            ['rejection_reason' => $reason],
            fn ($app) => $app->applicant?->notify(new RentalApplicationRejected($app))
        );
    }

    /**
     * Not a decision: the application stays live, the ball moves to the
     * candidate. It therefore keeps blocking a second application.
     *
     * @throws RentalApplicationNotOpenException
     */
    public function requestDocuments(RentalApplication $application, User $reviewer, string $documents): RentalApplication
    {
        return $this->decide(
            $application,
            $reviewer,
            RentalApplicationStatus::DocumentsRequested,
            ['requested_documents' => $documents],
            fn ($app) => $app->applicant?->notify(new RentalApplicationDocumentsRequested($app))
        );
    }

    /**
     * @param  array<string, mixed>  $extra
     * @param  callable(RentalApplication): void  $notify
     *
     * @throws RentalApplicationNotOpenException
     */
    private function decide(
        RentalApplication $application,
        User $reviewer,
        RentalApplicationStatus $status,
        array $extra,
        callable $notify,
    ): RentalApplication {
        if (! $application->status->isOpenToReview()) {
            throw new RentalApplicationNotOpenException();
        }

        $application->update([
            ...$extra,
            'status' => $status,
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
        ]);

        $application->load(['property', 'applicant']);

        // After the commit: a mail failure must not undo a recorded decision.
        DB::afterCommit(fn () => $notify($application));

        return $application;
    }
}
