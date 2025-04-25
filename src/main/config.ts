export enum NODE_ENV_ENUM {
  DEV = 'development',
  PROD = 'prodcution',
}
export const NODE_ENV = process.env.NODE_ENV || NODE_ENV_ENUM.DEV;
