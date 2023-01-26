import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { map, Observable } from 'rxjs';
import { CategoryModel } from '../../models/category.model';
import { StoreModel } from '../../models/store.model';
import { ProductModel } from '../../models/product.model';
import { CategoriesService } from '../../services/categories.service';
import { StoresService } from '../../services/stores.service';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  readonly categories$: Observable<CategoryModel[]> =
    this._categoriesService.getAllCategories();
  readonly stores$: Observable<StoreModel[]> =
    this._storesService.getAllStores();
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
