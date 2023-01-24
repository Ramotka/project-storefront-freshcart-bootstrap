import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoryModel } from './models/category.model';
import { StoreModel } from './models/store.model';
import { CategoriesService } from './services/categories.service';
import { StoresService } from './services/stores.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'ng-freshcard-bootstrap-theme';

  readonly categories$: Observable<CategoryModel[]> =
    this._categoriesService.getAllCategories();
  readonly stores$: Observable<StoreModel[]> = this._storesService.getAllStores();

  constructor(private _categoriesService: CategoriesService, private _storesService: StoresService) { }
}
