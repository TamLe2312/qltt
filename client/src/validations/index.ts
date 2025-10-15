import * as yup from 'yup';
import { VALIDATION_MESSAGES } from '../constants';

/**
 * Validation Schemas using Yup
 * Centralized validation rules for forms
 */

// Base validation rules
const baseValidationRules = {
  requiredString: yup.string().required(VALIDATION_MESSAGES.REQUIRED),
  requiredNumber: yup.number().required(VALIDATION_MESSAGES.REQUIRED),
  positiveNumber: yup.number().positive(VALIDATION_MESSAGES.POSITIVE_NUMBER),
  integer: yup.number().integer(VALIDATION_MESSAGES.INTEGER),
  email: yup.string().email(VALIDATION_MESSAGES.INVALID_EMAIL),
  phone: yup.string().matches(/^[0-9+\-\s()]+$/, VALIDATION_MESSAGES.INVALID_PHONE),
};

// Order Product Validation
export const orderProductSchema = yup.object({
  product_id: baseValidationRules.requiredString,
  quantity: baseValidationRules.requiredNumber
    .min(1, VALIDATION_MESSAGES.MIN_VALUE(1))
    .integer(VALIDATION_MESSAGES.INTEGER),
  price: baseValidationRules.requiredNumber
    .min(0, VALIDATION_MESSAGES.MIN_VALUE(0)),
  product_name: yup.string().optional(),
  sku: yup.string().optional(),
});

// Order Create Form Validation
export const orderCreateSchema = yup.object({
  user_id: baseValidationRules.requiredString
    .min(1, VALIDATION_MESSAGES.MIN_LENGTH(1)),
  
  branch_id: baseValidationRules.requiredString
    .min(1, VALIDATION_MESSAGES.MIN_LENGTH(1)),
  
  note: yup.string()
    .max(500, VALIDATION_MESSAGES.MAX_LENGTH(500))
    .default(''),
  
  // Address fields
  street: baseValidationRules.requiredString
    .min(5, VALIDATION_MESSAGES.MIN_LENGTH(5))
    .max(200, VALIDATION_MESSAGES.MAX_LENGTH(200)),
  
  ward: baseValidationRules.requiredString
    .min(2, VALIDATION_MESSAGES.MIN_LENGTH(2))
    .max(100, VALIDATION_MESSAGES.MAX_LENGTH(100)),
  
  district: baseValidationRules.requiredString
    .min(2, VALIDATION_MESSAGES.MIN_LENGTH(2))
    .max(100, VALIDATION_MESSAGES.MAX_LENGTH(100)),
  
  city: baseValidationRules.requiredString
    .min(2, VALIDATION_MESSAGES.MIN_LENGTH(2))
    .max(100, VALIDATION_MESSAGES.MAX_LENGTH(100)),
  
  country: baseValidationRules.requiredString
    .min(2, VALIDATION_MESSAGES.MIN_LENGTH(2))
    .max(50, VALIDATION_MESSAGES.MAX_LENGTH(50)),
  
  zipcode: baseValidationRules.requiredString
    .matches(/^[0-9]{5,10}$/, 'Mã bưu điện phải có 5-10 chữ số'),
  
  // Products array validation
  products: yup.array()
    .of(orderProductSchema)
    .min(1, 'Phải chọn ít nhất một sản phẩm')
    .required(VALIDATION_MESSAGES.REQUIRED),
});

// Branch Validation
export const branchSchema = yup.object({
  name: baseValidationRules.requiredString
    .min(2, VALIDATION_MESSAGES.MIN_LENGTH(2))
    .max(100, VALIDATION_MESSAGES.MAX_LENGTH(100)),
  
  street: baseValidationRules.requiredString
    .min(5, VALIDATION_MESSAGES.MIN_LENGTH(5))
    .max(200, VALIDATION_MESSAGES.MAX_LENGTH(200)),
  
  ward: baseValidationRules.requiredString
    .min(2, VALIDATION_MESSAGES.MIN_LENGTH(2))
    .max(100, VALIDATION_MESSAGES.MAX_LENGTH(100)),
  
  district: baseValidationRules.requiredString
    .min(2, VALIDATION_MESSAGES.MIN_LENGTH(2))
    .max(100, VALIDATION_MESSAGES.MAX_LENGTH(100)),
  
  city: baseValidationRules.requiredString
    .min(2, VALIDATION_MESSAGES.MIN_LENGTH(2))
    .max(100, VALIDATION_MESSAGES.MAX_LENGTH(100)),
  
  country: baseValidationRules.requiredString
    .min(2, VALIDATION_MESSAGES.MIN_LENGTH(2))
    .max(50, VALIDATION_MESSAGES.MAX_LENGTH(50)),
  
  zipcode: baseValidationRules.requiredString
    .matches(/^[0-9]{5,10}$/, 'Mã bưu điện phải có 5-10 chữ số'),
  
  email: baseValidationRules.email.required(VALIDATION_MESSAGES.REQUIRED),
  
  phone: baseValidationRules.phone.required(VALIDATION_MESSAGES.REQUIRED),
});

// Product Validation
export const productSchema = yup.object({
  name: baseValidationRules.requiredString
    .min(2, VALIDATION_MESSAGES.MIN_LENGTH(2))
    .max(200, VALIDATION_MESSAGES.MAX_LENGTH(200)),
  
  sku: baseValidationRules.requiredString
    .min(3, VALIDATION_MESSAGES.MIN_LENGTH(3))
    .max(50, VALIDATION_MESSAGES.MAX_LENGTH(50)),
  
  price: baseValidationRules.requiredNumber
    .min(0, VALIDATION_MESSAGES.MIN_VALUE(0)),
  
  short_description: yup.string()
    .max(500, VALIDATION_MESSAGES.MAX_LENGTH(500))
    .optional(),
  
  description: yup.string()
    .max(2000, VALIDATION_MESSAGES.MAX_LENGTH(2000))
    .optional(),
  
  unit_of_measure: baseValidationRules.requiredString
    .min(1, VALIDATION_MESSAGES.MIN_LENGTH(1))
    .max(20, VALIDATION_MESSAGES.MAX_LENGTH(20)),
  
  status: yup.string()
    .oneOf(['active', 'inactive'], 'Trạng thái không hợp lệ')
    .required(VALIDATION_MESSAGES.REQUIRED),
});

// User Validation
export const userSchema = yup.object({
  customer_code: baseValidationRules.requiredString
    .min(3, VALIDATION_MESSAGES.MIN_LENGTH(3))
    .max(20, VALIDATION_MESSAGES.MAX_LENGTH(20)),
  
  full_name: baseValidationRules.requiredString
    .min(2, VALIDATION_MESSAGES.MIN_LENGTH(2))
    .max(100, VALIDATION_MESSAGES.MAX_LENGTH(100)),
  
  email: baseValidationRules.email.required(VALIDATION_MESSAGES.REQUIRED),
  
  phone: baseValidationRules.phone.required(VALIDATION_MESSAGES.REQUIRED),
  
  status: yup.string()
    .oneOf(['active', 'inactive'], 'Trạng thái không hợp lệ')
    .required(VALIDATION_MESSAGES.REQUIRED),
});

// Export all schemas
export const validationSchemas = {
  orderCreate: orderCreateSchema,
  orderProduct: orderProductSchema,
  branch: branchSchema,
  product: productSchema,
  user: userSchema,
} as const;

// Type inference for form data
export type OrderCreateFormData = yup.InferType<typeof orderCreateSchema>;
export type OrderProductData = yup.InferType<typeof orderProductSchema>;
export type BranchFormData = yup.InferType<typeof branchSchema>;
export type ProductFormData = yup.InferType<typeof productSchema>;
export type UserFormData = yup.InferType<typeof userSchema>;
