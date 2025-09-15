import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of, throwError } from "rxjs";
import { Course, sortCoursesBySeqNo } from "../model/course";
import { catchError, map, shareReplay, tap } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { LoadingService } from "../loading/loading.service";
import { MessageService } from "../messages/messages.service";

@Injectable({
  providedIn: 'root'
})
export class CourseStore{

  private subject = new BehaviorSubject<Course[]>([]);
  courses$: Observable<Course[]> = this.subject.asObservable();

  constructor(private http: HttpClient, private loading: LoadingService,
    private messages: MessageService
  ){
    this.loadAllCourses();
  }

  filterByCategory(category:  string): Observable<Course[]>{
    return this.courses$
    .pipe(
      map(courses => courses.filter(c => c.category === category).sort(sortCoursesBySeqNo))
    );
  }

  loadAllCourses(){
    const loadCourses$ = this.http.get<Course[]>("http://localhost:9000/api/courses")
    .pipe(
      map(response => response['payload']),
      catchError(err => {
        const msg = "Could not load courses";
        this.messages.showErrors(msg);
        console.log(msg, err)
        return throwError(err);
      }),
      tap(courses => this.subject.next(courses))
    )
    this.loading.showLoaderUntilCompleted(loadCourses$).subscribe();
  }

  saveCourse(courseId: string, changes: Partial<Course>): Observable<any>{
    const courses = this.subject.getValue();
    const index = courses.findIndex(c => c.id === courseId);

    const newCourse: Course = {
      ...courses[index],
      ...changes
    }
    const newCourses: Course[] = courses.slice(0);

    newCourses[index] = newCourse;

    this.subject.next(newCourses);

    return this.http.put(`http://localhost:9000/api/courses/${courseId}`, changes)
    .pipe(
       catchError(err => {
        const msg = "Could not save course";
        this.messages.showErrors(msg);
        console.log(msg, err)
        return throwError(err);
      }),
      shareReplay())
  }

}
