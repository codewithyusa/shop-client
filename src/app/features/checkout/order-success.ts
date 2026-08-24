import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './order-success.html',
  styleUrl: './order-success.scss',
})
export class OrderSuccess implements OnInit {
  private route = inject(ActivatedRoute);
  orderId = signal('');
  confettiItems: string[] = [];

  private colors = ['#e53935', '#fff', '#ff8a80', '#ffcdd2', '#b71c1c', '#ff5252', '#ffd700', '#ff69b4'];

  ngOnInit() {
    const id = this.route.snapshot.queryParamMap.get('orderId') ?? '';
    this.orderId.set(id);
    this.generateConfetti();
  }

  generateConfetti() {
    this.confettiItems = Array.from({ length: 80 }, () => {
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      const left = Math.random() * 100;
      const duration = 2 + Math.random() * 4;
      const delay = Math.random() * 4;
      const size = 6 + Math.random() * 10;
      const isCircle = Math.random() > 0.5;
      return `left:${left}%;animation-duration:${duration}s;animation-delay:${delay}s;background:${color};width:${size}px;height:${size}px;border-radius:${isCircle ? '50%' : '2px'}`;
    });
  }
}