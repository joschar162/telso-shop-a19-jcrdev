import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AuthResponse } from '@auth/interfaces/auth-response.interface';
import { User } from '@auth/interfaces/user.interface';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

type AuthStatus = 'checking' | 'authenticated' | 'not-authenticated';
const baseUrl = environment.baseUrl;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _authStatus = signal<AuthStatus>('checking');
  private _user = signal<User | null>(null);
  private _token = signal<string | null>(localStorage.getItem('token'));

  private http = inject(HttpClient);

  checkStatusResource = rxResource({
    loader: () => this.checkStatus(),
  });

  authStatus = computed<AuthStatus>(() => {
    if (this._authStatus() === 'checking') return 'checking';

    if (this._user()) return 'authenticated';

    return 'not-authenticated';
  });

  user = computed<User | null>(() => this._user());
  token = computed<string | null>(this._token);

  login(email: string, password: string): Observable<boolean> {
    return this.http
      .post<AuthResponse>(`${baseUrl}/auth/login`, {
        email,
        password,
        // email:email,
        // password:password,
      })
      .pipe(
        map((resp) => this.handleAuthSuccess(resp)),
        catchError((error: any) => this.handleAuthError(error))
      );
  }

  register(
    fullName: string,
    email: string,
    password: string
  ): Observable<boolean> {
    return this.http
      .post<AuthResponse>(`${baseUrl}/auth/register`, {
        fullName,
        email,
        password,
      })
      .pipe(
        map((resp) => this.handleAuthSuccess(resp)),
        catchError((error: any) => this.handleAuthError(error))
      );
  }

  checkStatus(): Observable<boolean> {
    const token = localStorage.getItem('token');
    if (!token) {
      this.logout();
      return of(false);
    }

    return this.http
      .get<AuthResponse>(`${baseUrl}/auth/check-status`, {
        // headers: {
        //   Authorization: `Bearer ${token}`,
        // },
      })
      .pipe(
        map((resp) => this.handleAuthSuccess(resp)),
        catchError((error: any) => this.handleAuthError(error))
      );
  }

  logout() {
    this._authStatus.set('not-authenticated');
    this._user.set(null);
    this._token.set(null);
    localStorage.removeItem('token');
  }

  private handleAuthSuccess({ token, user }: AuthResponse) {
    this._user.set(user);
    this._authStatus.set('authenticated');
    this._token.set(token);
    localStorage.setItem('token', token);

    return true;
  }

  private handleAuthError(error: any) {
    this.logout();

    // 1. Extraer el mensaje original
    const rawMessage = error.error?.message;
    const messageToProcess = Array.isArray(rawMessage)
      ? rawMessage[0]
      : rawMessage;

    // 1. Validamos por patrones (esto captura cualquier correo)
    if (messageToProcess.includes('already exists')) {
      return throwError(() => 'Este correo electrónico ya está registrado.');
    }
    // 2. Diccionario de traducciones
    const translations: Record<string, string> = {
      'User not found': 'El usuario no existe.',
      'Invalid password': 'La contraseña es incorrecta.',
      'fullName must be longer than or equal to 1 characters':
        'El nombre es obligatorio.',
      // Agrega aquí más errores según los veas en Postman
    };

    // 3. Buscar traducción o usar un error por defecto
    const translatedMessage =
      translations[messageToProcess] ||
      'Ocurrió un error inesperado definitivamente.';

    // 4. Lanzamos el error para que el componente lo atrape
    return throwError(() => translatedMessage);
  }
}
