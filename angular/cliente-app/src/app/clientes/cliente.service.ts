import { Injectable } from '@angular/core';

import { Cliente } from './cliente';
import { Observable, pipe } from 'rxjs';
import { of, observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import {map, catchError, tap} from 'rxjs/operators';
import swal from 'sweetalert2';
import { Router } from '@angular/router';



@Injectable()
export class ClienteService {
  public urlEndPoint:string='http://localhost:8081/api/clientes';
  public httpHeaders = new HttpHeaders({'Content-Type': 'application/json'})
  constructor(public http: HttpClient, public router: Router) { }

  getClientes(page: number): Observable<any> {
    return this.http.get(this.urlEndPoint + '/page/' + page).pipe(
      tap((response: any) => {
        console.log('ClienteService: tap 1');
        (response.content as Cliente[]).forEach(cliente =>{
          console.log(cliente.nombre);
        });
      }),
      map((response: any) => {      
          (response.content as Cliente[]).map(cliente=> {
          cliente.nombre = cliente.nombre.toUpperCase();
          // let datePipe =new DatePipe('es');
          //cliente.createAt= datePipe.transform(cliente.createAt,'EEEE dd, MMMM, yyyy'); //formatDate(cliente.createAt, 'dd-mm-yyyy', 'es-US')
          return cliente;
        });
        return response;
      }),
      tap(response => {
        console.log('ClienteService: tap 2');
        (response.content as Cliente[]).forEach( cliente =>{
        console.log(cliente.nombre);
        })
      }),
    ); 
    }


    create(cliente:Cliente): Observable<Cliente>{
      return this.http.post(this.urlEndPoint, cliente, {headers: this.httpHeaders}).pipe(
        map((response:any)=>response.cliente as Cliente),
        catchError(e =>{

          if(e.status==400){
            return throwError(e);
          }
          console.error(e.error.mensaje);
          swal(e.error.mensaje, e.error.mensaje, 'error');
          return throwError(e);
        })
      );
    }

    getCliente(id): Observable<Cliente>{
      return this.http.get<Cliente>(`${this.urlEndPoint}/${id}`).pipe(
        catchError(e =>{
          this.router.navigate(['/clientes']);
          console.error(e.error.mensaje);
          swal('Error al editar', e.error.mensaje, 'error');
          return throwError(e);
        })
      );
    }

    update(cliente: Cliente): Observable<Cliente>{
      return this.http.put(`${this.urlEndPoint}/${cliente.id}`, cliente,{headers: this.httpHeaders}).pipe(
        map((response:any)=>response.cliente as Cliente),
        catchError(e =>{

          if(e.status==400){
            return throwError(e);
          }

          console.error(e.error.mensaje);
          swal(e.error.mensaje, e.error.mensaje, 'error');
          return throwError(e);
        })
      );
    }
    
    delete(id: number): Observable<Cliente>{
      return this.http.delete<Cliente>(`${this.urlEndPoint}/${id}`,{headers: this.httpHeaders}).pipe(
        catchError(e =>{
          console.error(e.error.mensaje);
          swal(e.error.mensaje, e.error.mensaje, 'error');
          return throwError(e);
        })
      );
    }

    subirFoto(file: File, id): Observable<Cliente>{
      let formData = new FormData();
      formData.append("file", file);
      formData.append("id", id);
      return this.http.post(`${this.urlEndPoint}/upload`, formData).pipe(
        map((response: any) => response.cliente as Cliente),
        catchError(e =>{
          console.error(e.error.mensaje);
          swal(e.error.mensaje, e.error.mensaje, 'error');
          return throwError(e);
        })
      );

    }
}
 