import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendHelpComponent } from './send-help.component';

describe('SendHelpComponent', () => {
  let component: SendHelpComponent;
  let fixture: ComponentFixture<SendHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendHelpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SendHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
