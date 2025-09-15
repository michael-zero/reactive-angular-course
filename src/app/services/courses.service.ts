import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Course } from "../model/course";
import { map, shareReplay } from "rxjs/operators";
import { Lesson } from "../model/lesson";

@Injectable({
  providedIn: 'root'
})
export class CoursesService{
    constructor(private _http: HttpClient){

    }

    loadCourseById(courseId: number){
       return this._http.get<Course> (`http://localhost:9000/api/courses/${courseId}`)
       .pipe(shareReplay())
    }

   loadAllCoursesLessons(courseId: number){
      return this._http.get<Lesson[]>(`http://localhost:9000/api/lessons`, {
        params: {
          pageSize: "10000",
          courseId: courseId.toString()
        }
      }).pipe(
        map(res => res["payload"]),
        shareReplay()
      )
    }

    loadAllCourses(): Observable<Course[]> {
      return this._http.get<Course[]> ('http://localhost:9000/api/courses')
      .pipe(
        map(res => res["payload"]),
        shareReplay(1), //garantir somente uma inscrição visto que os async no html disparam inscrições e mais requests
      );
    }

    saveCourse(courseId: string, changes: Partial<Course>): Observable<any>{
      return this._http.put(`http://localhost:9000/api/courses/${courseId}`, changes).pipe(
        shareReplay(1)
      )
    }

    searchLessons(search: string): Observable<Lesson[]>{
      return this._http.get<Lesson[]>(`http://localhost:9000/api/lessons`, {
        params: {
          filter: search,
          pageSize: "100"
        }
      }).pipe(
        map(res => res["payload"]),
        shareReplay()
      )
    }
}
