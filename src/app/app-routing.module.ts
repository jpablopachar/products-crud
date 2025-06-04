import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { AddProductPageComponent } from './features/products/pages/add-product-page/add-product-page.component'
import { EditProductPageComponent } from './features/products/pages/edit-product-page/edit-product-page.component'
import { ProductsPageComponent } from './features/products/pages/products-page/products-page.component'

const routes: Routes = [
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  { path: 'products', component: ProductsPageComponent },
  { path: 'products/add', component: AddProductPageComponent },
  { path: 'products/edit/:id', component: EditProductPageComponent },
  { path: '**', redirectTo: '/products' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
