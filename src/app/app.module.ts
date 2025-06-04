import { HttpClientModule } from '@angular/common/http'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { ProductService } from './core/services/product.service'
import { ProductFormComponent } from './features/products/components/product-form/product-form.component'
import { ProductListComponent } from './features/products/components/product-list/product-list.component'
import { AddProductPageComponent } from './features/products/pages/add-product-page/add-product-page.component'
import { EditProductPageComponent } from './features/products/pages/edit-product-page/edit-product-page.component'
import { ProductsPageComponent } from './features/products/pages/products-page/products-page.component'
import { ConfirmationModalComponent } from './shared/components/confirmation-modal/confirmation-modal.component'
import { LoadingSkeletonComponent } from './shared/components/loading-skeleton/loading-skeleton.component'

@NgModule({
  declarations: [
    AppComponent,
    ConfirmationModalComponent,
    LoadingSkeletonComponent,
    ProductsPageComponent,
    AddProductPageComponent,
    EditProductPageComponent,
    ProductListComponent,
    ProductFormComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [ProductService],
  bootstrap: [AppComponent]
})
export class AppModule { }
