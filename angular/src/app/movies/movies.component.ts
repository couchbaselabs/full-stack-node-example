import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import { Location } from '@angular/common';
import "rxjs/Rx";

@Component({
    selector: 'app-movies',
    templateUrl: './movies.component.html',
    styleUrls: ['./movies.component.css']
})
export class MoviesComponent implements OnInit {

    public movies: any;

    public constructor(private router: Router, private http: Http, private location: Location) {
        this.movies = [];
    }

    public ngOnInit() {
        this.location.subscribe(() => {
            this.refresh();
        });
        this.refresh();
    }

    public refresh(query?: any) {
        let url = "http://localhost:3000/movies";
        if(query && query.target.value) {
            url = "http://localhost:3000/movies/" + query.target.value;
        }
        this.http.get(url)
            .map(result => result.json())
            .subscribe(result => {
                this.movies = result;
            });
    }

    public create() {
        this.router.navigate(["create"]);
    }

}
