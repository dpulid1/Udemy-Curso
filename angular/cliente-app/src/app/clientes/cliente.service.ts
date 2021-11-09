import { Injectable } from '@angular/core';
import { Cliente } from './cliente';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpEvent, HttpHeaders, HttpRequest} from '@angular/common/http';
import {map, catchError, tap} from 'rxjs/operators';
import swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Region } from './Region';
import { AuthService } from '../usuarios/auth.service';



@Injectable()
export class ClienteService {
  public urlEndPoint:string='http://localhost:8081/api/clientes';
  public httpHeaders = new HttpHeaders({'Content-Type': 'application/json'})
  constructor(public http: HttpClient, public router: Router, 
    private authService: AuthService) { }

  private agregarAuthorizationHeader(){
    let token =this.authService.token;
    if (token !=null){
      return this.httpHeaders.append('Authorization', 'Bearer' + token);
      }
      return this.httpHeaders;
  }



  private isNoAutorizado(e): boolean{
    if(e.status==401 || e.statys==403){
      this.router.navigate(['/login'])
return true;
    }
    return false;
  }

  getRegiones(): Observable<Region[]>{
   return this.http.get<Region[]>(this.urlEndPoint+'/regiones', {headers: this.agregarAuthorizationHeader()} ).pipe(
     catchError(e =>{
       this.isNoAutorizado(e);
       return throwError(e);
     })
   );
  }

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
      return this.http.post(this.urlEndPoint, cliente, {headers: this.agregarAuthorizationHeader()}).pipe(
        map((response:any)=>response.cliente as Cliente),
        catchError(e =>{
          
          if(this.isNoAutorizado(e)){
            return throwError(e);
          }

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
      return this.http.get<Cliente>(`${this.urlEndPoint}/${id}`, {headers: this.agregarAuthorizationHeader()}).pipe(
        catchError(e =>{

          if(this.isNoAutorizado(e)){
            return throwError(e);
          }

          this.router.navigate(['/clientes']);
          console.error(e.error.mensaje);
          swal('Error al editar', e.error.mensaje, 'error');
          return throwError(e);
        })
      );
    }

    update(cliente: Cliente): Observable<Cliente>{
      return this.http.put(`${this.urlEndPoint}/${cliente.id}`, cliente,{headers: this.agregarAuthorizationHeader()}).pipe(
        map((response:any)=>response.cliente as Cliente),
        catchError(e =>{

          if(this.isNoAutorizado(e)){
            return throwError(e);
          }

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
      return this.http.delete<Cliente>(`${this.urlEndPoint}/${id}`,{headers: this.agregarAuthorizationHeader()}).pipe(
        catchError(e =>{

          if(this.isNoAutorizado(e)){
            return throwError(e);
          }

          console.error(e.error.mensaje);
          swal(e.error.mensaje, e.error.mensaje, 'error');
          return throwError(e);
        })
      );
    }

    subirFoto(file: File, id): Observable<HttpEvent<{}>> {
      let formData = new FormData();
      formData.append("file", file);
      formData.append("id", id);

      let httpHeaders = new HttpHeaders();
      let token =this.authService.token;
      if(token !=null){
        httpHeaders = httpHeaders.append('Authorization', 'Bearer' + token);
      }
  
      const req = new HttpRequest('POST', `${this.urlEndPoint}/upload`, formData, {
        reportProgress: true,
        headers:httpHeaders
      });
  
      return this.http.request(req).pipe(
        catchError(e =>{
          this.isNoAutorizado(e);
          return throwError(e);
        })
      );
      
    }
}
 