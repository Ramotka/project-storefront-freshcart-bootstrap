export interface ProductModel {
  readonly id: string;
  readonly categoryId: string;
  readonly storeIds: string[];
  readonly featureValue: number;
  readonly imageUrl: string;
  readonly name: string;
  readonly price: number;
  readonly ratingCount: number;
  readonly ratingValue: number;
}
