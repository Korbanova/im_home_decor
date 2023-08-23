import {Component, Input, OnInit} from '@angular/core';
import {ProductType} from "../../../../types/product.type";
import {environment} from "../../../../environments/environment";
import {CartService} from "../../services/cart.service";
import {CartType} from "../../../../types/cart.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {FavoriteType} from "../../../../types/favorite.type";
import {FavoriteService} from "../../services/favorite.service";
import {AuthService} from "../../../core/auth/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";

@Component({
  selector: 'product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit {
  @Input() product!: ProductType;
  serverStaticPath = environment.serverStaticPath;
  count: number = 1;
  @Input() isLight: boolean = false;

  @Input() countInCart: number | undefined = 0;

  constructor(private cartService: CartService,
              private favoriteService: FavoriteService,
              private authService: AuthService,
              private _snackBar: MatSnackBar,
              private router: Router) {
  }

  ngOnInit() {
    if (this.countInCart && this.countInCart > 1) {
      this.count = this.countInCart;
    }
  }

  addToCart() {
    this.cartService.updateCart(this.product.id, this.count)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.countInCart = this.count;
      });
  }

  removeFromCart() {
    this.cartService.updateCart(this.product.id, 0)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }

        this.countInCart = 0;
        this.count = 1;
      });
  }

  updateCount(value: number) {
    this.count = value;

    // обновление корзины
    if (this.countInCart) {
      this.cartService.updateCart(this.product.id, this.count)
        .subscribe((data: CartType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }

          this.countInCart = this.count;
        });
    }
  }

  updateToFavorite() {
    if (!this.authService.getIsLoggedIn()) {
      this._snackBar.open('Для добавления в избранное необходимо авторизоваться');
      return;
    }

    if (this.product.isInFavorite) {
      // Удаляем
      this.favoriteService.removeFavorite(this.product.id)
        .subscribe((data: DefaultResponseType) => {
          if (data.error) {
            // можно выводить её польз-лю через snackbar
            throw new Error(data.message);
          }
          //
          this.product.isInFavorite = false;

        })
    } else {
      // Добавляем
      this.favoriteService.addFavorite(this.product.id)
        .subscribe((data: DefaultResponseType | FavoriteType) => {
          if ((data as DefaultResponseType).error) {
            throw new Error((data as DefaultResponseType).message);
          }

          //Установить флаг, что продукт добавлен в избрвнное
          this.product.isInFavorite = true;
        })
    }
  }

  navigate() {
    if (this.isLight) {
      this.router.navigate(['/product/' + this.product.url]);
    }

  }
}

