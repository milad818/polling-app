import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PollComponent } from './poll';

describe('Poll', () => {
  let component: PollComponent;
  let fixture: ComponentFixture<PollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PollComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PollComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
