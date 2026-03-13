import { Injectable } from "@angular/core";
import { environment } from "../../environments/environments";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { LoginRequest, LoginResponse, RegisterRequest, User } from "../models/user.model";
import { HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient){
        this.loadStoredUser();
    }

    private loadStoredUser(): void {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (token && user){
            this.currentUserSubject.next(JSON.parse(user))
        }
    }

    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
            .pipe(
                tap(resp => {
                    localStorage.setItem('token', resp.token);
                    localStorage.setItem('user', JSON.stringify(resp.user))
                    this.currentUserSubject.next(resp.user)
                })
            );
    }

    register(data: RegisterRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/register`, data)
            .pipe(
                tap(resp => {
                    localStorage.setItem('token', resp.token);
                    localStorage.setItem('user', JSON.stringify(resp.user));
                    this.currentUserSubject.next(resp.user)
                })
            );
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user')
        this.currentUserSubject.next(null)
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    isAdmin(): boolean {
        const user = this.currentUserSubject.value;
        return user?.role === 'admin';
    }

    get currentUserValue(): User | null {
        return this.currentUserSubject.value;
    }    
}