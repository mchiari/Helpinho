import { Component, ElementRef, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css'
})

export class ButtonComponent {
  // @ElementRef() el = 

  @Input() children = "test"
}
