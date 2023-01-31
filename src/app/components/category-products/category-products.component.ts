import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable, combineLatest, of } from 'rxjs';
import {
  map,
  shareReplay,
  startWith,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { SortProductsOptionsQueryModel } from '../../query-models/sort-products-options.query-model';
import { CategoryModel } from '../../models/category.model';
import { StoreModel } from '../../models/store.model';
import { FilteredProductQueryModel } from '../../query-models/filtered-product.query-model';
import { ProductModel } from '../../models/product.model';
import { PageParamsQueryModel } from '../../query-models/page-params.query-model';
import { CategoriesService } from '../../services/categories.service';
import { ProductsService } from '../../services/products.service';
import { StoresService } from '../../services/stores.service';
import { RatingStarsQueryModel } from 'src/app/query-models/rating-stars.query-model';

@Component({
  selector: 'app-category-products',
  templateUrl: './category-products.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryProductsComponent {
  readonly sortOption: FormControl = new FormControl('fvDesc');
  readonly filters: FormGroup = new FormGroup({
    priceFrom: new FormControl(),
    priceTo: new FormControl(),
    stars: new FormControl('all'),
  });
  readonly storeCheckboxes: FormGroup = new FormGroup({});
  readonly searchByStore: FormControl = new FormControl('');

  readonly filtersValueChanges$: Observable<any> =
    this.filters.valueChanges.pipe(
      startWith({
        priceFrom: 0,
        priceTo: 9999,
        stars: 'all',
      }),
      shareReplay(1)
    );

  readonly sortOptions$: Observable<SortProductsOptionsQueryModel[]> = of([
    { name: 'Featured', value: 'fvDesc' },
    { name: 'Price: Low to High', value: 'priceAsc' },
    { name: 'Price: High to Low', value: 'priceDesc' },
    { name: 'Avg. Rating', value: 'rvDesc' },
  ]);

  readonly ratingStars$: Observable<RatingStarsQueryModel[]> = of([
    { id: '1', value: 5, starTypes: [1, 1, 1, 1, 1] },
    { id: '2', value: 4, starTypes: [1, 1, 1, 1, 0] },
    { id: '3', value: 3, starTypes: [1, 1, 1, 0, 0] },
    { id: '4', value: 2, starTypes: [1, 1, 0, 0, 0] },
  ]);

  readonly pageSizes$: Observable<number[]> = of([5, 10, 15]);

  readonly allCategories$: Observable<CategoryModel[]> =
    this._categoriesService.getAllCategories();

  readonly allStores$: Observable<StoreModel[]> = combineLatest([
    this._storesService.getAllStores(),
    this.searchByStore.valueChanges.pipe(startWith('')),
  ]).pipe(
    map(([stores, search]) =>
      stores.filter((store) =>
        search ? store.name.toLowerCase().includes(search.toLowerCase()) : store
      )
    ),
    tap((stores: StoreModel[]) =>
      stores.forEach((store: StoreModel) =>
        this.storeCheckboxes.addControl(store.id, new FormControl(false))
      )
    ),
    shareReplay(1)
  );

  readonly storeCheckboxesValues$: Observable<string[]> =
    this.storeCheckboxes.valueChanges.pipe(
      startWith({}),
      map((form) => Object.keys(form).filter((k) => form[k] === true)),
      shareReplay(1)
    );

  readonly categoryDetails$: Observable<CategoryModel> =
    this._activatedRoute.params.pipe(
      switchMap((params) =>
        this._categoriesService.getOneCategory(params['categoryId'])
      )
    );

  readonly allProductsInCategory$: Observable<FilteredProductQueryModel[]> =
    combineLatest([
      this._activatedRoute.params,
      this._productsService.getAllProducts(),
    ]).pipe(
      map(([params, products]: [Params, ProductModel[]]) =>
        products
          .filter((product) => product.categoryId === params['categoryId'])
          .map((productByCategory) => ({
            id: productByCategory.id,
            categoryId: productByCategory.categoryId,
            storeIds: productByCategory.storeIds,
            featureValue: productByCategory.featureValue,
            imageUrl: productByCategory.imageUrl.substring(1),
            name: productByCategory.name,
            price: productByCategory.price,
            ratingCount: productByCategory.ratingCount,
            ratingValue: productByCategory.ratingValue,
            starsNumber: Math.round(productByCategory.ratingValue),
          }))
      ),
      shareReplay(1)
    );

  readonly pageParams$: Observable<PageParamsQueryModel> =
    this._activatedRoute.queryParams.pipe(
      map((params) => ({
        pageNumber: params['pageNumber']
          ? Math.max(1, +params['pageNumber'])
          : 1,
        pageSize: params['pageSize'] ? Math.max(5, +params['pageSize']) : 5,
      })),
      shareReplay(1)
    );

  readonly filteredProducts$: Observable<FilteredProductQueryModel[]> =
    combineLatest([
      this.allProductsInCategory$,
      this.filtersValueChanges$,

      this.storeCheckboxesValues$,
    ]).pipe(
      map(([products, filters, checkboxes]) =>
        products
          .filter((product) =>
            filters.priceFrom
              ? product.price >= filters.priceFrom
              : product.price > 0
          )
          .filter((product) =>
            filters.priceTo
              ? product.price <= filters.priceTo
              : product.price < 9999
          )

          .filter((product) =>
            filters.stars == 'all'
              ? product
              : +filters.stars === product.starsNumber
          )

          .filter(
            (product) =>
              !checkboxes.length ||
              checkboxes.filter((storeId) => product.storeIds.includes(storeId))
                .length
          )
      ),
      shareReplay(1)
    );

  readonly pageNumbers$: Observable<number[]> = combineLatest([
    this.filteredProducts$,
    this.pageParams$,
  ]).pipe(
    map(([products, params]) => {
      return Array.from(
        Array(Math.ceil(products.length / params.pageSize)).keys()
      ).map((n) => n + 1);
    })
  );

  readonly products$: Observable<FilteredProductQueryModel[]> = combineLatest([
    this.filteredProducts$,
    this.sortOption.valueChanges.pipe(startWith('fvDesc')),
    this.pageParams$,
  ]).pipe(
    tap(([products, sortOption, params]) =>
      this._includeParamsEdgeCases(params)
    ),
    map(([products, sortOption, params]) =>
      products

        .sort((a, b) => {
          if (sortOption === 'fvDesc') {
            return a.featureValue < b.featureValue ? 1 : -1;
          }

          if (sortOption === 'priceAsc') {
            return a.price > b.price ? 1 : -1;
          }

          if (sortOption === 'priceDesc') {
            return a.price < b.price ? 1 : -1;
          }

          if (sortOption === 'rvDesc') {
            return a.ratingValue < b.ratingValue ? 1 : -1;
          }
          return 0;
        })
        .slice(
          (params.pageNumber - 1) * params.pageSize,
          params.pageNumber * params.pageSize
        )
    )
  );

  constructor(
    private _categoriesService: CategoriesService,
    private _activatedRoute: ActivatedRoute,
    private _productsService: ProductsService,
    private _router: Router,
    private _storesService: StoresService
  ) {}

  selectPageNumber(pageNumber: number): void {
    this.pageParams$
      .pipe(
        take(1),
        tap((params) => {
          this._router.navigate([], {
            queryParams: {
              pageNumber: pageNumber,
              pageSize: params.pageSize,
            },
          });
        })
      )
      .subscribe();
  }

  selectPageSize(limit: number): void {
    combineLatest([this.pageParams$.pipe(take(1)), this.filteredProducts$])
      .pipe(
        tap(([params, products]) => {
          this._router.navigate([], {
            queryParams: {
              pageNumber: Math.min(
                Math.ceil(products.length / limit),
                params.pageNumber
              ),
              pageSize: limit,
            },
          });
        })
      )
      .subscribe();
  }

  private _includeParamsEdgeCases(params: PageParamsQueryModel): void {
    const pageSizeParams: number = params['pageSize'];
    const pageNumberParams: number = params['pageNumber'];
    const result: number = Math.round(pageSizeParams / 5) * 5;

    this._router.navigate([], {
      queryParams: {
        pageNumber: pageNumberParams ? Math.round(pageNumberParams) : [],
        pageSize: pageSizeParams ? Math.min(Math.max(5, result), 15) : [],
      },
    });

    pageNumberParams < 1
      ? this._router.navigate([], {
          queryParams: {
            pageNumber: 1,
            pageSize: pageSizeParams,
          },
        })
      : pageNumberParams;

    this.filteredProducts$
      .pipe(
        take(1),
        tap((products) => {
          const maxPageNumber: number = Math.ceil(
            products.length / pageSizeParams
          );

          pageNumberParams > maxPageNumber
            ? this._router.navigate([], {
                queryParams: {
                  pageNumber: maxPageNumber,
                  pageSize: pageSizeParams,
                },
              })
            : pageNumberParams;
        })
      )
      .subscribe();
  }
}
