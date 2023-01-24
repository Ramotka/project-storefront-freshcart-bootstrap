import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header.component';

@NgModule({
  imports: [RouterModule, CommonModule],
  declarations: [HeaderComponent],
  providers: [],
  exports: [HeaderComponent],
})
export class HeaderComponentModule {}
