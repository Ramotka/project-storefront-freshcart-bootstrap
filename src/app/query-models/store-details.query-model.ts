import { ProductByStoreQueryModel } from './product-by-store.query-model';

export interface StoreDetailsQueryModel {
  readonly name: string;
  readonly logo: string;
  readonly distance: number;
  readonly products: ProductByStoreQueryModel[];
}
