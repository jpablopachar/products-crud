import { Component } from '@angular/core'

@Component({
  selector: 'app-loading-skeleton',
  templateUrl: './loading-skeleton.component.html',
  styleUrls: ['./loading-skeleton.component.scss'],
})
export class LoadingSkeletonComponent {
  /**
   * Arreglo que contiene índices numéricos utilizados para renderizar múltiples elementos de esqueleto de carga.
   * Cada elemento representa un placeholder visual mientras se cargan los datos reales.
   * El tamaño del arreglo determina la cantidad de placeholders que se mostrarán en la interfaz.
   */
  skeletonItems = Array(5).fill(0).map((_, i) => i);
}
