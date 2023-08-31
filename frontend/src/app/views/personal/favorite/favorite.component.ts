import {Component, OnInit} from '@angular/core';
import {FavoriteService} from "../../../shared/services/favorite.service";
import {FavoriteType} from "../../../../types/favorite.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {environment} from "../../../../environments/environment";
import {CartType} from "../../../../types/cart.type";
import {CartService} from "../../../shared/services/cart.service";

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent implements OnInit {

  products: FavoriteType[] = [];
  serverStaticPath = environment.serverStaticPath;
  // count: number = 1;
  cart: CartType | null = null;

  constructor(private favoriteService: FavoriteService,
              private cartService: CartService) {
  }

  ngOnInit() {
    // Получение данных с корзины
    this.cartService.getCart()
      .subscribe((dataCart: CartType | DefaultResponseType) => {
        if ((dataCart as DefaultResponseType).error !== undefined) {
          throw new Error((dataCart as DefaultResponseType).message);
        }

        this.cart = dataCart as CartType;

        this.favoriteService.getFavorites()
          .subscribe((data: FavoriteType[] | DefaultResponseType) => {
            if ((data as DefaultResponseType).error !== undefined) {
              const error = (data as DefaultResponseType).message;
              throw new Error(error);
            }

            // Установка товаров, кот-е есть в корзине
            if (this.cart && this.cart.items.length > 0) {
              this.products = (data as FavoriteType[]).map(product => {
                if (this.cart) {
                  const productInCart = this.cart.items.find(item => item.product.id === product.id);

                  if (productInCart) {
                    product.countInCart = productInCart.quantity;
                  }
                }
                return product;
              });
            } else {
              this.products = data as FavoriteType[];
            }

          })

      })

  }

  removeFromFavorites(id: string) {
    this.favoriteService.removeFavorite(id)
      .subscribe((data: DefaultResponseType) => {
        if(data.error){
          // можно выводить её польз-лю через snackbar
          throw new Error(data.message);
        }
        // нужно в ручную удалить его из массива products
        this.products = this.products.filter(item => item.id !== id);

      })
  }

  addToCart(product: FavoriteType) {
    this.cartService.updateCart(product.id, 1)
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }

        product.countInCart = 1;
        console.log(this.products)
      });
  }


  updateCount(value: number, product: FavoriteType) {
    product.countInCart = value;

    // обновление корзины
    if (product.countInCart) {
      this.cartService.updateCart(product.id, product.countInCart)
        .subscribe((data: CartType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }
        });
    }
  }

}
