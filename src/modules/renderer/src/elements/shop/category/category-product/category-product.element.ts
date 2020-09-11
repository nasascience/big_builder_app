import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  Output,
  Renderer2,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { isArray } from 'lodash';

import {
  PebElementContext,
  PebElementContextState,
  PebElementDefData,
  PebElementStyles,
  PebElementDef,
} from '@pe/builder-core';

import { PebRendererOptions } from '../../../../renderer.types';
import { PebAbstractElement } from '../../../_abstract/abstract.element';

type CategoryProductContext = PebElementContext<any>;

enum DisplayModes {
  GRID = 'grid',
  TABLE = 'table',
}

const PRODUCT_STYLES = {
  height: {
    desktop: 500,
    tablet: 500,
    mobile: 500,
  },
  fontSize: {
    desktop: 17,
    tablet: 16,
    mobile: 14,
  },
};

@Component({
  selector: 'shop-category-product',
  templateUrl: './category-product.element.html',
  styleUrls: ['./category-product.element.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebShopCategoryProductElement extends PebAbstractElement
  implements AfterViewInit, OnChanges {
  @Input() context: CategoryProductContext;
  @Input() styles: PebElementStyles;
  @Input() options: PebRendererOptions;
  @Input() element: PebElementDef;

  // payload - product id
  @Output() navigateToPage: EventEmitter<number> = new EventEmitter();

  @ViewChild('imageRef') imageRef: ElementRef;
  @ViewChild('priceRef') priceRef: ElementRef;
  @ViewChild('titleRef') titleRef: ElementRef;

  PebElementContextState = PebElementContextState;
  defaultProductImage = '/assets/showcase-images/products/fill-1.svg';
  defaultFontFamily = 'Roboto';
  defaultFontSize = 12;
  defaultColor = '#000000';
  defaultImageBackgroundSize = '27%'; // otherwise default image will display incorrectly
  DisplayModes = DisplayModes;

  get elements(): { [key: string]: HTMLElement | HTMLElement[] } {
    return {
      host: this.nativeElement,
      image: this.imageRef?.nativeElement,
      price: this.priceRef?.nativeElement,
      title: this.titleRef?.nativeElement,
    };
  }

  get mappedStyles() {
    const { scale } = this.options;
    const image = this.context.data.image || this.defaultProductImage;

    //TODO(Maxim Andruh): Remove custom styles

    return {
      host: {
        borderColor: this.styles?.borderColor,
      },
      image: {
        backgroundImage: image ? `url('${image}')` : null,
        backgroundSize: !this.context.data.image
          ? this.defaultImageBackgroundSize
          : '',
        borderRadius: (this.styles.borderRadius as string)?.includes('%')
          ? this.styles.borderRadius
          : this.styles.borderRadius + 'px',
      },
      price: {
        color: this.styles.priceColor,
        textDecoration: this.styles.priceTextDecoration || null,
        fontWeight: this.styles.priceFontWeight,
        fontStyle: this.styles.priceFontStyle || null,
        fontFamily: this.styles.priceFontFamily || this.defaultFontFamily,
        fontSize:
          (+this.styles.priceFontSize || this.defaultFontSize) * scale + 'px',
        display: this.element.data?.hideProductPrice ? 'none' : 'block',
        textAlign: this.styles.textAlign ?? 'center',
      },
      title: {
        color: this.styles.titleColor,
        textDecoration: this.styles.titleTextDecoration || null,
        fontWeight: this.styles.titleFontWeight || null,
        fontStyle: this.styles.titleFontStyle || null,
        fontFamily: this.styles.titleFontFamily || this.defaultFontFamily,
        fontSize:
          (+this.styles.titleFontSize || this.defaultFontSize) * scale + 'px',
        display: this.element.data?.hideProductName ? 'none' : 'block',
        textAlign: this.styles.textAlign ?? 'center',
      },
    };
  }

  get loading(): boolean {
    return this.context?.state === PebElementContextState.Loading;
  }

  get displayMode(): DisplayModes {
    return this.context?.data.displayMode ?? DisplayModes.GRID;
  }

  @HostBinding('class')
  get hostClass() {
    return 'screen-' + this.options.screen;
  }

  @HostListener('click')
  openProductPage() {
    if (!this.options.interactions) {
      return;
    }

    this.navigateToPage.emit(this.context.data.id);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.applyStyles();
  }

  ngAfterViewInit() {
    this.applyStyles();
  }
}
