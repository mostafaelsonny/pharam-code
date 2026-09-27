export interface PharmacistUser {
  _id: string;
  name: string;
  email?: string;
}

export interface Warning {
  ingredientA?: string;
  ingredientB?: string;
  message?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface PrescriptionItem {
  drugName: string;
  activeIngredient: string;
  dosage: string;
  price: number;
  originalImage? : {data : string , mimeType : string} ,
  quantity: number;
  inStock: boolean;
  availabilityStatus: 'AVAILABLE' | 'ALTERNATIVE_AVAILABLE' | 'OUT_OF_STOCK';
  pharmacistNotes?: string; // ملاحظات الصيدلي المسجلة
  isAlternative?: boolean;
  suggestedAlternativeFor?: string;
  reviewStatus?: string;
  patientDecision?: 'ACCEPTED' | 'REJECTED' | 'PENDING';
}

export interface Prescription {
  _id: string;
  patientName: string;
  pharmacistId: string | PharmacistUser; // يدعم إما ID الصيدلي أو كائن البيانات الكامل
  deliveryId?: string | PharmacistUser; // يدعم إما ID مندوب التوصيل أو كائن البيانات الكامل
  originalImage?: { data: string; mimeType: string };
  status:
    | 'PENDING'
    | 'PENDING_PHARMACIST_REVIEW'
    | 'READY_FOR_CART'
    | 'ORDER_PENDING'
    | 'ORDER_PROCESSING'
    | 'ORDER_COMPLETED'
    | 'CANCELLED';
  paymentMethod?: 'CASH_ON_DELIVERY' | 'CARD';
  orderedAt?: string;
  items: PrescriptionItem[];
  totalAmount: number;
  warningsFound?: Warning[];
  patientInfo: {
    phone: string;
    address: string;
    email?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CheckoutPayload {
  prescriptionId: string;
  patientName: string;
  phone: string;
  address: string;
  deliveryId: string;
  paymentMethod: 'CASH_ON_DELIVERY' | 'CARD';
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  password?: string;
}

export interface ScanPrescriptionResponse {
  success: boolean;
  prescription: Prescription;
  warnings: Warning[];
}

export type UserRole = 'user' | 'pharmacist' | 'admin' | 'delivery';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isBlocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}


export interface Drug {
  _id: string;
  tradeName: string;
  activeIngredient: string[];
  category: string;
  price: number;
  stockQuantity: number;
  dosageForm: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DrugFilterParams {
  search?: string;
  category?: string;
  activeIngredient?: string;
  page?: number;
  limit?: number;
}

export interface GetDrugsResponse {
  drugs: Drug[];
  page: number;
  pages: number;
  totalDrugs: number;
}

export interface UsersPaginatedResponse {
  users: User[];
  page: number;
  pages: number;
  totalUsers: number;
}

export interface GetUsersQueryParams {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}

export interface CreateUserData {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
}

