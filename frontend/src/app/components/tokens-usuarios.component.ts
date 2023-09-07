import { Component } from '@angular/core';
import { TokensUsuariosService } from './tokens-usuarios.service';
import { Usuario } from './tokens-usuarios';

@Component({
  selector: 'tokens-usuarios',
  templateUrl: './tokens-usuarios.component.html',
  styleUrls: ['./tokens-usuarios.component.css']
})
export class TokensUsuariosComponent {
  showModal: boolean = false;
  listaUsuarios: Usuario[] = [];
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

  resetTokenUsuario: Usuario = {...this.tokenUsuario};

  tiempoCaducidadRestante: number = 0;
  intervalo: any;
  filtro: string = '';

  constructor(private apiService: TokensUsuariosService) {
    this.listarUsuarios();
  }

  listarUsuarios() {
    this.apiService.listarUsuarios(this.filtro).subscribe({
      next: (data) => {
        if (data.success) {
          this.listaUsuarios = data.data;
        }
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  toggleModal() {
    this.showModal = !this.showModal;
  }

  verToken(usuario_id: number, token: string) {
    this.tokenUsuario = {...this.resetTokenUsuario};
    this.toggleModal();
    this.apiService.usarToken(usuario_id, token).subscribe({
      next: (data) => {
        console.log('usar token ', data);
        if (data.success) {
          this.tokenUsuario = data.data[0];
          this.tiempoCaducidadRestante = data.data[0].tiempoCaducidadRestante;
          // this.generarConteoCaducidad();
        } else {
          this.generarTokenUsuario(usuario_id);
        }
      },
      error: (error) => {
        console.log('error aqui ', error);
      }
    });

    this.listarTokensUsados(usuario_id);
  }

  generarTokenUsuario(usuario_id: number) {
    this.apiService.generarTokenUsuario(usuario_id).subscribe({
      next: (data) => {
        if (data.success) {
          this.tokenUsuario = data.data[0];
          this.tiempoCaducidadRestante = data.data[0].tiempoCaducidadRestante;
          this.listarUsuarios();
          // this.generarConteoCaducidad();
        }
      },
      error: (error) => {
        console.log(error);
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
      }
    });
  }

  generarConteoCaducidad() {
    this.intervalo = setInterval(() => {
      if (this.tiempoCaducidadRestante > 0) {
        this.tiempoCaducidadRestante--;
      } else {
        clearInterval(this.intervalo); // Detener el temporizador
      }
    }, 1000);
  }
}
