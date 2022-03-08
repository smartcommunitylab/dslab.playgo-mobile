/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable no-underscore-dangle */
import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { Map, Control, ControlPosition, LatLng } from 'leaflet';

@Component({
  selector: 'app-current-location-map-control',
  templateUrl: './current-location-map-control.component.html',
  styleUrls: ['./current-location-map-control.component.scss'],
})
export class CurrentLocationMapControlComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  public control: Control;

  @Input() mapCenter: LatLng;
  @Input() position: ControlPosition = 'topleft';
  @Input() map: Map;

  @ViewChild('customLocationControl', { static: true })
  public controlElement: ElementRef;

  constructor() {}

  ngAfterViewInit() {
    this.createControl(this.map, this.controlElement);
  }

  ngOnInit() {}

  ngOnDestroy() {
    if (this.map && this.control) {
      this.map.removeControl(this.control);
    }
  }

  public onClick(): void {
    this.map.setView(this.mapCenter);
  }

  /** Should be called once map and control element are available */
  private createControl(map: Map, controlElement: ElementRef) {
    this.control = this.getControl(controlElement);
    this.control.addTo(map);
  }

  private getControl(controlElement: ElementRef) {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const Custom = Control.extend({
      onAdd(map: Map) {
        return controlElement.nativeElement;
      },
      onRemove(map: Map) {},
    });
    return new Custom({
      position: this.position,
    });
  }
}
