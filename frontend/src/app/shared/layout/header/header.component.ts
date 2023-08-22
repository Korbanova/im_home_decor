import {Component, Input, OnInit} from '@angular/core';
import {CategoryType} from "../../../../types/category.type";
import {AuthService} from "../../../core/auth/auth.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {CategoryWithTypeType} from "../../../../types/category-with-type.type";
import {CartService} from "../../services/cart.service";
import {count} from "rxjs";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  isLogged: boolean = false

  @Input() categories: CategoryWithTypeType[] = [];
  count: number = 0;

  constructor(private authService: AuthService,
              private _snackBar: MatSnackBar,
              private router: Router,
              private cartService: CartService) {
    this.isLogged = this.authService.getIsLoggedIn();
  }

  ngOnInit() {
    this.authService.isLogged$.subscribe((isLoggedIn: boolean) => {
      this.isLogged = isLoggedIn;
    })

    //Получение кол-во товаров в корзине
    this.cartService.getCartCount()
      .subscribe(data => {
        this.count = data.count;
      })

    // Подписываемся на изменения
    this.cartService.count$.subscribe(count => {
      this.count = count;
    })
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: (data: DefaultResponseType) => {
        this.doLogout();
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.doLogout();
      }
    })
  }

  doLogout(): void {
    this.authService.removeTokens();
    this.authService.userId = null;
    this._snackBar.open('Вы вышли из сиситемы');
    this.router.navigate(['/']);
  }
}
