export interface ProductModel {
  readonly id: string;
  readonly categoryId: string;
  readonly featureValue: number;
  readonly imageUrl: string;
  readonly name: string;
  readonly price: number;
  readonly ratingCount: number;
  readonly ratingValue: number;
}
