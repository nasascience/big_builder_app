//import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { PebElementType } from '@pe/builder-core';
import { FormGroup, FormControl } from '@angular/forms';
import { PebEditorElement } from '../../renderer/editor-element';
import { PebAbstractEditor } from '../../root/abstract-editor';
import { colorForControl } from '../element-anchors/element-anchors.control';
import { PebEditorElementSection } from '../../renderer/elements/editor-element-section';
import { PebEditorRenderer } from '../../renderer/editor-renderer';
import { PebEditorState } from '../../services/editor.state';
export const THREE_ANCHORS_MIN_SIZE = 20;

export enum ButtonType {
  TopCenter = 'top-center',
  BottomCenter = 'bottom-center',
}

@Component({
  selector: 'peb-editor-controls-button',
  templateUrl: './element-button.control.html',
  styleUrls: ['./element-button.control.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PebEditorElementButtonControl {

  dimensions: {
    width: number;
    height: number;
    top: number;
    left: number;
  };

  PebElementType = PebElementType;
  anchorSize = 9;

  points = [];

  @Input() component: PebEditorElement;
 static sectionComponent: PebEditorElementSection;

  @Input() type: 'hovered';

  @Input() valid = true;

  @Input() variant: 'default' | 'invalid' | 'hidden' = 'default';

  constructor(
    private editor: PebAbstractEditor,
    private elementRef: ElementRef,
    public cdr: ChangeDetectorRef,
    private editorState:PebEditorState,
  ) { }

  static construct(editor: PebAbstractEditor, element: PebEditorElement) {
    const control = editor.createControl(PebEditorElementButtonControl);

    control.instance.component = element;

    element.controlsSlot.insert(control.hostView);
    element.controls.buttons = control;

    return control;
  }

  get elementDefinition() {
    return this.component.definition ?? (this.component as any)?.element; /* element or maker */
  }

  detectChanges() {
    // TODO: check
    if (!this.component?.nativeElement) {
      return;
    }

    const elementNode = this.component.nativeElement;
    const elementDs = elementNode.getBoundingClientRect()

    const borderWidth = elementNode.style.borderWidth ? parseInt(elementNode.style.borderWidth, 10) : 0;

    this.dimensions = {
      width: elementDs.width,
      height: elementDs.height,
      top: 0 - borderWidth,
      left: 0 - borderWidth,
    };

    this.points = this.createElementPoints();

    this.cdr.detectChanges();
  }

  // get nativeElement() {
  //   return this.elementRef.nativeElement;
  // }

   get elementId() {
     return this.elementDefinition.id;
   }

   get color() {
     return colorForControl(this.variant);
   }

  getButtonTypeClass(type: ButtonType): string {
    if ([ButtonType.TopCenter, ButtonType.BottomCenter].includes(type)) {
      return 'ns';
    }
  }

  private createElementPoints() {
    const { width, height } = this.dimensions;

    const points = [
      {
        type: ButtonType.TopCenter,
        x: width / 2,
        y: 0,
        shown: width > THREE_ANCHORS_MIN_SIZE,
      },
      {
        type: ButtonType.BottomCenter,
        x: width / 2,
        y: height,
        shown: width > THREE_ANCHORS_MIN_SIZE,
      },
    ];

    return points;
  }

  addSectionBtnClick(type: ButtonType) {
    if(type ==  ButtonType.TopCenter)
      this.addSection(false)
      else
      this.addSection(true)
  }

  addSection(after?: boolean): void {
   console.log(`addSection ${after?"after":"before"}`)
    let sectionComponent = this.editorState.hoveredObjCmp
    sectionComponent.section.initialValue.isFirstSection = false;
    sectionComponent.section.form.get('newElement').patchValue(after);
  }

}
