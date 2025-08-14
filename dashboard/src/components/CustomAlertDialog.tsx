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
} from "@/components/ui/alert-dialog";
import { type ReactNode } from "react";

interface CustomAlertDialogProps {
  trigger: ReactNode;
  title: ReactNode;
  description: ReactNode;
  cancelText?: ReactNode;
  actionText?: ReactNode;
  onAction: () => void;
}

const CustomAlertDialog: React.FC<CustomAlertDialogProps> = ({
  trigger,
  title,
  description,
  cancelText = "Cancel",
  actionText = "Continue",
  onAction,
}) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>{cancelText}</AlertDialogCancel>
        <AlertDialogAction onClick={onAction}>{actionText}</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default CustomAlertDialog;
