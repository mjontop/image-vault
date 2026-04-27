"use client";

import { Button } from "@core/components/ui/button";
import { Label } from "@core/components/ui/label";
import { Input } from "@core/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/components/ui/dialog";

interface PasswordModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  password: string;
  onPasswordChange: (password: string) => void;
  onConfirm: () => void;
}

export function PasswordModal({
  isOpen,
  onOpenChange,
  password,
  onPasswordChange,
  onConfirm
}: PasswordModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Encryption Password</DialogTitle>
          <DialogDescription>
            Enter a password to encrypt your images. This password will be required to view them later.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="modal-password">Password</Label>
          <Input
            id="modal-password"
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="Enter secure password"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && onConfirm()}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onConfirm} className="bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900">Start Process</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}