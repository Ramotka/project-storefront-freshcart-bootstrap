import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StoreProductsComponent } from './store-products.component';

@NgModule({
  imports: [CommonModule, RouterModule],
  declarations: [StoreProductsComponent],
  providers: [],
  exports: [StoreProductsComponent],
})
export class StoreProductsComponentModule { }
