import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FooterComponent } from './footer.component';

@NgModule({
  imports: [RouterModule, CommonModule],
  declarations: [FooterComponent],
  providers: [],
  exports: [FooterComponent],
})
export class FooterComponentModule {}
