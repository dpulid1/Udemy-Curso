import { HttpEventType } from '@angular/common/http';
import { Component, OnInit, Input } from '@angular/core';
import { Factura } from 'src/app/facturas/models/factura';
import { FacturaService } from 'src/app/facturas/services/factura.service';
import { AuthService } from 'src/app/usuarios/auth.service';
import swal from 'sweetalert2';
import { Cliente } from '../cliente';
import { ClienteService } from '../cliente.service';
import { ModalService } from './modal.service';
@Component({
  selector: 'detalle-cliente',
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.css']
})
export class DetalleComponent implements OnInit {


  @Input() cliente: Cliente;
  titulo: string = "Detalle del cliente";
  public fotoSeleccionada: File;
  progreso: number = 0;

  constructor(private clienteService: ClienteService,
    public facturaService: FacturaService,
    public authService: AuthService,
    public modalService: ModalService) { }

  ngOnInit() { }

  seleccionarFoto(event) {
    this.fotoSeleccionada = event.target.files[0];
    this.progreso = 0;
    console.log(this.fotoSeleccionada);
    if (this.fotoSeleccionada.type.indexOf('image') < 0) {
      swal('Error seleccionar imagen: ', 'El archivo debe ser del tipo imagen', 'error');
      this.fotoSeleccionada = null;
    }
  }

  subirFoto() {

    if (!this.fotoSeleccionada) {
      swal('Error Upload: ', 'Debe seleccionar una foto', 'error');
    } else {
      this.clienteService.subirFoto(this.fotoSeleccionada, this.cliente.id)
        .subscribe(event => {
          if (event.type === HttpEventType.UploadProgress) {
            this.progreso = Math.round(100 * event.loaded / event.total);
          } else if (event.type === HttpEventType.Response) {
            let response: any = event.body;
            this.cliente = response.cliente as Cliente;

            this.modalService.notificarUpload.emit(this.cliente);
            swal('La foto se ha subido completamente!', response.mensaje, 'success');
          }
        });
    }
  }

  cerrarModal() {
    this.modalService.cerrarModal();
    this.fotoSeleccionada = null;
    this.progreso = 0;
  }

  delete(factura: Factura): void {
    swal({
      title: 'Está seguro?',
      text: `¿Desea eliminar la factura ${factura.descripcion}?`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, eliminar!',
      cancelButtonText: 'No, cancelar!',
      confirmButtonClass: 'btn btn-success',
      cancelButtonClass: 'btn btn-danger',
      buttonsStyling: false,
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        this.facturaService.delete(factura.id).subscribe(
          () => {
            this.cliente.facturas = this.cliente.facturas.filter(f => f !== factura)
            swal(
              'Factura Eliminada!',
              `Factura ${factura.descripcion} eliminada con éxito.`,
              'success'
            )
          }
        )

      }
    });
  }
}
