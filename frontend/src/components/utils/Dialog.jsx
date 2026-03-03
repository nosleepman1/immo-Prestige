import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

export function ButtonDialog({
  handleClick,
  message,
  boutton,
  description = "",
  actionText = "Continuer",
  role = "default" // "supprimer" | "default"
}) {

  const isDelete = role === "supprimer"

  const triggerStyle = isDelete
    ? "bg-red-600 hover:bg-red-500 text-white"
    : "bg-blue-600 hover:bg-blue-500 text-white"

  const actionStyle = isDelete
    ? "bg-red-600 hover:bg-red-500 text-white"
    : "bg-blue-600 hover:bg-blue-500 text-white"

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className={`cursor-pointer rounded-xl gap-1.5 border-0 ${triggerStyle}`}>
          {boutton}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="bg-background text-foreground rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {message}
          </AlertDialogTitle>

          {description && (
            <AlertDialogDescription>
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">
            Annuler
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleClick}
            className={`cursor-pointer transition-colors ${actionStyle}`}
          >
            {isDelete ? "Supprimer" : actionText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}