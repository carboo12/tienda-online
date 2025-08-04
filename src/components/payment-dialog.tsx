
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getFirestore, doc, runTransaction, collection, addDoc, Timestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { getApps, getApp, initializeApp } from 'firebase/app';
import { getCurrentUser } from '@/lib/auth';


const firebaseConfig = {
  "projectId": "multishop-manager-3x6vw",
  "appId": "1:900084459529:web:bada387e4da3d34007b0d8",
  "storageBucket": "multishop-manager-3x6vw.firebasestorage.app",
  "apiKey": "AIzaSyCOSWahgg7ldlIj1kTaYJy6jFnwmVThwUE",
  "authDomain": "multishop-manager-3x6vw.firebaseapp.com",
  "messagingSenderId": "900084459529"
};


interface Client {
  id: string;
  name: string;
  balance: number;
}

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
}

export function PaymentDialog({ isOpen, onClose, client }: PaymentDialogProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = getCurrentUser();

  const handleRegisterPayment = async () => {
    const paymentAmount = parseFloat(amount);
    if (!user || isNaN(paymentAmount) || paymentAmount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Monto Inválido',
        description: 'Por favor, ingresa un monto de abono válido y mayor a cero.',
      });
      return;
    }
    
    if (paymentAmount > client.balance) {
      toast({
        variant: 'destructive',
        title: 'Monto Excede Saldo',
        description: `El abono no puede ser mayor que el saldo pendiente de C$ ${client.balance.toFixed(2)}.`,
      });
      return;
    }

    setIsSubmitting(true);
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app);

    try {
      await runTransaction(db, async (transaction) => {
        const clientRef = doc(db, 'clients', client.id);
        const clientDoc = await transaction.get(clientRef);

        if (!clientDoc.exists()) {
          throw new Error("El cliente no fue encontrado.");
        }

        const currentBalance = clientDoc.data().balance;
        const newBalance = currentBalance - paymentAmount;

        // 1. Update client's balance
        transaction.update(clientRef, { balance: newBalance });

        // 2. Create a new payment record
        const paymentRef = doc(collection(db, 'payments'));
        transaction.set(paymentRef, {
          clientId: client.id,
          clientName: client.name,
          amount: paymentAmount,
          notes: notes,
          registeredBy: user.name,
          storeId: user.storeId || null,
          createdAt: Timestamp.now(),
        });
        
        // 3. Create a notification for the store admin or general admin
        const notificationRef = doc(collection(db, 'notifications'));
        const notificationMessage = `Abono de C$ ${paymentAmount.toFixed(2)} registrado para ${client.name} por ${user.name}.`;
        transaction.set(notificationRef, {
            message: notificationMessage,
            storeId: user.storeId || null, // Associates with a store, or null for general admin
            isRead: false,
            createdAt: Timestamp.now(),
            type: 'PAYMENT_RECEIVED',
            link: `/clients/edit/${client.id}`
        });
      });

      toast({
        title: 'Abono Registrado',
        description: `El pago de C$ ${paymentAmount.toFixed(2)} para ${client.name} ha sido registrado exitosamente.`,
      });
      
      handleClose();

    } catch (error: any) {
      console.error("Error al registrar el pago: ", error);
      toast({
        variant: 'destructive',
        title: 'Error en la Transacción',
        description: error.message || 'No se pudo completar la operación. El saldo y el pago no fueron registrados.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Registrar Abono</DialogTitle>
          <DialogDescription>
            Ingresa el monto del abono para el cliente <span className="font-semibold">{client.name}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="current-balance" className="whitespace-nowrap">Saldo Actual:</Label>
            <p id="current-balance" className="font-bold text-lg">C$ {client.balance.toFixed(2)}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Monto del Abono (C$)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ej: 500.00"
              required
              disabled={isSubmitting}
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="notes">Notas (Opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Abono a factura #123"
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
             <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                Cancelar
              </Button>
          </DialogClose>
          <Button type="button" onClick={handleRegisterPayment} disabled={isSubmitting || !amount}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Registrando...' : 'Registrar Abono'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
