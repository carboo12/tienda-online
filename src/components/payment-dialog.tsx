
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
import { useAuth } from '@/hooks/use-auth';
import { getFirestore, doc, runTransaction, collection, addDoc, Timestamp } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { Textarea } from './ui/textarea';

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
  const { app, user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegisterPayment = async () => {
    const paymentAmount = parseFloat(amount);
    if (!app || !user || isNaN(paymentAmount) || paymentAmount <= 0) {
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
          createdAt: Timestamp.now(),
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
