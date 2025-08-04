export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  EXPIRED = 'EXPIRED',
}

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT_CARD = 'CREDIT_CARD',
  E_WALLET = 'E_WALLET',
  QRIS = 'QRIS',
}

export enum PaymentProvider {
  MIDTRANS = 'MIDTRANS',
  XENDIT = 'XENDIT',
  STRIPE = 'STRIPE',
}

export interface PaymentWithBooking {
  id: string;
  userId: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  provider: PaymentProvider;
  transactionId?: string;
  paymentUrl?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  booking: {
    id: string;
    propertyId: string;
    checkInDate: Date;
    checkOutDate: Date;
    totalPrice: number;
    property: {
      id: string;
      name: string;
      address: string;
    };
  };
} 