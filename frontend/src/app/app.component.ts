import { Component } from '@angular/core';
import { ApiService } from './api.service';
import { Usuario } from './interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend';

  listaTokensUsados: any[] = [];
  tokenUsuario: Usuario = {
    id: 0,
    nombre: '',
    email: '',
    direccion: '',
    token_id: 0,
    token: '',
    expiracion: ''
  };

  tiempoCaducidadRestante: number = 0;
  intervalo: any;
  filtro: string = '';

  token: boolean = false;
  email: string = '';

  constructor(private apiService: ApiService) {
    const caducidad = localStorage.getItem('caducidad') || 0;
    const id = localStorage.getItem('id') || 0;
    const token = localStorage.getItem('token') || '';
    this.tiempoCaducidadRestante = +caducidad;
    
    if (id === 0) return;

    if (this.tiempoCaducidadRestante > 0) {
      this.token = true;
      this.verToken(+id, token);
      console.log('tiempoCaducidadRestante ', this.tiempoCaducidadRestante);
    } else {
      this.cerrarSesion();
    }
  }

  verToken(usuario_id: number, token: string) {
    this.apiService.usarToken(usuario_id, token).subscribe({
      next: (data) => {
        console.log('usar token ', data);
        if (data.success) {
          this.token = true;
          this.tokenUsuario = data.data[0];
          this.tiempoCaducidadRestante = data.data[0].tiempoCaducidadRestante;
          localStorage.setItem('id', this.tokenUsuario.id.toString());
          localStorage.setItem('token', this.tokenUsuario.token);
          localStorage.setItem('caducidad', this.tiempoCaducidadRestante.toString());
          this.generarConteoCaducidad();
        } else {
          localStorage.clear();
          this.generarTokenUsuario(usuario_id);
        }
      },
      error: (error) => {
        console.log('error aqui ', error);
        this.cerrarSesion();
      }
    });

    this.listarTokensUsados(usuario_id);
  }

  generarTokenUsuario(usuario_id: number) {
    this.apiService.generarTokenUsuario(usuario_id).subscribe({
      next: (data) => {
        if (data.success) {
          this.token = true;
          this.tokenUsuario = data.data[0];
          this.tiempoCaducidadRestante = data.data[0].tiempoCaducidadRestante;
          this.verToken(this.tokenUsuario.id, this.tokenUsuario.token);
        }
      },
      error: (error) => {
        console.log(error);
        this.cerrarSesion();
      }
    });
  }

  listarTokensUsados(usuario_id: number) {
    this.apiService.listarTokensUsados(usuario_id).subscribe({
      next: (data) => {
        if (data.success) {
          this.listaTokensUsados = data.data;
        }
      },
      error: (error) => {
        console.log(error);
        this.cerrarSesion();
      }
    });
  }

  loginUsuario() {
    if (!this.email) return;

    this.apiService.buscarUsuarioPorEmail(this.email).subscribe({
      next: (data) => {
        console.log(data);
        if (!data.success) {
          alert(data.message);
          return;
        }
        localStorage.setItem('email', data.data[0].email);
        this.verToken(data.data[0].id, data.data[0].token);
      },
      error: (error) => {
        console.log(error);
        this.cerrarSesion();
      }
    });
  }

  cerrarSesion() {
    this.token = false;
    localStorage.clear();
  }

  generarConteoCaducidad() {
    this.intervalo = setInterval(() => {
      if (this.tiempoCaducidadRestante > 0) {
        this.tiempoCaducidadRestante--;
        localStorage.setItem('caducidad', this.tiempoCaducidadRestante.toString());
      } else {
        clearInterval(this.intervalo);
        let id = localStorage.getItem('id') || 0;
        let token = localStorage.getItem('token') || '';
        this.verToken(+id, token);
      }
    }, 1000);
  }
}
