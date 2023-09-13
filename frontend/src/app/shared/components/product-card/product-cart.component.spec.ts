import {ProductCardComponent} from "./product-card.component";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {CartService} from "../../services/cart.service";
import {AuthService} from "../../../core/auth/auth.service";
import {Router} from "@angular/router";
import {FavoriteService} from "../../services/favorite.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {of, throttle} from "rxjs";
import {ProductType} from "../../../../types/product.type";

describe('product cart', () => {
  let productCartComponent: ProductCardComponent;
  let fixture: ComponentFixture<ProductCardComponent>;
  let product: ProductType;

  beforeEach(() => {
    const cartServiceSpy = jasmine.createSpyObj('CartService', ['updateCart']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getIsLoggedIn']);
    const routerServiceSpy = jasmine.createSpyObj('Router', ['navigate']);
    const _snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
    const favoriteServiceSpy = jasmine.createSpyObj('FavoriteService', ['removeFavorite', 'addFavorite']);

    TestBed.configureTestingModule({
      declarations: [ProductCardComponent],
      providers: [
        {provide: CartService, useValue: cartServiceSpy},
        {provide: AuthService, useValue: authServiceSpy},
        {provide: Router, useValue: routerServiceSpy},
        {provide: MatSnackBar, useValue: _snackBarSpy},
        {provide: FavoriteService, useValue: favoriteServiceSpy},
      ]
    })

    fixture = TestBed.createComponent(ProductCardComponent);
    productCartComponent = fixture.componentInstance;
    product = {
      id: 'test',
      name: 'test',
      price: 1,
      image: 'test',
      lightning: 'test',
      humidity: 'test',
      temperature: 'test',
      height: 1,
      diameter: 1,
      url: 'test',
      type: {
        id: 'test',
        name: 'test',
        url: 'test'
      }
    }
    // productCartComponent.product = product;
  })

  it('should have count init value 1', () => {
    expect(productCartComponent.count).toBe(1);
  })

  it('should set value from input countInCart to count', () => {
    productCartComponent.countInCart = 5;
    fixture.detectChanges();
    expect(productCartComponent.count).toBe(5);
  })

  it('should сall removeFromCart with count 0', () => {
    const cartServiceSpy = TestBed.inject(CartService) as jasmine.SpyObj<CartService>;
    cartServiceSpy.updateCart.and.returnValue(of({
        items: [
          {
            product: {
              id: '1',
              name: '1',
              url: '1',
              image: '1',
              price: 1,
            },
            quantity: 1
          }
        ]
      }
    ));

    productCartComponent.product = product;
    productCartComponent.removeFromCart();
    expect(cartServiceSpy.updateCart).toHaveBeenCalledOnceWith(product.id, 0);
  })

  it('should hide product-card-info and product-card-extra if it is light cart', () => {
    productCartComponent.isLight = true;
    productCartComponent.product = product;
    fixture.detectChanges();

    const componentElement: HTMLElement = fixture.nativeElement;
    const productCartInfo: HTMLElement | null = componentElement.querySelector('.product-card-extra');
    const productCartExtra: HTMLElement | null = componentElement.querySelector('.product-card-info');

    expect(productCartInfo).toBe(null);
    expect(productCartExtra).toBe(null);

  })

  it('should call navigate for light card', () => {
    const routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    productCartComponent.product = product;

    productCartComponent.isLight = true;

    productCartComponent.navigate();

    expect(routerSpy.navigate).toHaveBeenCalled()

  })
})
