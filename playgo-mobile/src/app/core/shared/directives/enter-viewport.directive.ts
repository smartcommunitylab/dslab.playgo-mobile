import { AfterViewInit, Directive, ElementRef, EventEmitter, Host, OnDestroy, Output } from '@angular/core';

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[enterTheViewportNotifier]'
})
export class EnterTheViewportNotifierDirective implements AfterViewInit, OnDestroy {
    @Output() visibilityChange: EventEmitter<string> = new EventEmitter<string>();

    private observer: IntersectionObserver;

    constructor(@Host() private elementRef: ElementRef) { }

    ngAfterViewInit(): void {
        const options = {
            root: document.querySelector('#element'),
            rootMargin: '0px',
            threshold: 0.0
        };

        this.observer = new IntersectionObserver(this.callback, options);

        this.observer.observe(this.elementRef.nativeElement);
    }

    ngOnDestroy() {
        this.observer.disconnect();
    }

    private callback = (entries: any, observer: any) => {
        entries.forEach((entry: any) => {
            //   console.log(entry.isIntersecting ? 'I am visible' : 'I am not visible');
            this.visibilityChange.emit(entry.isIntersecting ? 'VISIBLE' : 'HIDDEN');
            // Each entry describes an intersection change for one observed
            // target element:
            //   entry.boundingClientRect
            //   entry.intersectionRatio
            //   entry.intersectionRect
            //   entry.isIntersecting
            //   entry.rootBounds
            //   entry.target
            //   entry.time
        });
    };
}
