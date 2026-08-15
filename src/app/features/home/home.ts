import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Category {
  name: string;
  description: string;
  image: string;
  filter: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  categories: Category[] = [
    { name: 'T-Shirts', description: 'Explore T-Shirts', image: 'images/images.jpg', filter: 'Apparel' },
    { name: 'Jeans', description: 'Explore Jeans', image: 'images/images (5).jpg', filter: 'Jeans' },
    { name: 'Jackets', description: 'Explore Jackets', image: 'images/images (6).jpg', filter: 'Jackets' },
    { name: 'Dresses', description: 'Explore Dresses', image: 'images/images (7).jpg', filter: 'Dresses' },
    { name: 'Hoodies', description: 'Explore Hoodies', image: 'images/images (8).jpg', filter: 'Hoodies' },
    { name: 'Suits', description: 'Explore Suits', image: 'images/images (9).jpg', filter: 'Suits' },
  ];
}