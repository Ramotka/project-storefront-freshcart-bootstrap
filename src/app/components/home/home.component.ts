import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { CategoryModel } from '../../models/category.model';
import { StoreModel } from '../../models/store.model';
import { ProductModel } from '../../models/product.model';
import { CategoriesService } from '../../services/categories.service';
import { StoresService } from '../../services/stores.service';
import { ProductsService } from '../../services/products.service';
import { StoreTagModel } from 'src/app/models/store-tag.model';
import { StoreCardsQueryModel } from 'src/app/query-models/store-cards.query-model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  readonly categories$: Observable<CategoryModel[]> = this._categoriesService
    .getAllCategories()
    .pipe(
      map((categories) =>
        categories.map((category) => ({
          id: category.id,
          name: category.name,
          imageUrl: category.imageUrl.substring(1),
        }))
      )
    );
  readonly stores$: Observable<StoreCardsQueryModel[]> = combineLatest([
    this._storesService.getAllStores(),
    this._storesService.getAllStoreTags(),
  ]).pipe(
    map(([stores, tags]: [StoreModel[], StoreTagModel[]]) => {
      const tagsMap: Record<string, StoreTagModel> = tags.reduce((a, c) => {
        return { ...a, [c.id]: c };
      }, {}) as Record<string, StoreTagModel>;

      return stores.map((store) => ({
        id: store.id,
        name: store.name,
        image: store.logoUrl.substring(1),
        distance: store.distanceInMeters / 1000,
        tags: store.tagIds.map((tagId) => tagsMap[tagId].name),
      }));
    })
  );
  readonly fruitCategoryProducts$: Observable<ProductModel[]> =
    this._productsService.getAllProducts().pipe(
      map((products) =>
        products
          .filter((product) => product.categoryId === '5')
          .sort((a, b) => {
            if (a.featureValue > b.featureValue) return -1;
            if (a.featureValue < b.featureValue) return 1;
            return 0;
          })
          .slice(0, 5)
      )
    );

  readonly snackCategoryProducts$: Observable<ProductModel[]> =
    this._productsService.getAllProducts().pipe(
      map((products) =>
        products
          .filter((product) => product.categoryId === '2')
          .sort((a, b) => {
            if (a.featureValue > b.featureValue) return -1;
            if (a.featureValue < b.featureValue) return 1;
            return 0;
          })
          .slice(0, 5)
      )
    );

  constructor(
    private _categoriesService: CategoriesService,
    private _storesService: StoresService,
    private _productsService: ProductsService
  ) {}
}
