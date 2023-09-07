import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Result, Usuario } from './tokens-usuarios';

const MAIN_URL = 'http://localhost:3000/';
const GENERAR_TOKEN_USUARIO = 'api/generar-token-usuario';
const USAR_TOKEN = 'api/usar-token';
const LISTAR_USUARIOS = 'api/listar-usuarios';
const LISTAR_TOKENS_USADOS = 'api/listar-tokens-usados';

@Injectable({
  providedIn: 'root'
})
export class TokensUsuariosService {

  constructor(private http: HttpClient) { }

  listarUsuarios(filtro: string = ''): Observable<any>{
    let params = new HttpParams().set('filtro', filtro);
    return this.http.get<Result<Usuario>>(`${MAIN_URL + LISTAR_USUARIOS}`, { params: params});
  }

  generarTokenUsuario(usuario_id: number): Observable<any>{
    let params = new HttpParams().set('usuario_id', usuario_id);

    return this.http.get<Result<Usuario>>(`${MAIN_URL + GENERAR_TOKEN_USUARIO}`, { params: params});
  }

  usarToken(usuario_id: number, token: string): Observable<any>{
    let params = new HttpParams()
    .set('usuario_id', usuario_id)
    .set('token', token);

    return this.http.get<Result<Usuario>>(`${MAIN_URL + USAR_TOKEN}`, { params: params});
  }

  listarTokensUsados(usuario_id: number): Observable<any>{
    let params = new HttpParams().set('usuario_id', usuario_id);

    return this.http.get<Result<any>>(`${MAIN_URL + LISTAR_TOKENS_USADOS}`, { params: params});
  }
}
