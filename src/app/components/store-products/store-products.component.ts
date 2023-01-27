import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { StoreDetailsQueryModel } from '../../query-models/store-details.query-model';
import { StoreModel } from '../../models/store.model';
import { ProductModel } from '../../models/product.model';
import { StoresService } from '../../services/stores.service';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-store-products',
  templateUrl: './store-products.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreProductsComponent {
  readonly storeDetails$: Observable<StoreDetailsQueryModel> = combineLatest([
    this._activatedRoute.params.pipe(
      switchMap((params) => this._storesService.getOneStore(params['storeId']))
    ),
    this._productsService.getAllProducts(),
  ]).pipe(
    map(([store, products]: [StoreModel, ProductModel[]]) => {
      const productsByStore: ProductModel[] = products.filter((product) =>
        product.storeIds.includes(store.id)
      );

      return {
        name: store.name,
        logo: store.logoUrl.substring(1),
        distance: store.distanceInMeters / 1000,
        products: productsByStore
          .map((productByStore) => ({
            productName: productByStore.name,
            productImage: productByStore.imageUrl,
          }))
          .slice(0, 6),
      };
    })
  );

  constructor(
    private _storesService: StoresService,
    private _activatedRoute: ActivatedRoute,
    private _productsService: ProductsService
  ) {}
}
