import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CategoryModel } from '../../models/category.model';
import { CategoriesService } from '../../services/categories.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  readonly categories$: Observable<CategoryModel[]> =
    this._categoriesService.getAllCategories();
  private _showSideMenuSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public showSideMenu$: Observable<boolean> =
    this._showSideMenuSubject.asObservable();

  constructor(private _categoriesService: CategoriesService) {}

  showSideMenu(showSideMenu: boolean): void {
    this._showSideMenuSubject.next(showSideMenu);
  }
}
